import type {
  AuditQuery,
  AuditReportJson,
  BuyerIntent,
  BuyerStage,
  CrawledPage,
  WebsiteCrawlStatus,
} from "@/types/audit";
import type { Competitor, Project } from "@/types/project";

type CoverageStatus = "present" | "partial" | "missing";

const CONTENT_CHECKS: {
  key: string;
  label: string;
  affected_metric: string;
  present: RegExp;
  partial: RegExp;
  recommendation: (input: BaselineContext) => string;
}[] = [
  {
    key: "company_identity",
    label: "Company identity",
    affected_metric: "Entity Understanding",
    present: /about|factory|manufacturer|established|company profile|who we are/i,
    partial: /professional|trusted|reliable|team|service/i,
    recommendation: ({ industry }) => `Add a clear ${industry} company profile with factory background, buyer segments, and procurement contact details.`,
  },
  {
    key: "product_categories",
    label: "Product categories",
    affected_metric: "Product Relevance",
    present: /product|catalog|category|specification|material|model/i,
    partial: /solution|application|custom|range/i,
    recommendation: ({ product }) => `Create product pages for ${product} with specifications, materials, packaging, use cases, and downloadable spec sheets.`,
  },
  {
    key: "certifications",
    label: "Certifications",
    affected_metric: "Certification Query Answerability",
    present: /iso|fda|ce|lfgb|rohs|sgs|certification|certified|compliance|certificate|standard/i,
    partial: /quality|safe|approved|standard/i,
    recommendation: ({ industry }) => `Publish a ${industry} certification and compliance page with certificate names, scope, dates, and downloadable proof.`,
  },
  {
    key: "moq",
    label: "MOQ",
    affected_metric: "Buyer Decision Info Coverage",
    present: /\bmoq\b|minimum order quantity|minimum order|low moq|order quantity/i,
    partial: /order|sample|bulk/i,
    recommendation: ({ product }) => `Add MOQ ranges for ${product}, including sample orders, bulk orders, and custom-order thresholds.`,
  },
  {
    key: "lead_time",
    label: "Lead time",
    affected_metric: "Buyer Decision Info Coverage",
    present: /lead time|delivery time|production time|sample time|shipping time|7 days|15 days|30 days|45 days/i,
    partial: /fast delivery|quick delivery|on time|timely/i,
    recommendation: () => "State sample lead time, bulk production lead time, and delivery assumptions by order type.",
  },
  {
    key: "oem_odm",
    label: "OEM / ODM",
    affected_metric: "Customization Question Answerability",
    present: /\boem\b|\bodm\b|private label|customization|custom packaging|custom logo|custom design/i,
    partial: /custom|tailor|personalized/i,
    recommendation: ({ industry, targetMarket }) => `Create an OEM / ODM ${industry} supplier page for ${targetMarket} buyers with process steps and examples.`,
  },
  {
    key: "quality_control",
    label: "Quality control",
    affected_metric: "Quality Trust Evidence",
    present: /quality control|\bqc\b|inspection|testing|quality assurance|defect rate|incoming inspection|final inspection/i,
    partial: /high quality|strict quality|quality service/i,
    recommendation: ({ industry }) => `Explain how you control quality for ${industry} products, including inspection steps, standards, and shipment approval.`,
  },
  {
    key: "production_capacity",
    label: "Production capacity",
    affected_metric: "Supplier Scale Evidence",
    present: /production capacity|monthly capacity|annual capacity|factory size|production line|workers|machines|output/i,
    partial: /factory|equipment|workshop|production/i,
    recommendation: () => "Add production capacity, equipment, factory size, monthly output, and scalability details.",
  },
  {
    key: "export_markets",
    label: "Export markets",
    affected_metric: "Market Relevance",
    present: /export|usa|u\.s\.|europe|eu|uk|canada|australia|japan|market|international/i,
    partial: /global|overseas|worldwide/i,
    recommendation: ({ targetMarket }) => `Add export-market pages or sections for ${targetMarket}, including compliance and logistics support.`,
  },
  {
    key: "case_studies",
    label: "Case studies",
    affected_metric: "Trust Evidence",
    present: /case study|client case|customer case|success story|brand partner/i,
    partial: /project|client|customer|partner/i,
    recommendation: () => "Publish customer cases or anonymized project examples with challenge, solution, timeline, and result.",
  },
  {
    key: "faq",
    label: "FAQ",
    affected_metric: "Question Answerability",
    present: /\bfaq\b|frequently asked questions|q&a/i,
    partial: /questions|help|support/i,
    recommendation: () => "Add a procurement FAQ covering MOQ, lead time, certificates, samples, customization, and shipping.",
  },
  {
    key: "contact_information",
    label: "Contact information",
    affected_metric: "Conversion Readiness",
    present: /email|phone|contact|address|whatsapp|inquiry|quote|quotation/i,
    partial: /message|form|get in touch/i,
    recommendation: () => "Make RFQ contact paths explicit and add expected response time and required inquiry fields.",
  },
];

