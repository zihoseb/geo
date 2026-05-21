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
  const buyerQueries: AuditReportJson["buyer_queries"] = [
    {
      query: `Who are reliable ${project.industry || "B2B"} suppliers for overseas buyers?`,
      intent: "supplier_discovery",
      buyer_stage: "awareness",
      mentioned_target: false,
      competitors_mentioned: [competitorNames[0] || "Competitor A"],
      citations: [{ title: "Example industry source", url: "https://example.com" }],
      confidence: 78,
      visibility_score: 22,
      gap: "The target brand is absent from a supplier-discovery question where competitors are visible.",
      recommendation: "Build a supplier-discovery page with export markets, buyer segments, product categories, and proof points.",
    },
    {
      query: `Which suppliers support OEM and ODM for ${project.buyer_type || "procurement teams"}?`,
      intent: "comparison",
      buyer_stage: "consideration",
      mentioned_target: true,
      competitors_mentioned: [competitorNames[1] || "Competitor B"],
      citations: [{ title: "Example supplier directory", url: "https://example.com/supplier-directory" }],
      confidence: 82,
      visibility_score: 74,
      gap: "The brand appears, but the answer lacks detailed OEM/ODM process proof.",
      recommendation: "Create an OEM/ODM process page covering design input, sampling, tooling, approval, and production.",
    },
    {
      query: `How does ${project.brand_name} compare on certifications, MOQ, and lead time?`,
      intent: "certification",
      buyer_stage: "decision",
      mentioned_target: true,
      competitors_mentioned: competitorNames.slice(0, 2),
      citations: [{ title: `${project.brand_name} website`, url: project.website_url }],
      confidence: 69,
      visibility_score: 61,
      gap: "The brand is visible but procurement terms are not explicit enough for decision-stage answers.",
      recommendation: "Add certification names, MOQ ranges, sample lead time, bulk lead time, and downloadable proof.",
    },
    {
      query: "What are typical MOQ and lead-time requirements for this supplier category?",
      intent: "pricing",
      buyer_stage: "decision",
      mentioned_target: false,
      competitors_mentioned: [competitorNames[0] || "Competitor A"],
      citations: [],
      confidence: 64,
      visibility_score: 18,
      gap: "AI answers cannot confidently cite the brand for pricing and procurement terms.",
      recommendation: "Publish MOQ, sample policy, payment term, tooling fee, and production lead-time guidance.",
    },
    {
      query: "Which suppliers provide strong QC and export documentation support?",
      intent: "quality",
      buyer_stage: "decision",
      mentioned_target: false,
      competitors_mentioned: competitorNames.slice(0, 2),
      citations: [],
      confidence: 66,
      visibility_score: 20,
      gap: "Quality-control and export-documentation signals are too weak compared with competitors.",
      recommendation: "Document QC workflow, inspection standards, test equipment, export documents, and audit readiness.",
    },
  ];
  const websiteContent: AuditReportJson["website_content"] = [
    {
      dimension: "Company information",
      status: "partial",
      completeness_score: 58,
      evidence: "Basic company positioning exists, but factory background and buyer proof are thin.",
      recommendation: "Add factory history, team, production footprint, buyer segments, and procurement contact details.",
      owner: "Content lead",
    },
    {
      dimension: "Product information",
      status: "partial",
      completeness_score: 62,
      evidence: "Product categories are visible, but specifications and buyer-use cases need more depth.",
      recommendation: "Add product specs, materials, packaging, tolerances, use cases, and downloadable spec sheets.",
      owner: "Product manager",
    },
    {
      dimension: "Certifications",
      status: "missing",
      completeness_score: 18,
      evidence: "No clear certification page or certificate proof detected in the mock audit.",
      recommendation: "Publish certification names, scope, test standards, renewal dates, and downloadable files.",
      owner: "Quality manager",
    },
    {
      dimension: "MOQ",
      status: "missing",
      completeness_score: 15,
      evidence: "MOQ information is not stated in a way AI answers can cite.",
      recommendation: "Add MOQ ranges by product category and explain sample orders versus bulk orders.",
      owner: "Sales operations",
    },
    {
      dimension: "Lead time",
      status: "missing",
      completeness_score: 16,
      evidence: "Lead-time details are absent or too generic.",
      recommendation: "State sample lead time, production lead time, and peak-season planning assumptions.",
      owner: "Operations manager",
    },
    {
      dimension: "OEM / ODM",
      status: "partial",
      completeness_score: 48,
      evidence: "Customization is implied but process detail is weak.",
      recommendation: "Create an OEM/ODM workflow page from design input to sampling, approval, and production.",
      owner: "Product manager",
    },
    {
      dimension: "Quality control",
      status: "missing",
      completeness_score: 20,
      evidence: "QC workflow, inspection standards, and test equipment are not sourceable enough.",
      recommendation: "Add inspection steps, AQL/testing standards, defect handling, and shipment approval process.",
      owner: "Quality manager",
    },
    {
      dimension: "Production capacity",
      status: "missing",
      completeness_score: 22,
      evidence: "Capacity and production-line details are not clear.",
      recommendation: "Publish monthly output, equipment, production lines, and scalable order handling details.",
      owner: "Operations manager",
    },
    {
      dimension: "Export markets",
      status: "partial",
      completeness_score: 54,
      evidence: "Export positioning exists, but specific markets and logistics support need more detail.",
      recommendation: "Name priority regions, incoterms, compliance needs, logistics options, and buyer types.",
      owner: "Marketing lead",
    },
    {
      dimension: "Customer cases",
      status: "missing",
      completeness_score: 12,
      evidence: "No case studies or customer outcomes were found.",
      recommendation: "Publish anonymized buyer cases with challenge, solution, timeline, and result.",
      owner: "Marketing lead",
    },
    {
      dimension: "Contact information",
      status: "present",
      completeness_score: 82,
      evidence: "Contact path is available, but RFQ expectations can be clearer.",
      recommendation: "Add RFQ response time, required inquiry fields, and procurement contact options.",
      owner: "Sales operations",
    },
    {
      dimension: "FAQ",
      status: "missing",
      completeness_score: 10,
      evidence: "No procurement FAQ was detected.",
      recommendation: "Add FAQ answers for MOQ, lead time, certificates, samples, customization, and shipping.",
      owner: "Content lead",
    },
  ];
  const externalTrust: AuditReportJson["external_trust"] = [
    {
      source: "LinkedIn company page",
      status: "missing",
      credibility_score: 22,
      evidence: "No LinkedIn signal detected in the mock audit.",
      recommendation: "Create or complete the LinkedIn company page and link it from the website footer.",
    },
    {
      source: "Industry directories",
      status: "partial",
      credibility_score: 52,
      evidence: "Supplier-directory style citation exists, but coverage is shallow.",
      recommendation: "Build consistent profiles on credible industry directories and associations.",
    },
    {
      source: "Third-party media",
      status: "missing",
      credibility_score: 18,
      evidence: "No independent media or trade publication source was found.",
      recommendation: "Secure trade-media mentions, interviews, fair coverage, or expert articles.",
    },
    {
      source: "Reddit / Quora Q&A",
      status: "missing",
      credibility_score: 12,
      evidence: "No community Q&A references were found.",
      recommendation: "Answer supplier-selection questions with neutral, useful guidance and cite owned resources.",
    },
    {
      source: "Reviews and testimonials",
      status: "missing",
      credibility_score: 20,
      evidence: "No review or testimonial proof was detected.",
      recommendation: "Add verified testimonials, buyer quotes, and external review references where appropriate.",
    },
    {
      source: "Video proof",
      status: "missing",
      credibility_score: 16,
      evidence: "No factory tour, QC walkthrough, or product demo video was detected.",
      recommendation: "Publish factory tours, product demos, and QC walkthroughs on YouTube and product pages.",
    },
    {
      source: "B2B platform profiles",
      status: "partial",
      credibility_score: 46,
      evidence: "B2B platform profile opportunity exists but is not deeply connected to owned pages.",
      recommendation: "Align B2B platform profiles with website claims, certificates, and product categories.",
    },
  ];
  const technicalAudit: AuditReportJson["technical_audit"] = [
    {
      item: "Title tag",
      status: "pass",
      impact: "Helps AI and search systems understand the page topic.",
      recommendation: "Keep titles specific to product category, supplier intent, and brand.",
    },
    {
      item: "Meta description",
      status: "warning",
      impact: "Clarifies page value when AI answers summarize website snippets.",
      recommendation: "Rewrite descriptions to include buyer proof such as certificates, MOQ, OEM/ODM, and lead time.",
    },
    {
      item: "H1 / H2 structure",
      status: "warning",
      impact: "Headings help AI systems extract procurement facts by section.",
      recommendation: "Use buyer-question H2s for MOQ, certificates, OEM/ODM, QC, logistics, and FAQ.",
    },
    {
      item: "Canonical URL",
      status: "warning",
      impact: "Reduces duplicate-page ambiguity.",
      recommendation: "Add canonical tags to product, category, and guide pages.",
    },
    {
      item: "Schema markup",
      status: "fail",
      impact: "Structured data improves machine-readable organization, product, and FAQ facts.",
      recommendation: "Add Organization, Product, FAQPage, BreadcrumbList, and Article schema.",
    },
    {
      item: "Sitemap",
      status: "warning",
      impact: "Improves discovery of product, certification, and FAQ pages.",
      recommendation: "Publish XML sitemap and include all procurement-intent content pages.",
    },
    {
      item: "Robots.txt",
      status: "warning",
      impact: "Robots rules can block important pages from crawlers.",
      recommendation: "Verify robots.txt allows product, guide, FAQ, and certification pages.",
    },
  ];
  const actionPlan: AuditReportJson["action_plan"] = [
    {
      priority: "high",
      action: "Add a certification and compliance page with downloadable proof.",
      expected_impact: "Improves trust for certification-related buyer queries and gives AI answers a sourceable page.",
      owner: "Quality manager",
      timeframe: "Week 1",
      source_module: "Website Content Audit",
    },
    {
      priority: "high",
      action: "Publish MOQ, sample policy, bulk lead time, and payment-term guidance.",
      expected_impact: "Improves answer accuracy for pricing and procurement-term questions.",
      owner: "Product manager",
      timeframe: "Week 1",
      source_module: "Buyer Queries Analysis",
    },
    {
      priority: "high",
      action: "Create an OEM/ODM process page with step-by-step workflow and quality gates.",
      expected_impact: "Helps buyers and AI systems understand customization capability.",
      owner: "Product manager",
      timeframe: "Week 2",
      source_module: "Website Content Audit",
    },
    {
      priority: "medium",
      action: "Add QC workflow, inspection standards, and export documentation support.",
      expected_impact: "Reduces competitor advantage in quality and risk-check queries.",
      owner: "Quality manager",
      timeframe: "Week 3",
      source_module: "Competitor Comparison",
    },
    {
      priority: "medium",
      action: "Build LinkedIn, directory, video, and testimonial trust signals.",
      expected_impact: "Improves external corroboration and citation diversity.",
      owner: "Marketing lead",
      timeframe: "Week 4",
      source_module: "External Trust & References",
    },
  ];

  return {
    summary: {
      visibility_score: 38,
      mention_rate: 0.12,
      competitor_avg_mention_rate: 0.42,
      content_score: 56,
      trust_score: 30,
      technical_score: 62,
      core_missing_information: ["Certifications", "MOQ", "Lead time", "Quality control", "Customer cases"],
      high_priority_actions: actionPlan.filter((item) => item.priority === "high").map((item) => item.action),
      score_rationale: [
        {
          factor: "Brand mention rate",
          score: 12,
          reason: "The target brand appears in only 3 of 20 simulated buyer queries.",
          recommendation: "Create buyer-intent pages for supplier discovery, certification, MOQ, and comparison queries.",
        },
        {
          factor: "Competitor pressure",
          score: 58,
          reason: "Competitors average 42% mention rate and appear in high-intent supplier questions.",
          recommendation: "Publish comparison and proof pages that close certification, process, and trust gaps.",
        },
        {
          factor: "Website content coverage",
          score: 56,
          reason: "Core product positioning exists, but procurement-critical details are incomplete.",
          recommendation: "Prioritize certifications, MOQ, lead time, QC, OEM/ODM workflow, and FAQ coverage.",
        },
        {
          factor: "Technical extractability",
          score: 62,
          reason: "Basic page structure exists, but schema and procurement-specific metadata need work.",
          recommendation: "Add schema, canonical tags, structured H2 sections, sitemap coverage, and robots verification.",
        },
      ],
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
      ...buyerQueries.map((query) => ({
        query: query.query,
        source: "mock",
        target_brand_mentioned: query.mentioned_target,
        competitors_mentioned: query.competitors_mentioned,
        citations: query.citations,
      })),
    ],
    buyer_queries: buyerQueries,
    competitor_comparison: competitorNames.slice(0, 3).map((name, index) => ({
      name,
      mention_count: index === 0 ? 11 : 8,
      mention_rate: index === 0 ? 0.55 : 0.4,
      average_position: index === 0 ? 1.8 : 2.4,
      strengths: [
        "Appears in AI buyer answers more frequently than the target brand.",
        "Has clearer trust or procurement signals in simulated answers.",
      ],
      gaps_vs_target: [
        "Target brand lacks sourceable details for certification, MOQ, lead time, and QC.",
        "Target pages need more comparison-ready claims and third-party references.",
      ],
      recommended_response: `Create content that compares ${project.brand_name} with ${name} on certifications, MOQ, OEM/ODM, QC, lead time, and export support.`,
      evidence: ["https://example.com", "https://example.com/supplier-directory"],
    })),
    website_content: websiteContent,
    external_trust: externalTrust,
    technical_audit: technicalAudit,
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
    action_plan: actionPlan,
    weak_sections: ["Procurement terms", "Trust proof", "Structured buyer FAQs"],
    recommended_copy_improvements: [
      "Use buyer-question headings such as MOQ, lead time, certifications, OEM, and inspection process.",
      "Add concrete proof points, export regions, and product category pages instead of generic company copy.",
    ],
    visualizations: {
      query_heatmap: buyerQueries.map((query) => ({
        label: query.query,
        intent: query.intent,
        score: query.visibility_score,
        status: query.mentioned_target ? "visible" : query.visibility_score < 35 ? "missing" : "weak",
      })),
      competitor_bars: [
        { name: project.brand_name, mention_rate: 0.12 },
        ...competitorNames.slice(0, 3).map((name, index) => ({
          name,
          mention_rate: index === 0 ? 0.55 : 0.4,
        })),
      ],
      content_radar: websiteContent.map((item) => ({
        dimension: item.dimension,
        score: item.completeness_score,
      })),
      trust_matrix: externalTrust.map((item) => ({
        source: item.source,
        score: item.credibility_score,
      })),
    },
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
