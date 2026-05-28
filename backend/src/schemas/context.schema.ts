import { z } from "zod";

export const contextTypeSchema = z.enum(["MENU", "HOURS", "FAQ", "CALENDAR", "POLICY", "OTHER"]);

export const createContextSchema = z.object({
  type: contextTypeSchema,
  content: z.string().min(1, "Content is required"),
  metadata: z.record(z.unknown()).optional(),
});

export const updateContextSchema = z.object({
  type: contextTypeSchema.optional(),
  content: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateContextInput = z.infer<typeof createContextSchema>;
export type UpdateContextInput = z.infer<typeof updateContextSchema>;