interface BaselineContext {
  brand: string;
  industry: string;
  targetMarket: string;
  buyerType: string;
  product: string;
  products: string[];
}

function clean(input?: string) {
  return input?.trim() || "";
}

function createContext(project: Project): BaselineContext {
  const products = project.main_products?.filter(Boolean) || [];
  return {
    brand: project.brand_name,
    industry: clean(project.industry) || "B2B supplier",
    targetMarket: clean(project.target_market) || "target market",
    buyerType: clean(project.buyer_type) || "buyers",
    product: products[0] || clean(project.industry) || "core products",
    products,
  };
}

export function generateBaselineBuyerQueries(project: Project): AuditQuery[] {
  const context = createContext(project);
  const secondaryProduct = context.products[1] || context.product;
  const templates: { query: string; intent: BuyerIntent; buyer_stage: BuyerStage; related_metric: string }[] = [
    {
      query: `Which ${context.industry} suppliers support OEM for ${context.targetMarket} ${context.buyerType}?`,
      intent: "supplier_discovery",
      buyer_stage: "awareness",
      related_metric: "Supplier Discovery Coverage",
    },
    {
      query: `How does ${context.brand} compare with other ${context.industry} suppliers?`,
      intent: "comparison",
      buyer_stage: "consideration",
      related_metric: "Competitor Comparison Readiness",
    },
    {
      query: `What certifications should buyers check when choosing a ${context.industry} supplier?`,
      intent: "certification",
      buyer_stage: "consideration",
      related_metric: "Certification Query Answerability",
    },
    {
      query: `What is the typical MOQ and lead time for ${context.product} suppliers?`,
      intent: "pricing",
      buyer_stage: "decision",
      related_metric: "Buyer Decision Info Coverage",
    },
    {
      query: `Which ${context.industry} suppliers provide quality control documentation for ${context.product}?`,
      intent: "quality",
      buyer_stage: "decision",
      related_metric: "Quality Trust Evidence",
    },
    {
      query: `Can ${context.industry} suppliers ship ${context.product} to ${context.targetMarket}?`,
      intent: "logistics",
      buyer_stage: "consideration",
      related_metric: "Market Relevance",
    },
    {
      query: `What risks should ${context.buyerType} check before choosing a ${context.industry} supplier?`,
      intent: "risk_check",
      buyer_stage: "decision",
      related_metric: "Risk Reduction Evidence",
    },
    {
      query: `Which suppliers offer private label or custom packaging for ${secondaryProduct}?`,
      intent: "customization",
      buyer_stage: "consideration",
      related_metric: "Customization Question Answerability",
    },
    {
      query: `What production capacity should ${context.targetMarket} buyers expect from ${context.industry} suppliers?`,
      intent: "supplier_discovery",
      buyer_stage: "consideration",
      related_metric: "Supplier Scale Evidence",
    },
    {
      query: `Which ${context.industry} suppliers have customer cases for ${context.product}?`,
      intent: "comparison",
      buyer_stage: "decision",
      related_metric: "Trust Evidence",
    },
  ];

  return templates.map(({ related_metric: _relatedMetric, ...query }) => query);
}

