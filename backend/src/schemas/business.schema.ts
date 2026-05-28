import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
