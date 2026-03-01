import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminRequest } from "@/lib/security";

function normalizeExpiresAt(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;

  return new Date(parsed).toISOString();
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (guard) {
    return guard;
  }

  const body = await req.json().catch(() => ({}));
  const jobId = String(body.jobId ?? "").trim();
  const pay = String(body.pay ?? "").trim();
  const description = String(body.description ?? "").trim();
  const expiresAt = normalizeExpiresAt(body.expiresAt);

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  if (!pay || !description) {
    return NextResponse.json({ error: "Missing pay or description" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("jobs")
    .update({
      pay,
      description,
      expires_at: expiresAt,
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
      expires_at: expiresAt,
    })
    .eq("published_job_id", jobId);

  return NextResponse.json({ success: true });
}


