import { z } from 'zod';

export const experienceSchema = z.object({
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  companyUrl: z.string().url().nullable().optional(),
  employmentType: z.enum(['Full-time', 'Contract', 'Freelance', 'Internship']).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  startDate: z.string().datetime().or(z.string().pipe(z.coerce.date())).transform(val => typeof val === 'string' ? new Date(val) : val),
  endDate: z.string().datetime().nullable().optional().transform(val => val ? (typeof val === 'string' ? new Date(val) : val) : null),
  description: z.string().max(20000).min(1),
  highlights: z.array(z.string().max(200)).nullable().optional(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  skillIds: z.array(z.string()).optional(),
}).strict();

export type ExperienceInput = z.infer<typeof experienceSchema>;
