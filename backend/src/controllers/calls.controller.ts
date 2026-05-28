import { Request, Response } from "express";
import { env } from "../config/env";
import { CallSession } from "../calls/CallSession";
import { sessionRegistry } from "../calls/sessionRegistry";

async function telnyxPost(path: string, body?: Record<string, unknown>): Promise<void> {
  const res = await fetch(`https://api.telnyx.com/v2${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[Telnyx] POST ${path} → ${res.status}:`, text);
  }
}

function streamUrl(req: Request): string {
  if (env.PUBLIC_WEBHOOK_URL) {
    // Replace https:// with wss:// (or http:// with ws://)
    return env.PUBLIC_WEBHOOK_URL.replace(/^https?/, (p) => (p === "https" ? "wss" : "ws")) + "/calls/stream";
  }
  const host = req.headers.host ?? "localhost:3000";
  return `wss://${host}/calls/stream`;
}

export async function handleCallWebhook(req: Request, res: Response): Promise<void> {
  // Acknowledge immediately — Telnyx expects a fast 200
  res.sendStatus(200);

  const event = req.body?.data?.event_type as string | undefined;
  const payload = req.body?.data?.payload as Record<string, unknown> | undefined;
  const callControlId = payload?.call_control_id as string | undefined;

  if (!event || !callControlId) return;

  console.log("[Telnyx webhook]", event, callControlId);

  if (event === "call.initiated") {
    await telnyxPost(`/calls/${callControlId}/actions/answer`);
    return;
  }

  if (event === "call.answered") {
    const session = new CallSession(callControlId);
    sessionRegistry.set(callControlId, session);

    try {
      await session.init(env.BUSINESS_ID);
    } catch (err) {
      console.error("[CallSession init]", err);
      sessionRegistry.delete(callControlId);
      return;
    }

    await telnyxPost(`/calls/${callControlId}/actions/streaming_start`, {
      stream_url: `${streamUrl(req)}?callControlId=${callControlId}`,
      stream_track: "inbound_track",
      codec: "LINEAR16",
      sample_rate: 16000,
    });

    return;
  }

  if (event === "call.hangup") {
    const session = sessionRegistry.get(callControlId);
    if (session) {
      session.end();
      sessionRegistry.delete(callControlId);
    }
    return;
  }
}
