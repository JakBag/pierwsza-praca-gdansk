import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminRequest } from "@/lib/security";

async function purgeClosedOffersOlderThan10Days() {
  const tenDaysAgoIso = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

  const { data: staleJobs, error: staleJobsErr } = await supabaseServer
    .from("jobs")
    .select("id")
    .eq("status", "closed")
    .lt("expires_at", tenDaysAgoIso);

  if (staleJobsErr) {
    return staleJobsErr.message;
  }

  const staleJobIds = (staleJobs ?? []).map(row => String(row.id ?? "").trim()).filter(Boolean);
  if (!staleJobIds.length) {
    return null;
  }

  const { error: deleteAppsErr } = await supabaseServer
    .from("applications")
    .delete()
    .in("job_id", staleJobIds);

  if (deleteAppsErr) {
    return deleteAppsErr.message;
  }

  const { error: deleteJobsErr } = await supabaseServer
    .from("jobs")
    .delete()
    .in("id", staleJobIds);

  if (deleteJobsErr) {
    return deleteJobsErr.message;
  }

  return null;
}

export async function GET(req: Request) {
  const guard = await requireAdminRequest(req);
  if (guard) {
    return guard;
  }

  const purgeErr = await purgeClosedOffersOlderThan10Days();
  if (purgeErr) {
    return NextResponse.json({ error: purgeErr }, { status: 500 });
  }

  const url = new URL(req.url);
  const jobId = (url.searchParams.get("jobId") ?? "").trim();
  const status = (url.searchParams.get("status") ?? "").trim(); // new/forwarded/closed

  let q = supabaseServer
    .from("applications")
    .select("id,job_id,first_name,contact,message,rodo,created_at,status,forwarded_at,company_email_used")
    .order("created_at", { ascending: false });

  if (jobId) q = q.eq("job_id", jobId);
  if (status) q = q.eq("status", status);

  const { data: apps, error: appsErr } = await q;
  if (appsErr) {
    return NextResponse.json({ error: appsErr.message }, { status: 500 });
  }

  const jobIds = Array.from(new Set((apps ?? []).map(a => String(a.job_id)).filter(Boolean)));

  const { data: jobs, error: jobsErr } = jobIds.length
    ? await supabaseServer.from("jobs").select("id,title,company,status").in("id", jobIds)
    : { data: [], error: null };

  if (jobsErr) {
    return NextResponse.json({ error: jobsErr.message }, { status: 500 });
  }

  const jobMap = new Map<string, { title: string; company: string; status: string | null }>();
  (jobs ?? []).forEach(j => {
    jobMap.set(String(j.id), {
      title: j.title,
      company: j.company,
      status: j.status ?? null,
    });
  });

  const staleForwardedIds: string[] = [];

  const out = (apps ?? []).map(a => {
    const meta = jobMap.get(String(a.job_id));
    const isForwardedOnInactiveJob = a.status === "forwarded" && (meta?.status ?? "") !== "active";
    if (isForwardedOnInactiveJob) {
      staleForwardedIds.push(String(a.id));
    }
    return {
      ...a,
      status: isForwardedOnInactiveJob ? "closed" : a.status,
      job_title: meta?.title ?? "(oferta nieznana)",
      job_company: meta?.company ?? "",
    };
  });

  if (staleForwardedIds.length) {
    // Samonaprawa starych rekordow: oferty sa nieaktywne, a aplikacje nadal maja status forwarded.
    await supabaseServer
      .from("applications")
      .update({ status: "closed" })
      .in("id", staleForwardedIds)
      .eq("status", "forwarded");
  }

  return NextResponse.json({ data: out });
}


