import { z } from 'zod';

export const contactSchema = z.object({
  kind: z.enum(['email', 'phone', 'whatsapp', 'linkedin', 'github', 'x', 'discord', 'website', 'youtube', 'other']),
  label: z.string().min(1).max(100),
  iconKey: z.string().max(50).nullable().optional(),
  isPublic: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  value: z.string().min(1).max(500),
}).strict();

export type ContactInput = z.infer<typeof contactSchema>;
