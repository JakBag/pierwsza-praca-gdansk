import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminApplicationIdSchema, adminApplicationIdsSchema, parseBody } from "@/lib/validation";

async function deleteApplicationById(applicationId: string) {
  const { data: app, error: appErr } = await supabaseServer
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) {
    return { ok: false as const, status: 500, error: appErr.message };
  }
  if (!app) {
    return { ok: false as const, status: 404, error: "Application not found" };
  }

  const { error: deleteErr } = await supabaseServer.from("applications").delete().eq("id", applicationId);
  if (deleteErr) {
    return { ok: false as const, status: 500, error: deleteErr.message };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) return guard;

  const bulkParsed = await parseBody(req.clone(), adminApplicationIdsSchema);
  if (bulkParsed.ok) {
    for (const applicationId of bulkParsed.data.applicationIds) {
      const result = await deleteApplicationById(applicationId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }
    return NextResponse.json({ success: true, deleted: bulkParsed.data.applicationIds.length });
  }

  const singleParsed = await parseBody(req, adminApplicationIdSchema);
  if (!singleParsed.ok) {
    return NextResponse.json({ error: singleParsed.error }, { status: 400 });
  }

  const result = await deleteApplicationById(singleParsed.data.applicationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, deleted: 1 });
}
