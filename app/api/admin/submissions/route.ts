import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminRequest } from "@/lib/security";

function isMissingColumnError(message: string | null | undefined) {
  const text = String(message ?? "").toLowerCase();
  return text.includes("does not exist") && (
    text.includes("is_aggregated") ||
    text.includes("external_apply_url") ||
    text.includes("hide_expiration_date")
  );
}

function normalizeStatus(status: unknown, publishedJobId: unknown) {
  const raw = String(status ?? "").trim();
  if (raw === "pending" || raw === "approved_unpaid" || raw === "published" || raw === "rejected" || raw === "rejected_unpaid") {
    return raw;
  }
  if (raw === "approved") {
    return String(publishedJobId ?? "").trim() ? "published" : "approved_unpaid";
  }
  return "pending";
}

const AUTO_REJECT_UNPAID_DAYS = 5;

async function autoRejectOverdueUnpaid(now: Date) {
  const cutoffIso = new Date(now.getTime() - AUTO_REJECT_UNPAID_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseServer
    .from("job_submissions")
    .update({ status: "rejected_unpaid" })
    .eq("status", "approved_unpaid")
    .lt("created_at", cutoffIso);

  return { error: error?.message ?? null };
}

async function expireOutdatedJobs(nowIso: string) {
  const { data: jobsToExpire, error: findErr } = await supabaseServer
    .from("jobs")
    .select("id")
    .eq("status", "active")
    .lt("expires_at", nowIso);

  if (findErr) {
    return { error: findErr.message };
  }

  if (!jobsToExpire?.length) {
    return { error: null };
  }

  const { error: expireErr } = await supabaseServer
    .from("jobs")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("expires_at", nowIso);

  if (expireErr) {
    return { error: expireErr.message };
  }

  const expiredIds = jobsToExpire.map(j => String(j.id ?? "").trim()).filter(Boolean);
  if (!expiredIds.length) {
    return { error: null };
  }

  const { error: appsErr } = await supabaseServer
    .from("applications")
    .update({ status: "closed" })
    .in("job_id", expiredIds)
    .eq("status", "forwarded");

  return { error: appsErr?.message ?? null };
}

export async function GET(req: Request) {
  const guard = await requireAdminRequest(req);
  if (guard) {
    return guard;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const { error: expireErr } = await expireOutdatedJobs(nowIso);
  if (expireErr) {
    return NextResponse.json({ error: expireErr }, { status: 500 });
  }
  const { error: autoRejectErr } = await autoRejectOverdueUnpaid(now);
  if (autoRejectErr) {
    return NextResponse.json({ error: autoRejectErr }, { status: 500 });
  }

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();
  const sevenDaysAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseServer
    .from("job_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const submissions = data ?? [];
  const jobIds = Array.from(
    new Set(
      submissions
        .map(s => String(s.published_job_id ?? "").trim())
        .filter(Boolean)
    )
  );

  let jobs: Array<{
    id: string;
    status: string | null;
    expires_at: string | null;
    is_aggregated?: boolean | null;
    hide_expiration_date?: boolean | null;
    external_apply_url?: string | null;
  }> = [];
  let jobsErr: { message: string } | null = null;

  if (jobIds.length) {
    const firstAttempt = await supabaseServer
      .from("jobs")
      .select("id,status,expires_at,is_aggregated,hide_expiration_date,external_apply_url")
      .in("id", jobIds);

    if (firstAttempt.error && isMissingColumnError(firstAttempt.error.message)) {
      const fallbackAttempt = await supabaseServer
        .from("jobs")
        .select("id,status,expires_at")
        .in("id", jobIds);

      jobs = (fallbackAttempt.data ?? []) as typeof jobs;
      jobsErr = fallbackAttempt.error ? { message: fallbackAttempt.error.message } : null;
    } else {
      jobs = (firstAttempt.data ?? []) as typeof jobs;
      jobsErr = firstAttempt.error ? { message: firstAttempt.error.message } : null;
    }
  }

  if (jobsErr) {
    return NextResponse.json({ error: jobsErr.message }, { status: 500 });
  }

  const jobMap = new Map<
    string,
    {
      status: string;
      expires_at: string | null;
      is_aggregated: boolean;
      hide_expiration_date: boolean;
      external_apply_url: string | null;
    }
  >();
  (jobs ?? []).forEach(j =>
    jobMap.set(String(j.id), {
      status: String(j.status ?? ""),
      expires_at: j.expires_at ? String(j.expires_at) : null,
      is_aggregated: Boolean(j.is_aggregated),
      hide_expiration_date: Boolean(j.hide_expiration_date),
      external_apply_url: String(j.external_apply_url ?? "").trim() || null,
    })
  );

  const { data: applicationsForPublishedJobs, error: appsForJobsErr } = jobIds.length
    ? await supabaseServer
        .from("applications")
        .select("job_id,created_at")
        .in("job_id", jobIds)
    : { data: [], error: null };

  if (appsForJobsErr) {
    return NextResponse.json({ error: appsForJobsErr.message }, { status: 500 });
  }

  const { count: newToday, error: newTodayErr } = await supabaseServer
    .from("applications")
    .select("*", { head: true, count: "exact" })
    .gte("created_at", todayStartIso);

  if (newTodayErr) {
    return NextResponse.json({ error: newTodayErr.message }, { status: 500 });
  }

  const { count: last7Days, error: last7DaysErr } = await supabaseServer
    .from("applications")
    .select("*", { head: true, count: "exact" })
    .gte("created_at", sevenDaysAgoIso);

  if (last7DaysErr) {
    return NextResponse.json({ error: last7DaysErr.message }, { status: 500 });
  }

  const { count: expiredJobsCount, error: expiredJobsErr } = await supabaseServer
    .from("jobs")
    .select("*", { head: true, count: "exact" })
    .eq("status", "expired");

  if (expiredJobsErr) {
    return NextResponse.json({ error: expiredJobsErr.message }, { status: 500 });
  }

  const applicationsByJob = new Map<string, { total: number; last7d: number }>();
  (applicationsForPublishedJobs ?? []).forEach(app => {
    const key = String(app.job_id ?? "").trim();
    if (!key) return;

    const current = applicationsByJob.get(key) ?? { total: 0, last7d: 0 };
    current.total += 1;

    const createdAt = Date.parse(String(app.created_at ?? ""));
    if (Number.isFinite(createdAt) && createdAt >= Date.parse(sevenDaysAgoIso)) {
      current.last7d += 1;
    }

    applicationsByJob.set(key, current);
  });

  const enriched = submissions.map(s => ({
    ...s,
    status: normalizeStatus(s.status, s.published_job_id),
    payment_status: s.payment_status ?? "unpaid",
    published_job_status: s.published_job_id ? jobMap.get(String(s.published_job_id))?.status ?? null : null,
    published_job_expires_at: s.published_job_id ? jobMap.get(String(s.published_job_id))?.expires_at ?? null : null,
    is_aggregated: s.published_job_id
      ? jobMap.get(String(s.published_job_id))?.is_aggregated ?? Boolean(s.is_aggregated)
      : Boolean(s.is_aggregated),
    hide_expiration_date: s.published_job_id
      ? jobMap.get(String(s.published_job_id))?.hide_expiration_date ?? Boolean(s.hide_expiration_date)
      : Boolean(s.hide_expiration_date),
    external_apply_url: s.published_job_id
      ? jobMap.get(String(s.published_job_id))?.external_apply_url ?? (String(s.external_apply_url ?? "").trim() || null)
      : (String(s.external_apply_url ?? "").trim() || null),
    applications_count: s.published_job_id
      ? applicationsByJob.get(String(s.published_job_id))?.total ?? 0
      : 0,
    applications_last_7d: s.published_job_id
      ? applicationsByJob.get(String(s.published_job_id))?.last7d ?? 0
      : 0,
  }));

  return NextResponse.json({
    data: enriched,
    nowIso,
    stats: {
      new_today: newToday ?? 0,
      last_7_days: last7Days ?? 0,
      expired_jobs_count: expiredJobsCount ?? 0,
    },
  });
}


