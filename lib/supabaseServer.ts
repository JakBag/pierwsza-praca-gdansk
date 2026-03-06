import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AnySupabaseClient = SupabaseClient;

let cachedClient: AnySupabaseClient | null = null;

function getSupabaseServerClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase envs: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  cachedClient = createClient(url, serviceKey);
  return cachedClient;
}

export const supabaseServer = new Proxy({} as AnySupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseServerClient();
    const value = Reflect.get(client as object, prop, receiver);
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});
