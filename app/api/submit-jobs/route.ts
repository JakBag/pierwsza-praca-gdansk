import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { internalError, requireHeaderSecret, requireRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  const unauthorized = requireHeaderSecret(req, "x-submit-key", "SUBMIT_JOBS_KEY");
  if (unauthorized) return unauthorized;
  const limited = await requireRateLimit(req, "submit-jobs", 20);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const company = String(body.company ?? "").trim();
  const title = String(body.title ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const description = String(body.description ?? "").trim();
  const city = String(body.city ?? "Gdansk").trim();
  const district = String(body.district ?? "").trim();
  const tags = Array.isArray(body.tags)
    ? body.tags
        .map((tag: unknown) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];
  const location = String(body.location ?? "").trim();
  const contractType = String(body.contractType ?? "").trim();
  const timeCommitment = String(body.timeCommitment ?? "").trim();
  const workMode = String(body.workMode ?? "").trim();
  const pay = String(body.pay ?? "").trim();
  const expiresAt = typeof body.expiresAt === "string" && body.expiresAt.trim()
    ? body.expiresAt
    : null;

  if (!company || !title || !contact || !description || !district || !location || !contractType || !timeCommitment || !workMode || !pay) {
    return NextResponse.json({ error: "Brak danych" }, { status: 400 });
  }
  if (!contact.includes("@")) {
    return NextResponse.json({ error: "Niepoprawny email kontaktowy" }, { status: 400 });
  }
  if (!/^\d+$/.test(pay)) {
    return NextResponse.json({ error: "Stawka moze zawierac tylko cyfry" }, { status: 400 });
  }
  if (
    company.length > 120 ||
    title.length > 160 ||
    contact.length > 160 ||
    description.length > 5000 ||
    city.length > 80 ||
    district.length > 80 ||
    location.length > 120
  ) {
    return NextResponse.json({ error: "Za dlugie dane wejsciowe" }, { status: 400 });
  }

  const { error } = await supabaseServer.from("job_submissions").insert({
    company,
    title,
    contact,
    description,
    city,
    district,
    tags,
    status: "pending",
    payment_status: "unpaid",
    location,
    contract_type: contractType,
    time_commitment: timeCommitment,
    work_mode: workMode,
    pay,
    expires_at: expiresAt ?? null,
  });

  if (error) {
    return internalError("submit-jobs insert error", error);
  }

  return NextResponse.json({ ok: true });
}
