export function buildBuyerQueryPrompt(input: {
  brandName: string;
  industry: string;
  products?: string[];
  targetMarket?: string;
  buyerType?: string;
  count: number;
}) {
  return `
You are a B2B procurement research expert.

Given the following company profile, generate realistic questions that an overseas buyer would ask an AI assistant when looking for suppliers.

Company:
Brand: ${input.brandName}
Industry: ${input.industry}
Products: ${(input.products || []).join(", ")}
Target Market: ${input.targetMarket || ""}
Buyer Type: ${input.buyerType || ""}

Generate ${input.count} buyer-intent questions.

Requirements:
- Questions should sound natural.
- Include supplier discovery questions.
- Include comparison questions.
- Include certification questions.
- Include pricing, MOQ, lead time, and quality control questions.
- Do not mention the target brand in every question.
- Output JSON only.
- Do not include markdown.

Format:
[
  {
    "query": "...",
    "intent": "supplier_discovery | comparison | certification | pricing | quality | logistics | risk_check",
    "buyer_stage": "awareness | consideration | decision"
  }
]
`;
}

export function buildMentionAnalysisPrompt(input: {
  brandName: string;
  competitors: string[];
  answer: string;
}) {
  return `
You are analyzing an AI search answer.

Target brand:
${input.brandName}

Competitors:
${input.competitors.join(", ")}

AI answer:
${input.answer}

Tasks:
1. Determine whether the target brand is mentioned.
2. Determine which competitors are mentioned.
3. Extract cited sources if available.
4. Determine sentiment toward target brand.
5. Determine if the answer contains incorrect or outdated information about the target brand.

Output JSON only. Do not include markdown.

Format:
{
  "target_brand_mentioned": true,
  "competitors_mentioned": [],
  "mentioned_brands": [],
  "citations": [
    {
      "title": "",
      "url": ""
    }
  ],
  "sentiment": "positive | neutral | negative | not_mentioned",
  "issues": []
}
`;
}

export function buildWebsiteAuditPrompt(input: {
  brandName: string;
  industry: string;
  buyerType?: string;
  websiteText: string;
}) {
  return `
You are a B2B website audit expert.

Analyze the following website content for AI search visibility and buyer trust.

Brand:
${input.brandName}

Industry:
${input.industry}

Target buyers:
${input.buyerType || ""}

Website content:
${input.websiteText}

Evaluate whether the website clearly provides the following information:
- company identity
- factory or trading company
- product categories
- certifications
- MOQ
- lead time
- OEM / ODM support
- quality control
- production capacity
- export markets
- case studies
- contact information
- FAQ
- schema / structured data

Output JSON only. Do not include markdown.

Format:
{
  "content_score": 0,
  "missing_information": [],
  "weak_sections": [],
  "recommended_pages": [
    {
      "title": "",
      "priority": "high | medium | low",
      "reason": ""
    }
  ],
  "recommended_copy_improvements": [],
  "priority_actions": [
    {
      "priority": "high | medium | low",
      "action": "",
      "expected_impact": ""
    }
  ]
}
`;
}

export function buildFinalReportPrompt(input: { auditData: unknown }) {
  return `
You are creating an executive AI visibility audit report for a B2B company.

Use the following audit data:
${JSON.stringify(input.auditData, null, 2)}

Write a concise report with:
1. Overall score
2. Key findings
3. Why competitors are more visible
4. Website content gaps
5. External trust gaps
6. Technical SEO issues
7. 30-day action plan

Tone:
- Professional
- Clear
- No exaggerated claims
- Do not promise guaranteed AI rankings

Output JSON only. Do not include markdown.
`;
}
