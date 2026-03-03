import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminJobUpdateSchema, parseBody } from "@/lib/validation";

function normalizeExpiresAt(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;

  return new Date(parsed).toISOString();
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminJobUpdateSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { jobId, pay, description, expiresAt } = parsed.data;
  const normalizedExpiresAt = normalizeExpiresAt(expiresAt);

  const { error } = await supabaseServer
    .from("jobs")
    .update({
      pay,
      description,
      expires_at: normalizedExpiresAt,
    })
    .eq("id", jobId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseServer
    .from("job_submissions")
    .update({
      pay,
      description,
      expires_at: normalizedExpiresAt,
    })
    .eq("published_job_id", jobId);

  return NextResponse.json({ success: true });
}
