import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  internalError,
  requireAllowedBrowserOrigin,
  requireRateLimit,
  requireSubmissionTiming,
} from "@/lib/security";
import { parseBody, submitJobsBatchSchema } from "@/lib/validation";

type JobPayload = {
  company?: unknown;
  title?: unknown;
  contact?: unknown;
  district?: unknown;
  wants_invoice?: unknown;
  invoice_nip?: unknown;
  promocode?: unknown;
  description?: unknown;
  tags?: unknown;
  city?: unknown;
  location?: unknown;
  contract_type?: unknown;
  time_commitment?: unknown;
  work_mode?: unknown;
  pay?: unknown;
  expires_at?: unknown;
  is_aggregated?: unknown;
  external_apply_url?: unknown;
};

function uuid() {
  return crypto.randomUUID();
}

function toBool(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
}

function normalizeNip(value: unknown) {
  return String(value ?? "").replace(/\D+/g, "");
}

export async function POST(req: Request) {
  const originGuard = requireAllowedBrowserOrigin(req, { requireHeader: true });
  if (originGuard) return originGuard;

  const parsed = await parseBody(req, submitJobsBatchSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const {
    website,
    startedAtMs,
    packageCode,
    packageSize,
    jobs,
  } = parsed.data as {
    website: string;
    startedAtMs: number;
    packageCode: string;
    packageSize: number;
    jobs: JobPayload[];
  };

  if (website) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const timingGuard = requireSubmissionTiming(req, startedAtMs, 1500);
  if (timingGuard) return timingGuard;

  const rateLimit = await requireRateLimit(req, "submit-jobs-batch", 6, 10 * 60, jobs.length);
  if (rateLimit) {
    return rateLimit;
  }

  for (const job of jobs) {
    const wantsInvoice = toBool(job?.wants_invoice);
    const invoiceNip = normalizeNip(job?.invoice_nip);
    if (wantsInvoice && invoiceNip.length !== 10) {
      return NextResponse.json(
        { error: "Jesli chcesz fakture, podaj poprawny NIP (10 cyfr)." },
        { status: 400 }
      );
    }
  }

  const batchId = uuid();

  const rows = jobs.map(job => ({
    batch_id: batchId,
    package_code: packageCode,
    package_size: packageSize,
    status: "pending",
    payment_status: "unpaid",
    company: String(job.company ?? "").trim(),
    title: String(job.title ?? "").trim(),
    contact: String(job.contact ?? "").trim(),
    district: String(job.district ?? "").trim() || null,
    wants_invoice: toBool(job.wants_invoice),
    invoice_nip: toBool(job.wants_invoice) ? normalizeNip(job.invoice_nip) : null,
    promocode: job.promocode ? String(job.promocode).trim() : null,
    description: String(job.description ?? "").trim(),
    tags: Array.isArray(job.tags)
      ? job.tags.map(tag => String(tag).trim()).filter(Boolean)
      : [],
    city: job.city ? String(job.city).trim() : "Gdansk",
    location: job.location ? String(job.location).trim() : null,
    contract_type: job.contract_type ? String(job.contract_type).trim() : null,
    time_commitment: job.time_commitment ? String(job.time_commitment).trim() : null,
    work_mode: job.work_mode ? String(job.work_mode).trim() : null,
    pay: job.pay ? String(job.pay).trim() : null,
    expires_at: job.expires_at ? String(job.expires_at) : null,
    is_aggregated: toBool(job.is_aggregated),
    external_apply_url: job.external_apply_url ? String(job.external_apply_url).trim() : null,
  }));

  const { error } = await supabaseServer.from("job_submissions").insert(rows);
  if (error) {
    return internalError("submit-jobs-batch insert error", error);
  }

  return NextResponse.json({ success: true, batchId });
}
