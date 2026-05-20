import { z } from 'zod';

export const testimonialSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorRole: z.string().max(100).nullable().optional(),
  authorCompany: z.string().max(100).nullable().optional(),
  authorAvatarUrl: z.string().url().nullable().optional(),
  quote: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  isApproved: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  authorEmail: z.string().email().nullable().optional(),
}).strict();

export type TestimonialInput = z.infer<typeof testimonialSchema>;
