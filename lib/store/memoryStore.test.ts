import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryStore } from "./memoryStore";

let testDir = "";

afterEach(() => {
  if (testDir) {
    rmSync(testDir, { recursive: true, force: true });
  }
  delete process.env.LOCAL_AUDIT_STORE_PATH;
});

describe("createMemoryStore local persistence", () => {
  it("keeps projects available across store instances", async () => {
    testDir = mkdtempSync(join(tmpdir(), "b2b-audit-store-"));
    process.env.LOCAL_AUDIT_STORE_PATH = join(testDir, "audit-store.json");

    const firstStore = createMemoryStore();
    const { project } = await firstStore.createProject({
      brandName: "ABC Silicone",
      websiteUrl: "https://example.com",
      industry: "Silicone Kitchenware Manufacturer",
      targetMarket: "US / EU",
      buyerType: "Kitchenware brands",
      mainProducts: ["silicone spatula"],
      competitors: [{ name: "XYZ Silicone" }],
    });

    const secondStore = createMemoryStore();
    const loadedProject = await secondStore.getProject(project.id);
    const loadedCompetitors = await secondStore.getCompetitors(project.id);

    expect(loadedProject?.brand_name).toBe("ABC Silicone");
    expect(loadedCompetitors).toHaveLength(1);
    expect(loadedCompetitors[0]?.name).toBe("XYZ Silicone");
  });
});