function textCorpus(pages: CrawledPage[]) {
  return pages
    .map((page) => [page.title, page.meta_description, page.h1, page.h2?.join(" "), page.text_content].filter(Boolean).join(" "))
    .join("\n")
    .slice(0, 50000);
}

function evidenceFor(pattern: RegExp, pages: CrawledPage[]) {
  const evidence: string[] = [];
  for (const page of pages) {
    const match = page.text_content.match(pattern);
    if (match) {
      evidence.push(`${page.url}: ${match[0]}`);
    }
    if (evidence.length >= 3) break;
  }
  return evidence;
}

function analyzeContentCoverage(project: Project, pages: CrawledPage[]) {
  const context = createContext(project);
  const corpus = textCorpus(pages);

  return CONTENT_CHECKS.map((check) => {
    const fullEvidence = evidenceFor(check.present, pages);
    const partialEvidence = fullEvidence.length ? [] : evidenceFor(check.partial, pages);
    const status: CoverageStatus = fullEvidence.length ? "present" : partialEvidence.length ? "partial" : "missing";

    return {
      key: check.key,
      label: check.label,
      dimension: check.label,
      status,
      completeness_score: status === "present" ? 88 : status === "partial" ? 48 : 12,
      evidence:
        fullEvidence.length || partialEvidence.length
          ? [...fullEvidence, ...partialEvidence]
          : [`No clear ${check.label.toLowerCase()} evidence found in ${corpus ? "crawled text" : "fallback text"}.`],
      recommendation: check.recommendation(context),
      owner: ownerForMetric(check.affected_metric),
      affected_metric: check.affected_metric,
    };
  });
}

function ownerForMetric(metric: string) {
  if (/certification|quality/i.test(metric)) return "Quality manager";
  if (/decision|product|customization/i.test(metric)) return "Product manager";
  if (/conversion|supplier/i.test(metric)) return "Sales operations";
  return "Content lead";
}

function generateRecommendedPages(project: Project, contentCoverage: ReturnType<typeof analyzeContentCoverage>) {
  const context = createContext(project);
  const gaps = contentCoverage.filter((item) => item.status !== "present");
  const pages = [];

  if (gaps.some((item) => item.key === "certifications")) {
    pages.push({
      title: `${context.industry} Certification and Compliance Guide`,
      priority: "high" as const,
      reason: "Certification-related buyer questions are important, but the website does not clearly explain certificates or compliance.",
      affected_metric: "Certification Query Answerability",
    });
  }

  if (gaps.some((item) => item.key === "oem_odm")) {
    pages.push({
      title: `OEM / ODM ${context.industry} Supplier for ${context.targetMarket} Buyers`,
      priority: "high" as const,
      reason: "Buyers often ask whether suppliers support customization, private label, and packaging options.",
      affected_metric: "Customization Question Answerability",
    });
  }

  if (gaps.some((item) => item.key === "moq" || item.key === "lead_time")) {
    pages.push({
      title: `${context.product} MOQ and Lead Time Guide`,
      priority: "high" as const,
      reason: "MOQ and lead time are important buyer decision factors, but the website does not clearly provide them.",
      affected_metric: "Buyer Decision Info Coverage",
    });
  }

  if (gaps.some((item) => item.key === "quality_control")) {
    pages.push({
      title: `How We Control Quality for ${context.industry} Products`,
      priority: "medium" as const,
      reason: "Quality control information helps buyers and AI systems understand supplier reliability.",
      affected_metric: "Quality Trust Evidence",
    });
  }

  if (gaps.some((item) => item.key === "case_studies")) {
    pages.push({
      title: `${context.industry} Customer Cases for ${context.targetMarket} Buyers`,
      priority: "medium" as const,
      reason: "Customer cases create sourceable proof that reduces risk in supplier-selection queries.",
      affected_metric: "Trust Evidence",
    });
  }

  return pages.slice(0, 6);
}

