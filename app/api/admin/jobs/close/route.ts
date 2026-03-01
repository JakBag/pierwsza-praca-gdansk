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

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("jobs")
    .update({
      status: "closed",
      // Uzywamy expires_at jako znacznik czasu zamkniecia, aby moc usuwac po 10 dniach.
      expires_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: appsErr } = await supabaseServer
    .from("applications")
    .update({ status: "closed" })
    .eq("job_id", jobId)
    .eq("status", "forwarded");

  if (appsErr) {
    return NextResponse.json({ error: appsErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


