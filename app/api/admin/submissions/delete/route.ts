import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminSubmissionIdSchema, adminSubmissionIdsSchema, parseBody } from "@/lib/validation";

async function deleteSubmissionById(submissionId: string) {
  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("id,published_job_id")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return { ok: false as const, status: 404, error: "Submission not found" };
  }

  const linkedJobId = String(sub.published_job_id ?? "").trim();
  if (linkedJobId) {
    const { error: jobDeleteErr } = await supabaseServer.from("jobs").delete().eq("id", linkedJobId);
    if (jobDeleteErr) {
      return { ok: false as const, status: 500, error: jobDeleteErr.message };
    }
  }

  const { error: deleteErr } = await supabaseServer.from("job_submissions").delete().eq("id", submissionId);
  if (deleteErr) {
    return { ok: false as const, status: 500, error: deleteErr.message };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const bulkParsed = await parseBody(req.clone(), adminSubmissionIdsSchema);
  if (bulkParsed.ok) {
    for (const submissionId of bulkParsed.data.submissionIds) {
      const result = await deleteSubmissionById(submissionId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }
    return NextResponse.json({ success: true, deleted: bulkParsed.data.submissionIds.length });
  }

  const singleParsed = await parseBody(req, adminSubmissionIdSchema);
  if (!singleParsed.ok) {
    return NextResponse.json({ error: singleParsed.error }, { status: 400 });
  }
  const result = await deleteSubmissionById(singleParsed.data.submissionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, deleted: 1 });
}
