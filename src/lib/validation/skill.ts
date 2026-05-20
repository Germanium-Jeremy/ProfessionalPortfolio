import { z } from 'zod';

export const skillSchema = z.object({
  name: z.string().min(1).max(50),
  category: z.enum(['language', 'framework', 'tool', 'devops', 'design', 'soft']),
  level: z.number().int().min(1).max(5).default(3),
  iconKey: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
}).strict();

export type SkillInput = z.infer<typeof skillSchema>;
