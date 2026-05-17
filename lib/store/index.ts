import type { AuditStore } from "./types";
import { createMemoryStore } from "./memoryStore";
import { createSupabaseStore } from "./supabaseStore";

export function getStore(): AuditStore {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseStore();
  }

  return createMemoryStore();
}
