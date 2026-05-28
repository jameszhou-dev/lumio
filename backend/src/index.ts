import "dotenv/config";
import "./config/env";
import http from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { sessionRegistry } from "./calls/sessionRegistry";

const app = createApp();
const server = http.createServer(app);

// WebSocket endpoint — Telnyx opens a connection here per call
const wss = new WebSocketServer({ server, path: "/calls/stream" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url ?? "", `http://localhost`);
  const callControlId = url.searchParams.get("callControlId");

  if (!callControlId) {
    ws.close(1008, "Missing callControlId");
    return;
  }

  const session = sessionRegistry.get(callControlId);
  if (!session) {
    ws.close(1008, "Unknown callControlId");
    return;
  }

  session.attachTelnyxWs(ws);

  ws.on("message", (raw: Buffer) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.event === "media") {
      const payload = (msg.media as { payload?: string } | undefined)?.payload;
      if (payload) session.handleAudio(payload);
    }
  });

  ws.on("close", () => {
    const s = sessionRegistry.get(callControlId);
    if (s) {
      s.end();
      sessionRegistry.delete(callControlId);
    }
  });
});

server.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
