import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1).max(100),
  headline: z.string().min(1).max(200),
  tagline: z.string().max(200).nullable().optional(),
  bio: z.string().max(20000).min(1),
  avatarUrl: z.preprocess((val) => (val === '' ? null : val), z.string().url().nullable().optional()),
  location: z.string().max(100).nullable().optional(),
  availability: z.string().max(100).nullable().optional(),
  resumeUrl: z.preprocess((val) => (val === '' ? null : val), z.string().url().nullable().optional()),
  funFacts: z.array(z.string().max(100)).nullable().optional(),
  legalName: z.string().max(100).nullable().optional(),
  privateNotes: z.string().max(20000).nullable().optional(),
}).strict();

export type ProfileInput = z.infer<typeof profileSchema>;
