import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminSubmissionIdSchema, parseBody } from "@/lib/validation";

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminSubmissionIdSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { submissionId } = parsed.data;

  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("id,published_job_id")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const linkedJobId = String(sub.published_job_id ?? "").trim();
  if (linkedJobId) {
    const { error: jobDeleteErr } = await supabaseServer.from("jobs").delete().eq("id", linkedJobId);
    if (jobDeleteErr) {
      return NextResponse.json({ error: jobDeleteErr.message }, { status: 500 });
    }
  }

  const { error: deleteErr } = await supabaseServer.from("job_submissions").delete().eq("id", submissionId);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
