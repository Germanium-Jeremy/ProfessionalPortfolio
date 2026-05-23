import { z } from 'zod';

export const settingsSchema = z.object({
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(300).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  sectionOrder: z.array(z.string()).optional(),
  sectionVisibility: z.record(z.string(), z.boolean()).optional(),
  siteTitle: z.string().max(100).optional(),
  siteDescription: z.string().max(500).optional(),
}).strict();

export type SettingsInput = z.infer<typeof settingsSchema>;
