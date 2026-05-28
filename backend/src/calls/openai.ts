import OpenAI from "openai";
import { env } from "../config/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SENTENCE_RE = /[.?!\n]+/;

/**
 * Streams a chat completion and yields complete sentences as they form.
 * Yields one sentence at a time so Cartesia can start speaking before
 * GPT finishes generating.
 */
export async function* streamSentences(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  signal: AbortSignal
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create(
    {
      model: "gpt-4.1-nano",
      messages,
      stream: true,
    },
    { signal }
  );

  let buffer = "";

  for await (const chunk of stream) {
    if (signal.aborted) break;

    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (!delta) continue;

    buffer += delta;

    // Yield every complete sentence
    let match: RegExpExecArray | null;
    while ((match = SENTENCE_RE.exec(buffer)) !== null) {
      const end = match.index + match[0].length;
      const sentence = buffer.slice(0, end).trim();
      buffer = buffer.slice(end);
      if (sentence) yield sentence;
    }
  }

  // Yield any remaining text
  const remaining = buffer.trim();
  if (remaining && !signal.aborted) yield remaining;
}
