import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { generateSystemPrompt } from "../services/systemPrompt.service";
import { createDeepgramWS, DeepgramWS } from "./deepgram";
import { createCartesiaWS, CartesiaWS } from "./cartesia";
import { streamSentences } from "./openai";
import OpenAI from "openai";

export class CallSession {
  private readonly callControlId: string;
  private deepgram: DeepgramWS;
  private cartesia: CartesiaWS;
  private telnyxWs: WebSocket | null = null;

  private systemPrompt = "";
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  private transcriptBuffer = "";

  // Barge-in: cancel inflight LLM + TTS when caller speaks again
  private llmAbort: AbortController | null = null;
  private activeContextId: string | null = null;

  constructor(callControlId: string) {
    this.callControlId = callControlId;
    this.deepgram = createDeepgramWS();
    this.cartesia = createCartesiaWS();

    this.deepgram.on("transcript", ({ transcript, speechFinal }) => {
      this.transcriptBuffer += " " + transcript;
      if (speechFinal) {
        const utterance = this.transcriptBuffer.trim();
        this.transcriptBuffer = "";
        if (utterance) this.onUtterance(utterance);
      }
    });

    this.deepgram.on("error", (err) => console.error("[Deepgram]", err.message));
    this.cartesia.on("error", (err) => console.error("[Cartesia]", err.message));

    this.cartesia.on("chunk", (base64: string, contextId: string) => {
      // Drop chunks from abandoned contexts (barge-in)
      if (contextId !== this.activeContextId) return;
      this.sendAudioToTelnyx(base64);
    });
  }

  /** Load system prompt from DB and store the Telnyx WS once it connects. */
  async init(businessId: string): Promise<void> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { contexts: true },
    });

    if (!business) throw new Error(`Business ${businessId} not found`);

    this.systemPrompt = generateSystemPrompt(business);
    this.conversationHistory = [{ role: "system", content: this.systemPrompt }];
  }

  attachTelnyxWs(ws: WebSocket): void {
    this.telnyxWs = ws;
  }

  handleAudio(base64: string): void {
    const chunk = Buffer.from(base64, "base64");
    this.deepgram.sendAudio(chunk);
  }

  private async onUtterance(text: string): Promise<void> {
    // Barge-in: abort previous LLM generation
    if (this.llmAbort) {
      this.llmAbort.abort();
      this.llmAbort = null;
    }

    // Clear Telnyx audio buffer so the old TTS stops immediately
    this.clearTelnyxAudio();

    this.conversationHistory.push({ role: "user", content: text });

    const abort = new AbortController();
    this.llmAbort = abort;

    const contextId = uuidv4();
    this.activeContextId = contextId;

    const assistantChunks: string[] = [];

    try {
      for await (const sentence of streamSentences(this.conversationHistory, abort.signal)) {
        if (abort.signal.aborted) break;
        assistantChunks.push(sentence);
        this.cartesia.speak(sentence, contextId);
      }

      if (!abort.signal.aborted) {
        this.conversationHistory.push({
          role: "assistant",
          content: assistantChunks.join(" "),
        });
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("[LLM]", err);
      }
    } finally {
      if (this.llmAbort === abort) this.llmAbort = null;
    }
  }

  private sendAudioToTelnyx(base64: string): void {
    if (this.telnyxWs?.readyState === WebSocket.OPEN) {
      this.telnyxWs.send(
        JSON.stringify({
          event: "media",
          media: { payload: base64 },
        })
      );
    }
  }

  private clearTelnyxAudio(): void {
    if (this.telnyxWs?.readyState === WebSocket.OPEN) {
      this.telnyxWs.send(JSON.stringify({ event: "clear" }));
    }
  }

  end(): void {
    this.llmAbort?.abort();
    this.deepgram.close();
    this.cartesia.close();
    this.telnyxWs = null;
  }
}
