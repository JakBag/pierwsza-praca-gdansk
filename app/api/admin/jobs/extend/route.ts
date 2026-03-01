import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminRequest } from "@/lib/security";

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (guard) {
    return guard;
  }

  const body = await req.json().catch(() => ({}));
  const jobId = String(body.jobId ?? "").trim();
  const days = Number(body.days ?? 30);
  const extensionDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { data: job, error: jobErr } = await supabaseServer
    .from("jobs")
    .select("id,expires_at,status")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const nowMs = Date.now();
  const currentExpiresMs = Date.parse(String(job.expires_at ?? ""));
  const baseMs = Number.isFinite(currentExpiresMs) && currentExpiresMs > nowMs ? currentExpiresMs : nowMs;
  const nextExpiresAt = new Date(baseMs + extensionDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateErr } = await supabaseServer
    .from("jobs")
    .update({
      expires_at: nextExpiresAt,
      status: "active",
    })
    .eq("id", jobId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await supabaseServer
    .from("job_submissions")
    .update({ expires_at: nextExpiresAt })
    .eq("published_job_id", jobId);

  return NextResponse.json({ success: true, expires_at: nextExpiresAt });
}


