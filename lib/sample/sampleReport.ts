import type { AuditReportJson } from "@/types/audit";

export const sampleReport: AuditReportJson = {
  summary: {
    visibility_score: 68,
    mention_rate: 0.42,
    competitor_avg_mention_rate: 0.64,
    content_score: 62,
    trust_score: 58,
    technical_score: 70,
  },
  brand_mentions: {
    total_queries: 12,
    target_mentions: 5,
    competitors: [
      { name: "XYZ Silicone", mention_count: 8, mention_rate: 0.67 },
      { name: "North Star Rubber", mention_count: 7, mention_rate: 0.58 },
    ],
  },
  query_results: [
    {
      query: "Which silicone kitchenware suppliers are recommended for US brands?",
      source: "demo",
      target_brand_mentioned: true,
      competitors_mentioned: ["XYZ Silicone"],
      citations: [{ title: "Supplier website", url: "https://example.com" }],
    },
    {
      query: "Compare manufacturers with FDA certifications and OEM support.",
      source: "demo",
      target_brand_mentioned: false,
      competitors_mentioned: ["XYZ Silicone", "North Star Rubber"],
      citations: [],
    },
  ],
  missing_content: ["MOQ", "Lead time", "Certification proof", "Quality control process"],
  recommended_pages: [
    {
      title: "FDA-Compliant Silicone Kitchenware Manufacturer",
      priority: "high",
      reason: "Certification queries appear often, but buyers need a dedicated compliance page.",
    },
  ],
  action_plan: [
    {
      priority: "high",
      action: "Add procurement terms to product pages.",
      expected_impact: "Improves answer eligibility for decision-stage supplier questions.",
    },
  ],
  weak_sections: ["Trust proof", "Factory capacity"],
  recommended_copy_improvements: ["Use direct buyer question headings."],
};
