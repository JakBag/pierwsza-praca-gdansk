import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminForwardSchema, parseBody } from "@/lib/validation";

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminForwardSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { applicationId, companyEmailUsed } = parsed.data;

  const { data: app, error: appErr } = await supabaseServer
    .from("applications")
    .select("id,job_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) {
    return NextResponse.json({ error: appErr.message }, { status: 500 });
  }

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  let nextStatus = "forwarded";

  if (!app.job_id) {
    nextStatus = "closed";
  } else {
    const { data: job, error: jobErr } = await supabaseServer
      .from("jobs")
      .select("status")
      .eq("id", app.job_id)
      .maybeSingle();

    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 });
    }

    if ((job?.status ?? "") !== "active") {
      nextStatus = "closed";
    }
  }

  const { error } = await supabaseServer
    .from("applications")
    .update({
      status: nextStatus,
      forwarded_at: new Date().toISOString(),
      company_email_used: companyEmailUsed || null,
    })
    .eq("id", applicationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
