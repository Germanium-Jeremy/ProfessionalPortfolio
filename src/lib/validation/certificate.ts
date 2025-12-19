import { z } from "zod";

export const certificateFileTypes = ["image", "pdf"] as const;

/**
 * Optional text/URL fields arrive as "" from empty HTML inputs.
 * Normalise blanks to null so `.url()` is never applied to an empty string.
 */
const blankToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? null : value), schema);

const optionalText = (max: number) =>
  blankToNull(z.string().trim().max(max).nullable().optional());

const optionalUrl = (max: number) =>
  blankToNull(z.string().trim().url().max(max).nullable().optional());

const optionalDate = () =>
  blankToNull(
    z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Enter a valid date",
      })
      .nullable()
      .optional(),
  );

const certificateFields = {
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(200),
  issuedAt: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Enter a valid date",
    }),
  expiresAt: optionalDate(),
  credentialId: optionalText(120),
  credentialUrl: optionalUrl(500),
  description: optionalText(2000),
  fileUrl: optionalUrl(1000),
  fileType: z.enum(certificateFileTypes).nullable().optional(),
  fileName: optionalText(200),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
};

export const certificateSchema = z
  .object({
    ...certificateFields,
    sortOrder: certificateFields.sortOrder.default(0),
    isVisible: certificateFields.isVisible.default(true),
  })
  .strict();

export type CertificateInput = z.infer<typeof certificateSchema>;

/**
 * Update payloads must not inherit create-time defaults: a PATCH that only
 * toggles `isVisible` must not also reset `sortOrder` (and vice versa).
 */
export const certificateUpdateSchema = z
  .object(certificateFields)
  .partial()
  .strict();

export type CertificateUpdateInput = z.infer<typeof certificateUpdateSchema>;
