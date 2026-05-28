import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  TELNYX_API_KEY: z.string().min(1),
  DEEPGRAM_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  CARTESIA_API_KEY: z.string().min(1),
  CARTESIA_VOICE_ID: z.string().min(1),
  BUSINESS_ID: z.string().min(1),
  PUBLIC_WEBHOOK_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
