import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryStore } from "../store/memoryStore";
import { runAudit } from "./runAudit";

const envKeys = [
  "LOCAL_AUDIT_STORE_PATH",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "PERPLEXITY_API_KEY",
] as const;

const previousEnv = new Map<string, string | undefined>();
let testDir = "";

beforeEach(() => {
  for (const key of envKeys) {
    previousEnv.set(key, process.env[key]);
    delete process.env[key];
  }

  testDir = mkdtempSync(join(tmpdir(), "b2b-demo-audit-"));
  process.env.LOCAL_AUDIT_STORE_PATH = join(testDir, "audit-store.json");
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-for-test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-for-test";
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
  testDir = "";

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
