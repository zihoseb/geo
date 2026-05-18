import type { AuditStore } from "./types";
import { createMemoryStore } from "./memoryStore";
import { createSupabaseStore } from "./supabaseStore";

export const DEMO_PROJECT_ID = "demo-project";

export function getStore(projectId?: string): AuditStore {
  if (projectId === DEMO_PROJECT_ID) {
    return createMemoryStore();
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseStore();
  }

  return createMemoryStore();
}
