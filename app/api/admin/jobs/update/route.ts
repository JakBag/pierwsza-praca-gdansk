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
  const { jobId, pay, description, expiresAt, isAggregated, hideExpirationDate, externalApplyUrl } = parsed.data;
  const normalizedExpiresAt = normalizeExpiresAt(expiresAt);
  const normalizedExternalApplyUrl = String(externalApplyUrl ?? "").trim() || null;

  const { error } = await supabaseServer
    .from("jobs")
    .update({
      pay: pay || null,
      description: description || null,
      expires_at: normalizedExpiresAt,
      is_aggregated: Boolean(isAggregated),
      hide_expiration_date: Boolean(hideExpirationDate),
      external_apply_url: normalizedExternalApplyUrl,
    })
    .eq("id", jobId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseServer
    .from("job_submissions")
    .update({
      pay: pay || null,
      description: description || null,
      expires_at: normalizedExpiresAt,
      is_aggregated: Boolean(isAggregated),
      hide_expiration_date: Boolean(hideExpirationDate),
      external_apply_url: normalizedExternalApplyUrl,
    })
    .eq("published_job_id", jobId);

  return NextResponse.json({ success: true });
}
