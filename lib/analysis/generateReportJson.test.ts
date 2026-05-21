import { describe, expect, it } from "vitest";
import { generateReportJson } from "./generateReportJson";
import type { AIResult, AuditQuery, CrawledPage } from "@/types/audit";
import type { Competitor, Project } from "@/types/project";

const project: Project = {
  id: "project-1",
  user_id: "demo-user",
  brand_name: "ABC Silicone",
  website_url: "https://example.com",
  industry: "Silicone Kitchenware Manufacturer",
  target_market: "US / EU",
  buyer_type: "Kitchenware brands",
  main_products: ["silicone spatula", "silicone baking mat"],
  status: "analyzing",
  created_at: "2026-05-17T00:00:00.000Z",
  updated_at: "2026-05-17T00:00:00.000Z",
};

const competitors: Competitor[] = [
  { id: "c-1", project_id: "project-1", name: "XYZ Silicone" },
  { id: "c-2", project_id: "project-1", name: "North Star Rubber" },
];

const queries: AuditQuery[] = [
  {
    id: "q-1",
    project_id: "project-1",
    query: "best silicone kitchenware suppliers for US brands",
    intent: "supplier_discovery",
    buyer_stage: "awareness",
  },
  {
    id: "q-2",
    project_id: "project-1",
    query: "compare silicone spatula manufacturers with FDA certificates",
    intent: "comparison",
    buyer_stage: "consideration",
  },
];

const aiResults: AIResult[] = [
  {
    id: "r-1",
    project_id: "project-1",
    query_id: "q-1",
    source: "perplexity",
    answer: "ABC Silicone and XYZ Silicone are both visible.",
    target_brand_mentioned: true,
    mentioned_brands: ["ABC Silicone", "XYZ Silicone"],
    competitors_mentioned: ["XYZ Silicone"],
    citations: [{ title: "Supplier list", url: "https://example.com/list" }],
    sentiment: "positive",
    issues: [],
  },
  {
    id: "r-2",
    project_id: "project-1",
    query_id: "q-2",
    source: "perplexity",
    answer: "XYZ Silicone and North Star Rubber are mentioned more often.",
    target_brand_mentioned: false,
    mentioned_brands: ["XYZ Silicone", "North Star Rubber"],
    competitors_mentioned: ["XYZ Silicone", "North Star Rubber"],
    citations: [],
    sentiment: "not_mentioned",
    issues: ["Target brand missing from comparison answer."],
  },
];

const crawledPages: CrawledPage[] = [
  {
    url: "https://example.com",
    title: "ABC Silicone",
    meta_description: "Silicone kitchenware manufacturer",
    h1: "Silicone kitchenware manufacturer",
    h2: ["Products", "OEM"],
    text_content: "Factory products OEM export markets contact.",
    schema_json: [],
    word_count: 6,
  },
];

describe("generateReportJson", () => {
  it("builds report summary, competitor rates, gaps, pages, and action plan", () => {
    const report = generateReportJson({
      project,
      competitors,
      queries,
      aiResults,
      crawledPages,
      websiteAudit: {
        content_score: 55,
        missing_information: ["MOQ", "Lead time", "Certifications"],
        weak_sections: ["Quality control"],
        recommended_pages: [
          {
            title: "FDA-Compliant Silicone Kitchenware Manufacturer",
            priority: "high",
            reason: "Certification-related queries appear frequently.",
          },
        ],
        recommended_copy_improvements: [],
        priority_actions: [
          {
            priority: "high",
            action: "Publish MOQ and lead-time copy on product pages.",
            expected_impact: "Improves answer eligibility for buyer-intent questions.",
          },
        ],
      },
      technicalScore: 45,
    });

    expect(report.summary.mention_rate).toBe(0.5);
    expect(report.brand_mentions.target_mentions).toBe(1);
    expect(report.brand_mentions.competitors).toEqual([
      { name: "XYZ Silicone", mention_count: 2, mention_rate: 1 },
      { name: "North Star Rubber", mention_count: 1, mention_rate: 0.5 },
    ]);
    expect(report.missing_content).toContain("MOQ");
    expect(report.recommended_pages[0]?.priority).toBe("high");
    expect(report.action_plan).toHaveLength(1);
    expect(report.summary.visibility_score).toBeGreaterThan(0);
    expect(report.summary.score_rationale).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          factor: "Brand mention rate",
          recommendation: expect.any(String),
        }),
      ]),
    );
    expect(report.buyer_queries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          query: "compare silicone spatula manufacturers with FDA certificates",
          mentioned_target: false,
          confidence: expect.any(Number),
          recommendation: expect.any(String),
        }),
      ]),
    );
    expect(report.competitor_comparison[0]).toEqual(
      expect.objectContaining({
        name: "XYZ Silicone",
        mention_count: 2,
        strengths: expect.any(Array),
        recommended_response: expect.any(String),
      }),
    );
    expect(report.website_content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dimension: "MOQ",
          status: "missing",
          recommendation: expect.any(String),
        }),
      ]),
    );
    expect(report.external_trust.length).toBeGreaterThanOrEqual(6);
    expect(report.technical_audit).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          item: "Meta description",
          status: "pass",
        }),
      ]),
    );
    expect(report.visualizations.query_heatmap).toHaveLength(report.buyer_queries.length);
    expect(report.action_plan[0]).toEqual(
      expect.objectContaining({
        owner: expect.any(String),
        timeframe: expect.any(String),
      }),
    );
  });
});
