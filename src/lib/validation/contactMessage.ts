import { z } from "zod";

export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    subject: z.string().trim().max(160).optional(),
    message: z.string().trim().min(20).max(5000),
    website: z.string().max(200).optional(),
  })
  .strict();

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
