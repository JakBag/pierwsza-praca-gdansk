import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  internalError,
  requireAllowedBrowserOrigin,
  requireHeaderSecret,
  requireRateLimit,
} from "@/lib/security";
import { parseBody, submitJobsSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const originGuard = requireAllowedBrowserOrigin(req, { requireHeader: true });
  if (originGuard) return originGuard;

  const unauthorized = requireHeaderSecret(req, "x-submit-key", "SUBMIT_JOBS_KEY");
  if (unauthorized) return unauthorized;
  const limited = await requireRateLimit(req, "submit-jobs", 20);
  if (limited) return limited;

  const parsed = await parseBody(req, submitJobsSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const {
    company,
    title,
    contact,
    description,
    city,
    district,
    tags,
    location,
    contractType,
    timeCommitment,
    workMode,
    pay,
    expiresAt,
  } = parsed.data;

  const { error } = await supabaseServer.from("job_submissions").insert({
    company,
    title,
    contact,
    description,
    city: city ?? "Gdansk",
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
