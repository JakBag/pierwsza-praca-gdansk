import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { internalError, requireRateLimit } from "@/lib/security";

type JobPayload = {
  company?: unknown;
  title?: unknown;
  contact?: unknown;
  district?: unknown;
  wants_invoice?: unknown;
  invoice_nip?: unknown;
  description?: unknown;
  tags?: unknown;
  city?: unknown;
  location?: unknown;
  contract_type?: unknown;
  time_commitment?: unknown;
  work_mode?: unknown;
  pay?: unknown;
  expires_at?: unknown;
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
  const body = await req.json().catch(() => ({}));
  const website = String(body.website ?? "").trim();

  const packageCode = String(body.packageCode ?? "").trim();
  const packageSize = Number(body.packageSize ?? 0);
  const jobs = Array.isArray(body.jobs) ? (body.jobs as JobPayload[]) : [];

  if (website) {
    // Honeypot: boty czesto wypelniaja ukryte pola.
    return NextResponse.json({ success: true, ignored: true });
  }

  if (!packageCode || !Number.isFinite(packageSize) || packageSize <= 0) {
    return NextResponse.json({ error: "Niepoprawny pakiet" }, { status: 400 });
  }

  if (jobs.length !== packageSize) {
    return NextResponse.json({ error: "Niepoprawna liczba formularzy" }, { status: 400 });
  }

  const rateLimit = await requireRateLimit(req, "submit-jobs-batch", 6, 10 * 60, jobs.length);
  if (rateLimit) {
    return rateLimit;
  }

  for (const job of jobs) {
    const company = String(job?.company ?? "").trim();
    const title = String(job?.title ?? "").trim();
    const contact = String(job?.contact ?? "").trim();
    const district = String(job?.district ?? "").trim();
    const description = String(job?.description ?? "").trim();
    const pay = String(job?.pay ?? "").trim();
    const wantsInvoice = toBool(job?.wants_invoice);
    const invoiceNip = normalizeNip(job?.invoice_nip);

    if (!company || !title || !contact || !district || !description) {
      return NextResponse.json(
        { error: "Uzupełnij wymagane pola we wszystkich formularzach" },
        { status: 400 }
      );
    }
    if (!contact.includes("@")) {
      return NextResponse.json({ error: "Niepoprawny email kontaktowy" }, { status: 400 });
    }
    if (pay && !/^\d+$/.test(pay)) {
      return NextResponse.json({ error: "Stawka może zawierać tylko cyfry" }, { status: 400 });
    }
    if (wantsInvoice && invoiceNip.length !== 10) {
      return NextResponse.json({ error: "Jesli chcesz fakturę, podaj poprawny NIP (10 cyfr) bez '- "}, { status: 400 });
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
    district: String(job.district ?? "").trim(),
    wants_invoice: toBool(job.wants_invoice),
    invoice_nip: toBool(job.wants_invoice) ? normalizeNip(job.invoice_nip) : null,
    description: String(job.description ?? "").trim(),
    tags: Array.isArray(job.tags)
      ? job.tags.map(tag => String(tag).trim()).filter(Boolean)
      : [],
    city: job.city ? String(job.city).trim() : "Gdansk",
    location: job.location ? String(job.location).trim() : "Gdansk",
    contract_type: job.contract_type ? String(job.contract_type).trim() : null,
    time_commitment: job.time_commitment ? String(job.time_commitment).trim() : null,
    work_mode: job.work_mode ? String(job.work_mode).trim() : null,
    pay: job.pay ? String(job.pay).trim() : null,
    expires_at: job.expires_at ? String(job.expires_at) : null,
  }));

  const { error } = await supabaseServer.from("job_submissions").insert(rows);
  if (error) {
    return internalError("submit-jobs-batch insert error", error);
  }

  return NextResponse.json({ success: true, batchId });
}
