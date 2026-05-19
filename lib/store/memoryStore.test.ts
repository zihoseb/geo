import { afterEach, describe, expect, it } from "vitest";
import { createMemoryStore, resetMemoryStoreForTests } from "./memoryStore";

afterEach(() => {
  resetMemoryStoreForTests();
});

describe("createMemoryStore fallback state", () => {
  it("keeps projects available across store instances", async () => {
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
