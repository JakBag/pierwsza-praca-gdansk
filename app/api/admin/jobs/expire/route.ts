import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const now = new Date().toISOString();

  const { data: jobsToExpire, error: findErr } = await supabaseServer
    .from("jobs")
    .select("id")
    .eq("status", "active")
    .lt("expires_at", now);

  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 });
  }

  const { error } = await supabaseServer
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("expires_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const expiredIds = (jobsToExpire ?? []).map(j => String(j.id)).filter(Boolean);
  if (expiredIds.length) {
    const { error: appsErr } = await supabaseServer
      .from("applications")
      .update({ status: "closed" })
      .in("job_id", expiredIds)
      .eq("status", "forwarded");

    if (appsErr) {
      return NextResponse.json({ error: appsErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
