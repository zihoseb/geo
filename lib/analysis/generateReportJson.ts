import type {
  AIResult,
  AuditQuery,
  AuditReportJson,
  CrawledPage,
  WebsiteAuditResult,
} from "@/types/audit";
import type { Competitor, Project } from "@/types/project";
import { buildMockReport } from "@/lib/mock/report";
import { calculateVisibilityScore } from "./scoreVisibility";

const CONTENT_DIMENSIONS = [
  {
    dimension: "Company information",
    pattern: /about|factory|company|manufacturer|established|team/i,
    recommendation: "Add a clear company overview with factory background, export markets, and procurement contact details.",
    owner: "Content lead",
  },
  {
    dimension: "Product information",
    pattern: /product|catalog|specification|material|size|model/i,
    recommendation: "Expand product pages with specifications, use cases, materials, packaging, and buyer FAQs.",
    owner: "Product manager",
  },
  {
    dimension: "Certifications",
    pattern: /certification|certificate|iso|fda|ce|rohs|compliance/i,
    recommendation: "Publish a certification and compliance page with certificate names, scope, dates, and downloadable proof.",
    owner: "Quality manager",
  },
  {
    dimension: "MOQ",
    pattern: /\bmoq\b|minimum order|minimum quantity/i,
    recommendation: "Add MOQ ranges by product category and explain sample order versus bulk order terms.",
    owner: "Sales operations",
  },
  {
    dimension: "Lead time",
    pattern: /lead time|delivery time|turnaround|production time/i,
    recommendation: "State sample lead time, mass production lead time, and seasonal capacity constraints.",
    owner: "Operations manager",
  },
  {
    dimension: "OEM / ODM",
    pattern: /\boem\b|\bodm\b|private label|customization|custom/i,
    recommendation: "Create an OEM/ODM process page covering design input, sampling, tooling, approval, and production.",
    owner: "Product manager",
  },
  {
    dimension: "Quality control",
    pattern: /quality control|inspection|qc|testing|aql/i,
    recommendation: "Document inspection steps, test standards, defect handling, and shipment approval workflow.",
    owner: "Quality manager",
  },
  {
    dimension: "Production capacity",
    pattern: /capacity|monthly output|production line|machines|factory size/i,
    recommendation: "Add production capacity, equipment, peak-season planning, and scalable order handling details.",
    owner: "Operations manager",
  },
  {
    dimension: "Export markets",
    pattern: /export|usa|europe|eu|global|overseas|market/i,
    recommendation: "Name priority export regions, logistics options, compliance needs, and buyer segments.",
    owner: "Marketing lead",
  },
  {
    dimension: "Customer cases",
    pattern: /case study|customer story|client|testimonial|brand partner/i,
    recommendation: "Publish buyer cases or anonymized project examples with challenge, solution, and result.",
    owner: "Marketing lead",
  },
  {
    dimension: "Contact information",
    pattern: /contact|email|phone|inquiry|quote|rfq|whatsapp/i,
    recommendation: "Make RFQ contact paths explicit and add response time expectations for procurement teams.",
    owner: "Sales operations",
  },
  {
    dimension: "FAQ",
    pattern: /\bfaq\b|frequently asked|questions/i,
    recommendation: "Add a procurement FAQ answering MOQ, lead time, certificates, samples, customization, and shipping.",
    owner: "Content lead",
  },
];

const EXTERNAL_TRUST_SOURCES = [
  {
    source: "LinkedIn company page",
    pattern: /linkedin/i,
    recommendation: "Maintain a complete LinkedIn company page and link it from the website footer.",
  },
  {
    source: "Industry directories",
    pattern: /directory|supplier directory|association|trade/i,
    recommendation: "Create consistent profiles on credible industry directories and associations.",
  },
  {
    source: "Third-party media",
    pattern: /news|media|press|publication|interview/i,
    recommendation: "Publish third-party proof such as interviews, trade media mentions, or event coverage.",
  },
  {
    source: "Reddit / Quora Q&A",
    pattern: /reddit|quora|forum|community/i,
    recommendation: "Seed helpful, non-promotional answers around supplier selection and procurement questions.",
  },
  {
    source: "Reviews and testimonials",
    pattern: /review|testimonial|rating|feedback/i,
    recommendation: "Add verified testimonials and external review references where appropriate for B2B buyers.",
  },
  {
    source: "Video proof",
    pattern: /youtube|video|factory tour|webinar/i,
    recommendation: "Publish factory tours, product demos, QC walkthroughs, and embed them on key pages.",
  },
  {
    source: "B2B platform profiles",
    pattern: /alibaba|made-in-china|global sources|thomasnet|europages/i,
    recommendation: "Keep B2B platform profiles aligned with the website and certification claims.",
  },
];

