import { z } from "zod";

const HTML_PATTERN = /<[^>]+>/;

function plainText(label: string, max: number, min = 1) {
  return z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} is too long`)
    .refine(value => !HTML_PATTERN.test(value), `${label} must not contain HTML`);
}

function optionalPlainText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .refine(value => !value || !HTML_PATTERN.test(value), `${label} must not contain HTML`)
    .optional()
    .nullable();
}

function optionalIsoDate(label: string) {
  return z
    .string()
    .trim()
    .refine(value => !value || Number.isFinite(Date.parse(value)), `${label} must be a valid date`)
    .optional()
    .nullable();
}

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request body";
}

export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }
  return { ok: true as const, data: parsed.data };
}

const idSchema = plainText("id", 80);

export const adminLoginSchema = z.object({
  username: plainText("username", 128),
  password: plainText("password", 256),
});

export const applySchema = z.object({
  jobId: idSchema,
  firstName: plainText("firstName", 80),
  contact: plainText("contact", 160),
  message: plainText("message", 2000),
  website: z.string().trim().max(120).optional().default(""),
  startedAtMs: z.number().int().positive(),
  rodo: z.boolean(),
});

const tagsSchema = z
  .array(plainText("tag", 30))
  .max(10, "Too many tags")
  .optional()
  .default([]);

export const submitJobsSchema = z.object({
  company: plainText("company", 120),
  title: plainText("title", 120),
  contact: z.string().trim().email("Invalid contact email").max(160),
  description: plainText("description", 4000),
  city: optionalPlainText("city", 80),
  district: plainText("district", 80),
  tags: tagsSchema,
  location: plainText("location", 120),
  contractType: plainText("contractType", 60),
  timeCommitment: plainText("timeCommitment", 60),
  workMode: plainText("workMode", 60),
  pay: z.string().trim().regex(/^\d+$/, "Pay must contain digits only").max(20),
  expiresAt: optionalIsoDate("expiresAt"),
});

const submitBatchJobSchema = z.object({
  company: plainText("company", 120),
  title: plainText("title", 120),
  contact: z.string().trim().email("Invalid contact email").max(160),
  district: plainText("district", 80),
  wants_invoice: z.boolean().optional().default(false),
  invoice_nip: z.string().trim().max(32).optional().default(""),
  description: plainText("description", 4000),
  tags: tagsSchema,
  city: optionalPlainText("city", 80),
  location: optionalPlainText("location", 120),
  contract_type: optionalPlainText("contract_type", 60),
  time_commitment: optionalPlainText("time_commitment", 60),
  work_mode: optionalPlainText("work_mode", 60),
  pay: z
    .string()
    .trim()
    .max(20, "pay is too long")
    .refine(value => !value || /^\d+$/.test(value), "Pay must contain digits only")
    .optional()
    .default(""),
  expires_at: optionalIsoDate("expires_at"),
});

export const submitJobsBatchSchema = z
  .object({
    website: z.string().trim().max(120).optional().default(""),
    startedAtMs: z.number().int().positive(),
    packageCode: plainText("packageCode", 20),
    packageSize: z.number().int().min(1).max(10),
    jobs: z.array(submitBatchJobSchema).min(1).max(10),
  })
  .superRefine((value, ctx) => {
    if (value.jobs.length !== value.packageSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jobs"],
        message: "packageSize must match jobs length",
      });
    }
  });

export const adminSubmissionIdSchema = z.object({
  submissionId: idSchema,
});

export const adminApproveSchema = z.object({
  submissionId: idSchema,
  pricePln: z.number().int().min(1).max(1000000).optional(),
});

export const adminMarkPaidSchema = z.object({
  submissionId: idSchema,
  invoiceRef: optionalPlainText("invoiceRef", 120),
  durationDays: z.number().int().min(1).max(365).optional().default(30),
});

export const adminRejectSchema = z.object({
  submissionId: idSchema,
  reason: plainText("reason", 1000),
});

export const adminForwardSchema = z.object({
  applicationId: idSchema,
  companyEmailUsed: z.string().trim().max(160).optional().default(""),
});

export const adminJobIdSchema = z.object({
  jobId: idSchema,
});

export const adminJobExtendSchema = z.object({
  jobId: idSchema,
  days: z.number().int().min(1).max(365).optional().default(30),
});

export const adminJobUpdateSchema = z.object({
  jobId: idSchema,
  pay: plainText("pay", 80),
  description: plainText("description", 4000),
  expiresAt: optionalIsoDate("expiresAt"),
});