function extractExternalEvidence(pages: CrawledPage[]): AuditReportJson["external_evidence"] {
  const sameAsLinks = Array.from(new Set(pages.flatMap((page) => page.same_as_links || [])));
  const externalIdentityLinks = Array.from(new Set(pages.flatMap((page) => page.external_links || []))).filter((url) =>
    /linkedin|alibaba|youtube|facebook|instagram|made-in-china|globalsources|thomasnet|europages|directory/i.test(url),
  );

  const candidates = [
    ...sameAsLinks.map((url) => ({
      platform: platformName(url),
      url,
      source: "schema_sameAs" as const,
    })),
    ...externalIdentityLinks.map((url) => ({
      platform: platformName(url),
      url,
      source: "website_link" as const,
    })),
  ];

  return {
    external_evidence_mode: candidates.length ? "website_links_only" : "not_connected",
    external_search_connected: false,
    same_as_links: sameAsLinks,
    external_identity_links: externalIdentityLinks,
    entity_evidence_candidates: candidates,
    note: "External evidence search is not connected yet. This section currently checks only website-provided external identity links and structured data.",
  };
}

function platformName(url: string) {
  if (/linkedin/i.test(url)) return "LinkedIn";
  if (/alibaba/i.test(url)) return "Alibaba";
  if (/youtube/i.test(url)) return "YouTube";
  if (/facebook/i.test(url)) return "Facebook";
  if (/made-in-china/i.test(url)) return "Made-in-China";
  if (/globalsources/i.test(url)) return "Global Sources";
  if (/thomasnet/i.test(url)) return "Thomasnet";
  if (/europages/i.test(url)) return "Europages";
  return "External website";
}

function createActionPlan(input: {
  project: Project;
  crawlStatus: WebsiteCrawlStatus;
  contentCoverage: ReturnType<typeof analyzeContentCoverage>;
  competitors: Competitor[];
  externalEvidence: AuditReportJson["external_evidence"];
}) {
  const gaps = input.contentCoverage.filter((item) => item.status !== "present");
  const actions = gaps.slice(0, 5).map((gap, index) => ({
    priority: (gap.status === "missing" && index < 3 ? "high" : "medium") as "high" | "medium" | "low",
    action: `Improve ${gap.label.toLowerCase()} coverage on the website.`,
    reason: `The website crawl marked ${gap.label} as ${gap.status}.`,
    affected_metric: gap.affected_metric,
    implementation_steps: [
      gap.recommendation,
      "Add examples, numbers, or proof where possible.",
      "Link the new section from relevant product and navigation pages.",
    ],
    verification_method: `Re-run the audit and check whether ${gap.label} changes from ${gap.status} to present.`,
    expected_impact: `Improves ${gap.affected_metric}.`,
    owner: gap.owner,
    timeframe: `Week ${Math.min(index + 1, 4)}`,
    source_module: "Website Content Audit",
  }));

  if (input.crawlStatus.status === "failed") {
    actions.unshift({
      priority: "high",
      action: "Fix website crawlability for the submitted URL.",
      reason: input.crawlStatus.crawl_error || "The crawler could not read the website.",
      affected_metric: "Website Crawlability",
      implementation_steps: [
        "Confirm the submitted URL returns public HTML.",
        "Check bot blocking, redirects, SSL, and server timeout rules.",
        "Re-run the audit after the homepage can be fetched.",
      ],
      verification_method: "Re-run the audit and confirm website crawl status changes to success or partial.",
      expected_impact: "Allows the report to use real website content instead of fallback analysis.",
      owner: "Developer / IT",
      timeframe: "Week 1",
      source_module: "Data Source Status",
    });
  }

  if (!input.competitors.length) {
    actions.push({
      priority: "low",
      action: "Add 1-3 competitors to the next audit.",
      reason: "No competitors were provided, so competitor gap diagnosis is limited.",
      affected_metric: "Competitor Setup Completeness",
      implementation_steps: [
        "Select direct category competitors.",
        "Add competitor brand names in the Free Audit form.",
        "Re-run the audit to enable baseline competitor tracking.",
      ],
      verification_method: "Check whether Competitor Gap Diagnosis shows tracking-ready competitors.",
      expected_impact: "Improves future AI answer share comparisons.",
      owner: "Marketing lead",
      timeframe: "Week 4",
      source_module: "Competitor Gap Diagnosis",
    });
  }

  if (!input.externalEvidence.entity_evidence_candidates.length) {
    actions.push({
      priority: "medium",
      action: "Add external identity links and sameAs structured data.",
      reason: "The website does not expose clear external identity links for lightweight evidence checks.",
      affected_metric: "External Evidence Light Score",
      implementation_steps: [
        "Add LinkedIn, YouTube, B2B platform, or directory links to the website.",
        "Add sameAs links to Organization schema.",
        "Keep names and descriptions consistent across profiles.",
      ],
      verification_method: "Re-run the audit and confirm external evidence candidates are detected.",
      expected_impact: "Improves entity corroboration before external search is connected.",
      owner: "Marketing lead",
      timeframe: "Week 4",
      source_module: "External Evidence Light Check",
    });
  }

  return actions.slice(0, 8);
}