function roundRate(value: number) {
  return Number(value.toFixed(2));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function fallbackActionPlan(project: Project) {
  const industry = project.industry || "B2B supplier";

  return [
    {
      priority: "high" as const,
      action: "Add clear certification, MOQ, lead-time, and quality-control sections to core product pages.",
      expected_impact: `Improves eligibility for ${industry} buyer-intent AI answers.`,
      owner: "Content lead",
      timeframe: "Week 1",
      source_module: "Website Content Audit",
    },
    {
      priority: "medium" as const,
      action: "Publish comparison and supplier-selection pages that answer procurement questions directly.",
      expected_impact: "Helps AI systems connect your brand to category and comparison queries.",
      owner: "Marketing lead",
      timeframe: "Week 2",
      source_module: "Buyer Queries Analysis",
    },
    {
      priority: "low" as const,
      action: "Re-run the audit after content updates are indexed and cited externally.",
      expected_impact: "Creates a measurable feedback loop without promising guaranteed rankings.",
      owner: "Growth owner",
      timeframe: "Week 4",
      source_module: "Executive Summary",
    },
  ];
}

function inferQueryRecommendation(input: {
  query: AuditQuery;
  project: Project;
  mentionedTarget: boolean;
  competitorsMentioned: string[];
}) {
  if (input.mentionedTarget) {
    return "Strengthen this page cluster with citations, proof points, and comparison copy so the current visibility is easier for AI answers to reuse.";
  }

  const product = input.project.main_products?.[0] || input.project.industry || "core product";
  const competitorText = input.competitorsMentioned.length
    ? ` Competitors mentioned: ${input.competitorsMentioned.join(", ")}.`
    : "";

  const recommendations: Record<AuditQuery["intent"], string> = {
    supplier_discovery: `Create a supplier-discovery page for ${product} buyers with export markets, buyer types, and clear qualification proof.${competitorText}`,
    comparison: `Publish a comparison page explaining where ${input.project.brand_name} wins on certificates, MOQ, customization, lead time, and QC.${competitorText}`,
    certification: `Add a certification hub with certificate names, scope, renewal dates, test standards, and downloadable proof.${competitorText}`,
    pricing: `Add MOQ, sample, tooling, payment term, and lead-time guidance so AI answers can quote procurement terms accurately.${competitorText}`,
    quality: `Document QC workflow, inspection standards, test equipment, defect handling, and shipment approval steps.${competitorText}`,
    logistics: `Add export logistics details including incoterms, packaging, shipping regions, and documentation support.${competitorText}`,
    risk_check: `Create risk-reduction content covering audits, compliance, production backup plans, and after-sales handling.${competitorText}`,
  };

  return recommendations[input.query.intent];
}

function getTextCorpus(pages: CrawledPage[]) {
  return pages.map((page) => [page.title, page.meta_description, page.h1, page.h2?.join(" "), page.text_content].filter(Boolean).join(" ")).join("\n");
}

function buildWebsiteContentAudit(pages: CrawledPage[]) {
  const corpus = getTextCorpus(pages);

  return CONTENT_DIMENSIONS.map((check) => {
    const present = check.pattern.test(corpus);
    const textMentions = corpus.match(check.pattern)?.length || 0;
    const status: "present" | "partial" | "missing" = present
      ? textMentions > 1 || corpus.length > 2000
        ? "present"
        : "partial"
      : "missing";
    const completenessScore = status === "present" ? 86 : status === "partial" ? 52 : 18;

    return {
      dimension: check.dimension,
      status,
      completeness_score: completenessScore,
      evidence: present ? "Detected related copy on crawled pages." : "No clear evidence found in crawled page text.",
      recommendation: check.recommendation,
      owner: check.owner,
    };
  });
}

function buildExternalTrustAudit(input: { pages: CrawledPage[]; aiResults: AIResult[] }) {
  const corpus = `${getTextCorpus(input.pages)}\n${input.aiResults
    .flatMap((result) => result.citations.map((citation) => `${citation.title || ""} ${citation.url}`))
    .join("\n")}`;

  return EXTERNAL_TRUST_SOURCES.map((source) => {
    const present = source.pattern.test(corpus);
    const credibilityScore = present ? 75 : 24;

    return {
      source: source.source,
      status: present ? ("partial" as const) : ("missing" as const),
      credibility_score: credibilityScore,
      evidence: present ? "Related source signal appeared in citations or website copy." : "No clear third-party source signal found.",
      recommendation: source.recommendation,
    };
  });
}

function buildTechnicalAudit(input: { pages: CrawledPage[]; technicalScore: number }) {
  const firstPage = input.pages[0];
  const schema = firstPage?.schema_json;
  const schemaStatus: "pass" | "fail" = Array.isArray(schema)
    ? schema.length > 0
      ? "pass"
      : "fail"
    : schema
      ? "pass"
      : "fail";

  return [
    {
      item: "Title tag",
      status: firstPage?.title ? ("pass" as const) : ("fail" as const),
      impact: "AI systems and search snippets use titles to understand page topic and brand-category fit.",
      recommendation: firstPage?.title
        ? "Keep page titles specific to the product category and buyer intent."
        : "Add a concise title tag that includes brand, category, and supplier intent.",
    },
    {
      item: "Meta description",
      status: firstPage?.meta_description ? ("pass" as const) : ("fail" as const),
      impact: "Meta descriptions clarify procurement relevance when answers summarize pages.",
      recommendation: firstPage?.meta_description
        ? "Make each description answer a buyer need such as MOQ, certification, or OEM support."
        : "Add meta descriptions that summarize supplier value, product category, and proof points.",
    },
    {
      item: "H1 / H2 structure",
      status: firstPage?.h1 && firstPage?.h2?.length ? ("pass" as const) : ("warning" as const),
      impact: "Clear headings help AI extract page sections and buyer-facing facts.",
      recommendation: "Use buyer-question headings for MOQ, certifications, OEM/ODM, quality control, logistics, and FAQ.",
    },
    {
      item: "Canonical URL",
      status: "warning" as const,
      impact: "Canonical tags reduce duplicate-page ambiguity for crawlers and AI retrieval systems.",
      recommendation: "Add canonical tags to product, category, and guide pages.",
    },
    {
      item: "Schema markup",
      status: schemaStatus,
      impact: "Structured data makes organization, product, FAQ, and breadcrumb facts easier to parse.",
      recommendation: "Add Organization, Product, FAQPage, BreadcrumbList, and Article schema where relevant.",
    },
    {
      item: "Sitemap",
      status: input.technicalScore >= 75 ? ("pass" as const) : ("warning" as const),
      impact: "Sitemaps help discovery of procurement pages and content hubs.",
      recommendation: "Publish and submit an XML sitemap that includes product, certification, FAQ, and guide pages.",
    },
    {
      item: "Robots.txt",
      status: input.technicalScore >= 70 ? ("pass" as const) : ("warning" as const),
      impact: "Robots rules can accidentally block crawlers from the pages AI systems need to cite.",
      recommendation: "Verify robots.txt allows important product and content pages to be crawled.",
    },
  ];
}

export function generateReportJson(input: {
  project: Project;
  competitors: Competitor[];
  queries: AuditQuery[];
  aiResults: AIResult[];
  crawledPages: CrawledPage[];
  websiteAudit: WebsiteAuditResult;
  technicalScore: number;
}): AuditReportJson {
  if (!input.aiResults.length || !input.crawledPages.length) {
    return buildMockReport(input.project.id, input.project, input.competitors);
  }

  const totalQueries = Math.max(input.aiResults.length, input.queries.length, 1);
  const targetMentions = input.aiResults.filter((result) => result.target_brand_mentioned).length;
  const mentionRate = roundRate(targetMentions / totalQueries);

  const competitorStats = input.competitors.map((competitor) => {
    const mentionCount = input.aiResults.filter((result) =>
      result.competitors_mentioned.some((name) => name === competitor.name),
    ).length;

    return {
      name: competitor.name,
      mention_count: mentionCount,
      mention_rate: roundRate(mentionCount / totalQueries),
    };
  });

  const competitorAvgMentionRate = competitorStats.length
    ? roundRate(
        competitorStats.reduce((sum, competitor) => sum + competitor.mention_rate, 0) /
          competitorStats.length,
      )
    : 0;

  const visibilityScore = calculateVisibilityScore({
    mentionRate,
    contentScore: input.websiteAudit.content_score,
    technicalScore: input.technicalScore,
  });

  const hasContactSignal = input.crawledPages.some((page) =>
    /contact|email|phone|inquiry|quote/i.test(page.text_content),
  );
  const trustScore = Math.min(
    100,
    input.websiteAudit.content_score +
      (hasContactSignal ? 10 : 0) +
      Math.min(input.crawledPages.length * 2, 10),
  );
  const queryById = new Map(input.queries.map((query) => [query.id, query]));
  const buyerQueries = input.aiResults.map((result) => {
    const query = queryById.get(result.query_id) || {
      query: result.answer.slice(0, 120),
      intent: "supplier_discovery" as const,
      buyer_stage: "awareness" as const,
    };
    const citations = result.citations.length ? result.citations : [];
    const visibility = result.target_brand_mentioned ? 76 : result.competitors_mentioned.length ? 24 : 42;

    return {
      query: query.query,
      intent: query.intent,
      buyer_stage: query.buyer_stage,
      mentioned_target: result.target_brand_mentioned,
      competitors_mentioned: result.competitors_mentioned,
      citations,
      confidence: clampScore(
        62 +
          citations.length * 8 +
          (result.target_brand_mentioned ? 10 : -10) +
          Math.min(result.answer.length / 80, 12),
      ),
      visibility_score: clampScore(visibility),
      gap: result.target_brand_mentioned
        ? "Visible, but the answer still needs stronger proof points to improve citation quality."
        : "Target brand was absent or weaker than competitors for this buyer question.",
      recommendation: inferQueryRecommendation({
        query,
        project: input.project,
        mentionedTarget: result.target_brand_mentioned,
        competitorsMentioned: result.competitors_mentioned,
      }),
    };
  });

  const competitorComparison = input.competitors.map((competitor) => {
    const matchingResults = input.aiResults.filter((result) =>
      result.competitors_mentioned.includes(competitor.name),
    );
    const positions = matchingResults
      .map((result) => result.answer.toLowerCase().indexOf(competitor.name.toLowerCase()))
      .filter((position) => position >= 0)
      .map((position) => Math.max(1, Math.round(position / 80) + 1));
    const averagePosition = positions.length
      ? Number((positions.reduce((sum, position) => sum + position, 0) / positions.length).toFixed(1))
      : matchingResults.length
        ? 2
        : null;
    const mentionCount = matchingResults.length;

    return {
      name: competitor.name,
      mention_count: mentionCount,
      mention_rate: roundRate(mentionCount / totalQueries),
      average_position: averagePosition,
      strengths:
        mentionCount > 0
          ? [
              "Appears in AI buyer answers more consistently than the target brand.",
              "Benefits from clearer category, certification, or export-readiness signals.",
            ]
          : ["No strong AI-answer advantage detected in this sample."],
      gaps_vs_target:
        mentionCount > targetMentions
          ? [
              "Competitor is easier for AI answers to associate with buyer-intent questions.",
              "Target brand needs more sourceable proof around trust, certifications, MOQ, and process.",
            ]
          : ["Target brand is competitive in this sample, but should deepen proof and citations."],
      recommended_response: `Create pages that directly compare ${input.project.brand_name} with ${competitor.name} on certifications, MOQ, lead time, OEM/ODM, QC, and export support.`,
      evidence: matchingResults
        .flatMap((result) => result.citations.map((citation) => citation.url))
        .slice(0, 3),
    };
  });

  const websiteContent = buildWebsiteContentAudit(input.crawledPages);
  const externalTrust = buildExternalTrustAudit({
    pages: input.crawledPages,
    aiResults: input.aiResults,
  });
  const technicalAudit = buildTechnicalAudit({
    pages: input.crawledPages,
    technicalScore: input.technicalScore,
  });
  const actionPlan =
    input.websiteAudit.priority_actions.length > 0
      ? input.websiteAudit.priority_actions.map((item, index) => ({
          ...item,
          owner:
            item.action.toLowerCase().includes("moq") || item.action.toLowerCase().includes("lead")
              ? "Product manager"
              : item.action.toLowerCase().includes("certification") ||
                  item.action.toLowerCase().includes("quality")
                ? "Quality manager"
                : "Content lead",
          timeframe: `Week ${index + 1}`,
          source_module: index === 0 ? "Website Content Audit" : "Buyer Queries Analysis",
        }))
      : fallbackActionPlan(input.project);
  const coreMissingInformation = websiteContent
    .filter((item) => item.status !== "present")
    .map((item) => item.dimension)
    .slice(0, 6);
  const highPriorityActions = actionPlan
    .filter((item) => item.priority === "high")
    .map((item) => item.action)
    .slice(0, 4);

  return {
    summary: {
      visibility_score: visibilityScore,
      mention_rate: mentionRate,
      competitor_avg_mention_rate: competitorAvgMentionRate,
      content_score: input.websiteAudit.content_score,
      trust_score: trustScore,
      technical_score: input.technicalScore,
      core_missing_information: coreMissingInformation,
      high_priority_actions: highPriorityActions,
      score_rationale: [
        {
          factor: "Brand mention rate",
          score: clampScore(mentionRate * 100),
          reason: `${targetMentions} of ${totalQueries} buyer questions mentioned ${input.project.brand_name}.`,
          recommendation:
            mentionRate >= 0.6
              ? "Protect visible query clusters with stronger citations and comparison proof."
              : "Create buyer-intent pages that directly answer supplier discovery, certification, pricing, and comparison questions.",
        },
        {
          factor: "Competitor pressure",
          score: clampScore((1 - Math.max(competitorAvgMentionRate - mentionRate, 0)) * 100),
          reason: `Competitors averaged ${Math.round(competitorAvgMentionRate * 100)}% mention rate versus ${Math.round(
            mentionRate * 100,
          )}% for the target brand.`,
          recommendation: "Close gaps by publishing proof-heavy pages where competitors are currently cited more often.",
        },
        {
          factor: "Website content coverage",
          score: input.websiteAudit.content_score,
          reason: `${coreMissingInformation.length} key procurement content areas need stronger coverage.`,
          recommendation: "Prioritize missing procurement terms, trust proof, and FAQ sections before expanding lower-intent content.",
        },
        {
          factor: "Technical extractability",
          score: input.technicalScore,
          reason: "Title, metadata, headings, schema, sitemap, and robots signals affect how easily AI systems parse and cite pages.",
          recommendation: "Add schema and clean page structure so buyer facts are machine-readable.",
        },
      ],
    },
    brand_mentions: {
      total_queries: totalQueries,
      target_mentions: targetMentions,
      competitors: competitorStats,
    },
    query_results: input.aiResults.map((result) => ({
      query: queryById.get(result.query_id)?.query || result.answer.slice(0, 120),
      source: result.source,
      target_brand_mentioned: result.target_brand_mentioned,
      competitors_mentioned: result.competitors_mentioned,
      citations: result.citations,
    })),
    buyer_queries: buyerQueries,
    competitor_comparison: competitorComparison,
    website_content: websiteContent,
    external_trust: externalTrust,
    technical_audit: technicalAudit,
    missing_content: input.websiteAudit.missing_information,
    recommended_pages:
      input.websiteAudit.recommended_pages.length > 0
        ? input.websiteAudit.recommended_pages
        : [
            {
              title: `${input.project.industry || input.project.brand_name} Buyer FAQ`,
              priority: "high",
              reason: "AI buyer questions need direct, citable answers about qualifications and purchasing terms.",
            },
          ],
    action_plan: actionPlan,
    weak_sections: input.websiteAudit.weak_sections,
    recommended_copy_improvements: input.websiteAudit.recommended_copy_improvements,
    visualizations: {
      query_heatmap: buyerQueries.map((query) => ({
        label: query.query,
        intent: query.intent,
        score: query.visibility_score,
        status: query.mentioned_target ? "visible" : query.competitors_mentioned.length ? "missing" : "weak",
      })),
      competitor_bars: [
        { name: input.project.brand_name, mention_rate: mentionRate },
        ...competitorComparison.map((competitor) => ({
          name: competitor.name,
          mention_rate: competitor.mention_rate,
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
