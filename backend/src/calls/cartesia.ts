import WebSocket from "ws";
import { EventEmitter } from "events";
import { env } from "../config/env";

export interface CartesiaWS extends EventEmitter {
  speak(text: string, contextId: string): void;
  close(): void;
}

/**
 * Creates a persistent Cartesia WebSocket connection.
 * Emits:
 *   "chunk"  (base64: string, contextId: string) — audio chunk ready
 *   "done"   (contextId: string)                 — context finished
 *   "error"  (err: Error)
 *   "close"  ()
 */
export function createCartesiaWS(): CartesiaWS {
  const url = `wss://api.cartesia.ai/tts/websocket?api_key=${env.CARTESIA_API_KEY}&cartesia_version=2024-06-10`;

  const ws = new WebSocket(url);
  const emitter = new EventEmitter() as CartesiaWS;

  ws.on("message", (raw: Buffer) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "chunk") {
      emitter.emit("chunk", msg.data as string, msg.context_id as string);
    } else if (msg.type === "done") {
      emitter.emit("done", msg.context_id as string);
    } else if (msg.type === "error") {
      emitter.emit("error", new Error(String(msg.error ?? "Cartesia error")));
    }
  });

  ws.on("error", (err) => emitter.emit("error", err));
  ws.on("close", () => emitter.emit("close"));

  emitter.speak = (text: string, contextId: string) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        model_id: "sonic-english",
        transcript: text,
        voice: {
          mode: "id",
          id: env.CARTESIA_VOICE_ID,
        },
        context_id: contextId,
        output_format: {
          container: "raw",
          encoding: "pcm_s16le",
          sample_rate: 16000,
        },
        continue: false,
      })
    );
  };

  emitter.close = () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };

  return emitter;
}
