import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryStore, resetMemoryStoreForTests } from "../store/memoryStore";
import { runAudit } from "./runAudit";

const envKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "PERPLEXITY_API_KEY",
] as const;

const previousEnv = new Map<string, string | undefined>();

beforeEach(() => {
  for (const key of envKeys) {
    previousEnv.set(key, process.env[key]);
    delete process.env[key];
  }

  resetMemoryStoreForTests();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-for-test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-for-test";
});

afterEach(() => {
  resetMemoryStoreForTests();

  for (const key of envKeys) {
    const value = previousEnv.get(key);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  previousEnv.clear();
});

describe("runAudit demo fallback", () => {
  it("creates a local demo report when demo-project does not exist yet", async () => {
    const result = await runAudit("demo-project");
    const bundle = await createMemoryStore().getReportBundle("demo-project");

    expect(result.status).toBe("completed");
    expect(bundle?.project.id).toBe("demo-project");
    expect(bundle?.report?.report_json.summary.visibility_score).toBeGreaterThan(0);
  });
});