function technicalAudit(pages: CrawledPage[]) {
  const firstPage = pages[0];
  const schema = firstPage?.schema_json;
  return [
    {
      item: "Title tag",
      status: firstPage?.title ? ("pass" as const) : ("fail" as const),
      impact: "Titles help AI and search systems understand the page topic.",
      recommendation: "Use a title that includes brand, category, and supplier intent.",
    },
    {
      item: "Meta description",
      status: firstPage?.meta_description ? ("pass" as const) : ("fail" as const),
      impact: "Descriptions clarify supplier relevance and buyer proof.",
      recommendation: "Mention product category, certifications, MOQ, OEM/ODM, or target market in the description.",
    },
    {
      item: "H1 / H2 structure",
      status: firstPage?.h1 && firstPage?.h2?.length ? ("pass" as const) : ("warning" as const),
      impact: "Structured headings make procurement facts easier to extract.",
      recommendation: "Use H2s for certifications, MOQ, lead time, OEM/ODM, quality control, FAQ, and contact.",
    },
    {
      item: "Schema markup",
      status: Array.isArray(schema) && schema.length ? ("pass" as const) : ("fail" as const),
      impact: "Schema helps systems parse entity and product facts.",
      recommendation: "Add Organization, Product, FAQPage, BreadcrumbList, and sameAs schema.",
    },
  ];
}

