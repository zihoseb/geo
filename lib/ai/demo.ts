import type { AIResult, AuditQuery, CrawledPage, WebsiteAuditResult } from "@/types/audit";
import type { Competitor, Project } from "@/types/project";
import { extractCompetitorMentions, isBrandMentioned } from "@/lib/analysis/extractMentions";

const QUERY_TEMPLATES: Omit<AuditQuery, "query">[] = [
  { intent: "supplier_discovery", buyer_stage: "awareness" },
  { intent: "comparison", buyer_stage: "consideration" },
  { intent: "certification", buyer_stage: "decision" },
  { intent: "pricing", buyer_stage: "consideration" },
  { intent: "quality", buyer_stage: "decision" },
  { intent: "logistics", buyer_stage: "consideration" },
  { intent: "risk_check", buyer_stage: "decision" },
  { intent: "supplier_discovery", buyer_stage: "awareness" },
  { intent: "comparison", buyer_stage: "decision" },
  { intent: "quality", buyer_stage: "consideration" },
];

export function generateDemoBuyerQueries(input: {
  brandName: string;
  industry?: string;
  products?: string[];
  targetMarket?: string;
  buyerType?: string;
  count?: number;
}): AuditQuery[] {
  const industry = input.industry || "B2B supplier";
  const product = input.products?.[0] || "core products";
  const market = input.targetMarket || "international markets";
  const buyer = input.buyerType || "procurement teams";
  const questions = [
    `Which ${industry} suppliers are recommended for ${buyer} selling into ${market}?`,
    `How does ${input.brandName} compare with other ${industry} suppliers?`,
    `Which ${industry} companies can provide certifications for ${product}?`,
    `What are typical MOQ, pricing, and lead time questions for ${product} suppliers?`,
    `Which suppliers have strong quality control processes for ${product}?`,
    `Which ${industry} suppliers can handle export logistics for ${market}?`,
    `What risks should buyers check before choosing a ${industry} supplier?`,
    `Find reliable manufacturers of ${product} with OEM or ODM support.`,
    `Compare top ${industry} brands for private-label buyers.`,
    `Which supplier pages best explain factory capacity and inspection process?`,
  ];

  return questions.slice(0, input.count || 10).map((query, index) => ({
    ...QUERY_TEMPLATES[index % QUERY_TEMPLATES.length],
    query,
  }));
}

export function runDemoSearch(input: {
  query: string;
  project: Project;
  competitors: Competitor[];
  index: number;
}) {
  const competitorNames = input.competitors.map((competitor) => competitor.name);
  const leadCompetitor = competitorNames[0] || "a better-known competitor";
  const secondCompetitor = competitorNames[1] || leadCompetitor;
  const mentionsTarget = input.index % 3 !== 1;
  const competitorLine =
    input.index % 2 === 0
      ? `${leadCompetitor} is frequently cited for certifications and export readiness.`
      : `${leadCompetitor} and ${secondCompetitor} appear in buyer comparisons more often.`;
  const targetLine = mentionsTarget
    ? `${input.project.brand_name} is mentioned as a relevant supplier, but the answer needs clearer evidence about MOQ, certifications, lead time, and quality control.`
    : "The target company is not prominent in this answer, which suggests the website may not provide enough citable buyer-intent content.";

  return {
    answer: `${targetLine} ${competitorLine} Buyers usually prefer pages that directly answer this buyer question with proof points and sourceable detail.`,
    citations: [
      {
        title: `${input.project.brand_name} website`,
        url: input.project.website_url,
      },
      {
        title: "Supplier comparison example",
        url: "https://example.com/b2b-supplier-comparison",
      },
    ],
    raw: { demo: true, query: input.query },
    source: "demo" as const,
  };
}

