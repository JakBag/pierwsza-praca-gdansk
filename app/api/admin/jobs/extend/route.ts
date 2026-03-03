import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminJobExtendSchema, parseBody } from "@/lib/validation";

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminJobExtendSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { jobId, days } = parsed.data;
  const extensionDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;

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
