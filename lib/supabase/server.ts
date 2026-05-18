import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function hasSupabaseServerConfig() {
  const config = getSupabaseServerConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

export function createSupabaseServiceClient() {
  const config = getSupabaseServerConfig();

  if (!config.url || !config.serviceRoleKey) {
    throw new Error(
      [
        "Supabase service credentials are not configured.",
        `NEXT_PUBLIC_SUPABASE_URL=${config.url ? "set" : "missing"}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.anonKey ? "set" : "missing"}`,
        `SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey ? "set" : "missing"}`,
      ].join(" "),
    );
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
