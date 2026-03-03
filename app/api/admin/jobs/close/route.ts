import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminJobIdSchema, parseBody } from "@/lib/validation";

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminJobIdSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { jobId } = parsed.data;

  const { error } = await supabaseServer
    .from("jobs")
    .update({
      status: "closed",
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