function scoreAverage(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export function generateBaselineReportJson(input: {
  project: Project;
  competitors: Competitor[];
  queries: AuditQuery[];
  crawledPages: CrawledPage[];
  crawlStatus: WebsiteCrawlStatus;
}): AuditReportJson {
  const context = createContext(input.project);
  const querySimulation = input.queries.map((query) => ({
    query: query.query,
    intent: query.intent,
    buyer_stage: query.buyer_stage,
    related_metric: metricForIntent(query.intent),
  }));
  const contentCoverage = analyzeContentCoverage(input.project, input.crawledPages);
  const recommendedPages = generateRecommendedPages(input.project, contentCoverage);
  const externalEvidence = extractExternalEvidence(input.crawledPages);
  const competitorSetupScore = input.competitors.length ? 100 : 0;
  const websiteContentCoverageScore = scoreAverage(contentCoverage.map((item) => item.completeness_score));
  const buyerDecisionInfoCoverage = scoreAverage(
    contentCoverage
      .filter((item) => ["moq", "lead_time", "certifications", "oem_odm", "quality_control"].includes(item.key))
      .map((item) => item.completeness_score),
  );
  const externalEvidenceScore = externalEvidence.entity_evidence_candidates.length ? 70 : 10;
  const techAudit = technicalAudit(input.crawledPages);
  const technicalScore = scoreAverage(techAudit.map((item) => (item.status === "pass" ? 85 : item.status === "warning" ? 50 : 15)));
  const baselineScore = Math.round(
    websiteContentCoverageScore * 0.5 +
      scoreAverage(querySimulation.map(() => 70)) * 0.2 +
      technicalScore * 0.15 +
      externalEvidenceScore * 0.1 +
      competitorSetupScore * 0.05,
  );
  const actionPlan = createActionPlan({
    project: input.project,
    crawlStatus: input.crawlStatus,
    contentCoverage,
    competitors: input.competitors,
    externalEvidence,
  });
  const missingContent = contentCoverage.filter((item) => item.status !== "present").map((item) => item.label);
  const competitorBars = [
    { name: input.project.brand_name, mention_rate: 0 },
    ...input.competitors.map((competitor) => ({
      name: competitor.name,
      mention_rate: 0,
    })),
  ];

  return {
    mode: "website_crawled_baseline",
    data_source_status: {
      mode: "website_crawled_baseline",
      ai_search_connected: false,
      external_search_connected: false,
      website_crawl_status: input.crawlStatus.status,
      mock_fallback_used: input.crawlStatus.mock_fallback_used,
      generated_from_user_input: true,
      analyzed_pages: input.crawlStatus.analyzed_pages,
      crawl_error: input.crawlStatus.crawl_error,
    },
    website_crawl: input.crawlStatus,
    summary: {
      visibility_score: baselineScore,
      baseline_readiness_score: baselineScore,
      website_content_coverage_score: websiteContentCoverageScore,
      buyer_decision_info_coverage: buyerDecisionInfoCoverage,
      external_evidence_score: externalEvidenceScore,
      competitor_setup_score: competitorSetupScore,
      ai_answer_presence: "not_connected",
      mention_rate: 0,
      competitor_avg_mention_rate: 0,
      content_score: websiteContentCoverageScore,
      trust_score: externalEvidenceScore,
      technical_score: technicalScore,
      core_missing_information: missingContent.slice(0, 6),
      high_priority_actions: actionPlan.filter((item) => item.priority === "high").map((item) => item.action).slice(0, 4),
      score_rationale: [
        {
          factor: "Website content coverage",
          score: websiteContentCoverageScore,
          reason: `${contentCoverage.filter((item) => item.status === "present").length} of ${contentCoverage.length} content fields are fully covered.`,
          recommendation: "Improve missing and partial procurement fields before connecting AI answer checks.",
        },
        {
          factor: "Buyer decision information",
          score: buyerDecisionInfoCoverage,
          reason: "MOQ, lead time, certifications, customization, and QC are weighted because buyers ask these before shortlisting suppliers.",
          recommendation: `Add decision-stage detail for ${context.product} and ${context.targetMarket} buyers.`,
        },
        {
          factor: "External evidence light score",
          score: externalEvidenceScore,
          reason: externalEvidence.entity_evidence_candidates.length
            ? "The submitted website exposes some external identity links."
            : "No website-provided external identity links were found.",
          recommendation: "Add sameAs schema and credible external profile links.",
        },
        {
          factor: "Competitor setup completeness",
          score: competitorSetupScore,
          reason: input.competitors.length
            ? `${input.competitors.length} competitors are ready for future AI answer checks.`
            : "No competitors were provided.",
          recommendation: "Add 1-3 direct competitors for future answer-share comparison.",
        },
      ],
    },
    brand_mentions: {
      total_queries: input.queries.length,
      target_mentions: 0,
      competitors: input.competitors.map((competitor) => ({
        name: competitor.name,
        mention_count: 0,
        mention_rate: 0,
      })),
    },
    query_results: querySimulation.map((query) => ({
      query: query.query,
      source: "baseline_simulation",
      target_brand_mentioned: false,
      competitors_mentioned: [],
      citations: [],
    })),
    buyer_queries: querySimulation.map((query) => ({
      ...query,
      mentioned_target: false,
      competitors_mentioned: [],
      citations: [],
      confidence: 70,
      visibility_score: 0,
      gap: "AI answer presence is not connected yet; this is a buyer-query simulation based on user input.",
      recommendation: recommendationForMetric(query.related_metric, context),
    })),
    buyer_query_simulation: querySimulation,
    competitor_comparison: input.competitors.map((competitor) => ({
      name: competitor.name,
      mention_count: 0,
      mention_rate: 0,
      average_position: null,
      strengths: ["AI answer checks are not connected yet."],
      gaps_vs_target: ["Baseline report only tracks competitor names for future comparison."],
      recommended_response: `${competitor.name} is included in the baseline competitor set for future AI answer share comparisons.`,
      evidence: [],
    })),
    competitor_gap_diagnosis: {
      competitors: input.competitors.map((competitor) => ({
        competitor_name: competitor.name,
        status: "tracking_ready",
        note: `${competitor.name} is included in the baseline competitor set for future AI answer share comparisons.`,
      })),
      empty_state: input.competitors.length
        ? undefined
        : "No competitors were provided. Add 1-3 competitors to enable competitor gap analysis.",
    },
    website_content: contentCoverage,
    content_coverage: contentCoverage.map(({ key, label, status, evidence, recommendation, affected_metric }) => ({
      key,
      label,
      status,
      evidence: Array.isArray(evidence) ? evidence : [evidence],
      recommendation,
      affected_metric,
    })),
    external_trust: EXTERNAL_TRUST_PLACEHOLDER(externalEvidence),
    external_evidence: externalEvidence,
    technical_audit: techAudit,
    missing_content: missingContent,
    recommended_pages: recommendedPages,
    action_plan: actionPlan,
    weak_sections: contentCoverage.filter((item) => item.status === "partial").map((item) => item.label),
    recommended_copy_improvements: contentCoverage
      .filter((item) => item.status !== "present")
      .slice(0, 4)
      .map((item) => item.recommendation),
    visualizations: {
      query_heatmap: querySimulation.map((query) => ({
        label: query.query,
        intent: query.intent,
        score: 0,
        status: "weak",
      })),
      competitor_bars: competitorBars,
      content_radar: contentCoverage.map((item) => ({
        dimension: item.label,
        score: item.completeness_score,
      })),
      trust_matrix: externalEvidence.entity_evidence_candidates.length
        ? externalEvidence.entity_evidence_candidates.map((candidate) => ({
            source: candidate.platform,
            score: 70,
          }))
        : [{ source: "Website-provided external evidence", score: 10 }],
    },
  };
}

function metricForIntent(intent: BuyerIntent) {
  const metrics: Record<BuyerIntent, string> = {
    supplier_discovery: "Supplier Discovery Coverage",
    comparison: "Competitor Comparison Readiness",
    certification: "Certification Query Answerability",
    pricing: "Buyer Decision Info Coverage",
    quality: "Quality Trust Evidence",
    logistics: "Market Relevance",
    risk_check: "Risk Reduction Evidence",
    customization: "Customization Question Answerability",
  };
  return metrics[intent];
}

function recommendationForMetric(metric: string, context: BaselineContext) {
  if (/Certification/i.test(metric)) return `Create a ${context.industry} certification page with proof and downloadable documents.`;
  if (/Decision/i.test(metric)) return `Add MOQ, sample policy, lead time, and payment-term details for ${context.product}.`;
  if (/Customization/i.test(metric)) return `Add OEM/ODM workflow, private label, packaging, logo, and design options for ${context.targetMarket} buyers.`;
  if (/Quality/i.test(metric)) return "Document QC workflow, inspections, standards, testing, and shipment approval.";
  if (/Market/i.test(metric)) return `Explain export support, shipping options, and compliance for ${context.targetMarket}.`;
  return `Create a buyer-focused page that answers this ${context.industry} question with specific proof.`;
}

function EXTERNAL_TRUST_PLACEHOLDER(externalEvidence: AuditReportJson["external_evidence"]) {
  const candidates = externalEvidence.entity_evidence_candidates;
  return [
    {
      source: "Website-provided identity links",
      status: candidates.length ? ("partial" as const) : ("missing" as const),
      credibility_score: candidates.length ? 70 : 10,
      evidence: candidates.length
        ? `${candidates.length} external identity candidate(s) found on the website.`
        : "No external identity links found on the website.",
      recommendation: externalEvidence.note,
    },
  ];
}
