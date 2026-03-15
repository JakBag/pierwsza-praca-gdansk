import { supabaseServer } from "@/lib/supabaseServer";
import { unstable_noStore as noStore } from "next/cache";

export type DbJob = {
  id: string;
  title: string;
  company: string;
  city: string | null;
  district: string | null;
  tags: string[] | null;
  location: string | null;
  contract_type: string | null;
  time_commitment: string | null;
  work_mode: string | null;
  pay: string | null;
  description: string | null;
  contact: string | null;
  is_aggregated?: boolean | null;
  external_apply_url?: string | null;
  hide_expiration_date?: boolean | null;
  status: string | null;
  expires_at: string | null;
  published: boolean;
  created_at: string;
};

function normalizeCityValue(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function purgeClosedJobsOlderThan10Days() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseServer
    .from("jobs")
    .delete()
    .eq("status", "closed")
    .lt("expires_at", tenDaysAgo);

  if (error) {
    console.error("purgeClosedJobsOlderThan10Days error:", error.message);
  }
}

export async function getPublishedJobs(): Promise<DbJob[]> {
  noStore();
  await purgeClosedJobsOlderThan10Days();
  const now = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedJobs error:", error.message);
    return [];
  }

  return (data ?? []) as DbJob[];
}

export async function getPublishedJobsByCity(city: string): Promise<DbJob[]> {
  const jobs = await getPublishedJobs();
  const expectedCity = normalizeCityValue(city);

  return jobs.filter(job => normalizeCityValue(job.city) === expectedCity);
}

export async function getJobById(id: string): Promise<DbJob | null> {
  noStore();
  await purgeClosedJobsOlderThan10Days();
  const now = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .single();

  if (error) {
    console.error("getJobById error:", error.message);
    return null;
  }

  return data as DbJob;
}
