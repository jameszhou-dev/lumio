import WebSocket from "ws";
import { EventEmitter } from "events";
import { env } from "../config/env";

export interface DeepgramTranscript {
  transcript: string;
  isFinal: boolean;
  speechFinal: boolean;
}

export interface DeepgramWS extends EventEmitter {
  sendAudio(chunk: Buffer): void;
  close(): void;
}

export function createDeepgramWS(): DeepgramWS {
  const url =
    "wss://api.deepgram.com/v1/listen" +
    "?model=nova-3" +
    "&encoding=linear16" +
    "&sample_rate=16000" +
    "&language=en-US" +
    "&smart_format=true" +
    "&interim_results=true" +
    "&utterance_end_ms=1000" +
    "&vad_events=true";

  const ws = new WebSocket(url, {
    headers: { Authorization: `Token ${env.DEEPGRAM_API_KEY}` },
  });

  const emitter = new EventEmitter() as DeepgramWS;

  ws.on("open", () => {
    emitter.emit("open");
  });

  ws.on("message", (raw: Buffer) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "Results") {
      const channel = msg.channel as { alternatives?: { transcript: string }[] } | undefined;
      const transcript = channel?.alternatives?.[0]?.transcript ?? "";
      const isFinal = Boolean(msg.is_final);
      const speechFinal = Boolean(msg.speech_final);

      if (transcript) {
        emitter.emit("transcript", { transcript, isFinal, speechFinal } satisfies DeepgramTranscript);
      }
    } else if (msg.type === "UtteranceEnd") {
      emitter.emit("utteranceEnd");
    } else if (msg.type === "Error") {
      emitter.emit("error", new Error(String(msg.description ?? msg.message ?? "Deepgram error")));
    }
  });

  ws.on("error", (err) => emitter.emit("error", err));
  ws.on("close", () => emitter.emit("close"));

  emitter.sendAudio = (chunk: Buffer) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  };

  emitter.close = () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };

  return emitter;
}
