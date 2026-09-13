import { z } from 'zod';

export const projectLinkSchema = z.object({
  kind: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: z.string().url(),
  isPrimary: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).strict();

export const projectFactSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
}).strict();

export const projectSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  description: z.string().max(20000).nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  gallery: z.array(z.string().url()).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  skillIds: z.array(z.string()).optional(),
  links: z.array(projectLinkSchema).optional(),
  facts: z.array(projectFactSchema).optional(),
}).strict();

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectLinkInput = z.infer<typeof projectLinkSchema>;
export type ProjectFactInput = z.infer<typeof projectFactSchema>;