export function analyzeDemoMention(input: {
  brandName: string;
  competitors: string[];
  answer: string;
  citations?: { title?: string; url: string }[];
}): Omit<AIResult, "id" | "project_id" | "query_id" | "source" | "answer"> {
  const targetBrandMentioned = isBrandMentioned(input.answer, input.brandName);
  const competitorsMentioned = extractCompetitorMentions(input.answer, input.competitors);
  const mentionedBrands = [
    ...(targetBrandMentioned ? [input.brandName] : []),
    ...competitorsMentioned,
  ];

  return {
    target_brand_mentioned: targetBrandMentioned,
    mentioned_brands: mentionedBrands,
    competitors_mentioned: competitorsMentioned,
    citations: input.citations || [],
    sentiment: targetBrandMentioned ? "neutral" : "not_mentioned",
    issues: targetBrandMentioned
      ? []
      : ["Target brand was not mentioned in this simulated AI answer."],
  };
}

export function createDemoCrawledPages(project: Project): CrawledPage[] {
  const industry = project.industry || "B2B supplier";
  const products = project.main_products?.join(", ") || "industrial products";

  return [
    {
      project_id: project.id,
      url: project.website_url,
      title: `${project.brand_name} - ${industry}`,
      meta_description: `${project.brand_name} manufactures ${products} for global buyers.`,
      h1: `${industry} for export buyers`,
      h2: ["Products", "OEM / ODM", "Quality Control", "Contact"],
      text_content: `${project.brand_name} is a ${industry}. Product categories include ${products}. The site mentions OEM and ODM support, export markets, and contact information, but it does not clearly publish MOQ, lead time, certifications, production capacity, detailed case studies, FAQ, or structured schema data.`,
      schema_json: [],
      word_count: 58,
    },
  ];
}

export function analyzeDemoWebsiteContent(input: {
  brandName: string;
  industry?: string;
  buyerType?: string;
  websiteText: string;
}): WebsiteAuditResult {
  const checks = [
    { label: "MOQ", pattern: /\bmoq\b|minimum order/i },
    { label: "Lead time", pattern: /lead time|delivery time|turnaround/i },
    { label: "Certifications", pattern: /certification|certificate|iso|fda|ce|rohs/i },
    { label: "OEM / ODM process", pattern: /\boem\b|\bodm\b|private label/i },
    { label: "Quality control process", pattern: /quality control|inspection|qc/i },
    { label: "Production capacity", pattern: /capacity|monthly output|production line/i },
    { label: "Export markets", pattern: /export|market|usa|europe|eu|global/i },
    { label: "Case studies", pattern: /case study|customer story|client/i },
    { label: "FAQ", pattern: /\bfaq\b|frequently asked/i },
    { label: "Schema / structured data", pattern: /schema|structured data|json-ld/i },
  ];

  const missing = checks
    .filter((check) => !check.pattern.test(input.websiteText))
    .map((check) => check.label);
  const contentScore = Math.max(35, Math.round(((checks.length - missing.length) / checks.length) * 100));
  const industry = input.industry || "B2B supplier";

  return {
    content_score: contentScore,
    missing_information: missing,
    weak_sections: missing.slice(0, 4),
    recommended_pages: [
      {
        title: `${industry} Certification and Compliance Guide`,
        priority: "high",
        reason: "Certification-related buyer questions need a dedicated, citable page with current proof.",
      },
      {
        title: `${input.brandName} MOQ, Lead Time, and OEM Process`,
        priority: "high",
        reason: "AI answers often summarize procurement terms when supplier pages state them clearly.",
      },
      {
        title: `${industry} Quality Control Checklist`,
        priority: "medium",
        reason: "Quality-control detail helps AI systems distinguish the brand from commodity supplier lists.",
      },
    ],
    recommended_copy_improvements: [
      "Add direct buyer-question headings such as MOQ, lead time, certifications, OEM, and inspection process.",
      "Use specific proof points, export markets, and product category pages instead of generic company copy.",
    ],
    priority_actions: [
      {
        priority: "high",
        action: "Publish missing procurement terms on product and capability pages.",
        expected_impact: "Improves the chance that AI answers can cite the brand for decision-stage queries.",
      },
      {
        priority: "high",
        action: "Add certification, quality-control, and factory-capacity evidence with sourceable page titles.",
        expected_impact: "Reduces competitor advantage in comparison and trust-check answers.",
      },
      {
        priority: "medium",
        action: "Create FAQ and comparison pages around the generated buyer queries.",
        expected_impact: "Expands coverage for awareness and consideration-stage AI searches.",
      },
    ],
  };
}
