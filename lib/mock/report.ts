import type { AuditReportJson } from "@/types/audit";
import type { Competitor, Project } from "@/types/project";
import type { AuditReport } from "@/types/report";
import type { ReportBundle } from "@/lib/store/types";

function now() {
  return new Date().toISOString();
}

export function buildMockProject(projectId: string): Project {
  const timestamp = now();

  return {
    id: projectId,
    user_id: null,
    brand_name: projectId === "demo-project" ? "Demo B2B Brand" : "Demo Audit Brand",
    website_url: "https://example.com",
    industry: "B2B Export Manufacturer",
    target_market: "US / EU",
    buyer_type: "Procurement teams",
    main_products: ["industrial components", "custom assemblies"],
    status: "completed",
    error_message: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export function buildMockCompetitors(projectId: string): Competitor[] {
  return [
    {
      id: "mock-competitor-a",
      project_id: projectId,
      name: "Competitor A",
      website_url: "https://example.com/competitor-a",
    },
    {
      id: "mock-competitor-b",
      project_id: projectId,
      name: "Competitor B",
      website_url: "https://example.com/competitor-b",
    },
  ];
}

export function buildMockReport(
  projectId: string,
  project: Project = buildMockProject(projectId),
  competitors: Competitor[] = buildMockCompetitors(projectId),
): AuditReportJson {
  const competitorNames = competitors.length
    ? competitors.map((competitor) => competitor.name)
    : ["Competitor A", "Competitor B"];

  return {
    summary: {
      visibility_score: 38,
      mention_rate: 0.12,
      competitor_avg_mention_rate: 0.42,
      content_score: 56,
      trust_score: 30,
      technical_score: 62,
    },
    brand_mentions: {
      total_queries: 20,
      target_mentions: 3,
      competitors: competitorNames.slice(0, 3).map((name, index) => ({
        name,
        mention_count: index === 0 ? 11 : 8,
        mention_rate: index === 0 ? 0.55 : 0.4,
      })),
    },
    query_results: [
      {
        query: `Who are reliable ${project.industry || "B2B"} suppliers for overseas buyers?`,
        source: "mock",
        target_brand_mentioned: false,
        competitors_mentioned: [competitorNames[0] || "Competitor A"],
        citations: [
          {
            title: "Example industry source",
            url: "https://example.com",
          },
        ],
      },
      {
        query: `Which suppliers support OEM and ODM for ${project.buyer_type || "procurement teams"}?`,
        source: "mock",
        target_brand_mentioned: true,
        competitors_mentioned: [competitorNames[1] || "Competitor B"],
        citations: [
          {
            title: "Example supplier directory",
            url: "https://example.com/supplier-directory",
          },
        ],
      },
      {
        query: `How does ${project.brand_name} compare on certifications, MOQ, and lead time?`,
        source: "mock",
        target_brand_mentioned: true,
        competitors_mentioned: competitorNames.slice(0, 2),
        citations: [
          {
            title: `${project.brand_name} website`,
            url: project.website_url,
          },
        ],
      },
    ],
    missing_content: [
      "MOQ information",
      "Lead time",
      "Certifications",
      "OEM / ODM process",
      "Quality control process",
      "Export markets",
      "Case studies",
    ],
    recommended_pages: [
      {
        title: "Certification and Compliance Page",
        priority: "high",
        reason:
          "Buyer queries often mention certifications, but the current website does not provide enough structured certification information.",
      },
      {
        title: "OEM / ODM Process Page",
        priority: "high",
        reason: "AI answers and buyers need clear customization capability information.",
      },
      {
        title: "MOQ and Lead Time Guide",
        priority: "medium",
        reason: "MOQ and lead time are important decision factors for B2B buyers.",
      },
    ],
    action_plan: [
      {
        priority: "high",
        action: "Add certification details to the website.",
        expected_impact: "Improve relevance for certification-related AI buyer queries.",
      },
      {
        priority: "high",
        action: "Create a dedicated OEM / ODM process page.",
        expected_impact: "Help buyers and AI systems understand customization capabilities.",
      },
      {
        priority: "medium",
        action: "Add MOQ, sample lead time, and bulk production lead time to product pages.",
        expected_impact: "Increase buyer trust and improve information extraction.",
      },
    ],
    weak_sections: ["Procurement terms", "Trust proof", "Structured buyer FAQs"],
    recommended_copy_improvements: [
      "Use buyer-question headings such as MOQ, lead time, certifications, OEM, and inspection process.",
      "Add concrete proof points, export regions, and product category pages instead of generic company copy.",
    ],
  };
}

export function buildMockReportRecord(
  projectId: string,
  reportJson = buildMockReport(projectId),
): AuditReport {
  return {
    id: "mock-report",
    project_id: projectId,
    visibility_score: reportJson.summary.visibility_score,
    mention_rate: reportJson.summary.mention_rate,
    competitor_avg_mention_rate: reportJson.summary.competitor_avg_mention_rate,
    content_score: reportJson.summary.content_score,
    trust_score: reportJson.summary.trust_score,
    technical_score: reportJson.summary.technical_score,
    report_json: reportJson,
    public_share_id: "mock-share",
    created_at: now(),
  };
}

export function buildMockReportBundle(
  projectId: string,
  input: {
    project?: Project | null;
    competitors?: Competitor[];
  } = {},
): ReportBundle {
  const project = input.project || buildMockProject(projectId);
  const competitors = input.competitors?.length ? input.competitors : buildMockCompetitors(projectId);
  const reportJson = buildMockReport(projectId, project, competitors);

  return {
    project,
    competitors,
    queries: [],
    aiResults: [],
    crawledPages: [],
    report: buildMockReportRecord(projectId, reportJson),
  };
}
