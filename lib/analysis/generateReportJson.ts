import type {
  AIResult,
  AuditQuery,
  AuditReportJson,
  CrawledPage,
  WebsiteAuditResult,
} from "@/types/audit";
import type { Competitor, Project } from "@/types/project";
import { calculateVisibilityScore } from "./scoreVisibility";

function roundRate(value: number) {
  return Number(value.toFixed(2));
}

function fallbackActionPlan(project: Project) {
  const industry = project.industry || "B2B supplier";

  return [
    {
      priority: "high" as const,
      action: "Add clear certification, MOQ, lead-time, and quality-control sections to core product pages.",
      expected_impact: `Improves eligibility for ${industry} buyer-intent AI answers.`,
    },
    {
      priority: "medium" as const,
      action: "Publish comparison and supplier-selection pages that answer procurement questions directly.",
      expected_impact: "Helps AI systems connect your brand to category and comparison queries.",
    },
    {
      priority: "low" as const,
      action: "Re-run the audit after content updates are indexed and cited externally.",
      expected_impact: "Creates a measurable feedback loop without promising guaranteed rankings.",
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

  const queryById = new Map(input.queries.map((query) => [query.id, query.query]));
  const hasContactSignal = input.crawledPages.some((page) =>
    /contact|email|phone|inquiry|quote/i.test(page.text_content),
  );
  const trustScore = Math.min(
    100,
    input.websiteAudit.content_score +
      (hasContactSignal ? 10 : 0) +
      Math.min(input.crawledPages.length * 2, 10),
  );

  return {
    summary: {
      visibility_score: visibilityScore,
      mention_rate: mentionRate,
      competitor_avg_mention_rate: competitorAvgMentionRate,
      content_score: input.websiteAudit.content_score,
      trust_score: trustScore,
      technical_score: input.technicalScore,
    },
    brand_mentions: {
      total_queries: totalQueries,
      target_mentions: targetMentions,
      competitors: competitorStats,
    },
    query_results: input.aiResults.map((result) => ({
      query: queryById.get(result.query_id) || result.answer.slice(0, 120),
      source: result.source,
      target_brand_mentioned: result.target_brand_mentioned,
      competitors_mentioned: result.competitors_mentioned,
      citations: result.citations,
    })),
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
    action_plan:
      input.websiteAudit.priority_actions.length > 0
        ? input.websiteAudit.priority_actions
        : fallbackActionPlan(input.project),
    weak_sections: input.websiteAudit.weak_sections,
    recommended_copy_improvements: input.websiteAudit.recommended_copy_improvements,
  };
}
