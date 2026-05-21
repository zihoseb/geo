import { buildMockReport, buildMockProject, buildMockCompetitors } from "@/lib/mock/report";
import type { AuditReportJson } from "@/types/audit";

const sampleProject = {
  ...buildMockProject("sample-project"),
  brand_name: "ABC Silicone",
  website_url: "https://example.com",
  industry: "Silicone Kitchenware Manufacturer",
  buyer_type: "Kitchenware brands",
  main_products: ["silicone spatula", "silicone baking mat"],
};

export const sampleReport: AuditReportJson = buildMockReport(
  sampleProject.id,
  sampleProject,
  buildMockCompetitors(sampleProject.id),
);
