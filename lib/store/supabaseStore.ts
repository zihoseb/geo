import type { AIResult, AuditQuery, AuditReportJson, CrawledPage } from "@/types/audit";
import type { Competitor, Project, ProjectStatus } from "@/types/project";
import type { AuditReport } from "@/types/report";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { AuditStore, CreateProjectInput, ReportBundle } from "./types";

export function createSupabaseStore(): AuditStore {
  const supabase = createSupabaseServiceClient();

  return {
    async createProject(input: CreateProjectInput) {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: null,
          brand_name: input.brandName,
          website_url: input.websiteUrl,
          industry: input.industry,
          target_market: input.targetMarket,
          buyer_type: input.buyerType,
          main_products: input.mainProducts || [],
          status: "created",
        })
        .select("*")
        .single();

      if (error) throw error;

      const competitorRows = input.competitors
        .filter((competitor) => competitor.name.trim())
        .slice(0, 3)
        .map((competitor) => ({
          project_id: project.id,
          name: competitor.name.trim(),
          website_url: competitor.websiteUrl?.trim() || null,
        }));

      const { data: competitors, error: competitorsError } = competitorRows.length
        ? await supabase.from("competitors").insert(competitorRows).select("*")
        : { data: [], error: null };

      if (competitorsError) throw competitorsError;
      return { project: project as Project, competitors: (competitors || []) as Competitor[] };
    },

    async getProject(projectId: string) {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (error) return null;
      return data as Project;
    },

    async getCompetitors(projectId: string) {
      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return (data || []) as Competitor[];
    },

    async updateProjectStatus(projectId: string, status: ProjectStatus, errorMessage?: string | null) {
      const { error } = await supabase
        .from("projects")
        .update({
          status,
          error_message: errorMessage ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
      if (error) throw error;
    },

    async createAuditQueries(projectId: string, queries: AuditQuery[]) {
      const { data, error } = await supabase
        .from("audit_queries")
        .insert(
          queries.map((query) => ({
            project_id: projectId,
            query: query.query,
            intent: query.intent,
            buyer_stage: query.buyer_stage,
          })),
        )
        .select("*");
      if (error) throw error;
      return (data || []) as AuditQuery[];
    },

    async createAIResults(projectId: string, results: AIResult[]) {
      const { data, error } = await supabase
        .from("ai_results")
        .insert(
          results.map((result) => ({
            project_id: projectId,
            query_id: result.query_id,
            source: result.source,
            answer: result.answer,
            target_brand_mentioned: result.target_brand_mentioned,
            mentioned_brands: result.mentioned_brands,
            competitors_mentioned: result.competitors_mentioned,
            citations: result.citations,
            sentiment: result.sentiment,
            issues: result.issues,
            raw_response: result.raw_response,
          })),
        )
        .select("*");
      if (error) throw error;
      return (data || []) as AIResult[];
    },

    async createCrawledPages(projectId: string, pages: CrawledPage[]) {
      const { data, error } = await supabase
        .from("crawled_pages")
        .insert(
          pages.map((page) => ({
            project_id: projectId,
            url: page.url,
            title: page.title,
            meta_description: page.meta_description,
            h1: page.h1,
            h2: page.h2,
            text_content: page.text_content,
            schema_json: page.schema_json,
            word_count: page.word_count,
          })),
        )
        .select("*");
      if (error) throw error;
      return (data || []) as CrawledPage[];
    },

    async createAuditReport(projectId: string, reportJson: AuditReportJson) {
      const { data, error } = await supabase
        .from("audit_reports")
        .insert({
          project_id: projectId,
          visibility_score: reportJson.summary.visibility_score,
          mention_rate: reportJson.summary.mention_rate,
          competitor_avg_mention_rate: reportJson.summary.competitor_avg_mention_rate,
          content_score: reportJson.summary.content_score,
          trust_score: reportJson.summary.trust_score,
          technical_score: reportJson.summary.technical_score,
          report_json: reportJson,
          public_share_id: crypto.randomUUID(),
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as AuditReport;
    },

    async getReportBundle(projectId: string): Promise<ReportBundle | null> {
      const project = await this.getProject(projectId);
      if (!project) return null;

      const [competitors, queries, aiResults, crawledPages, report] = await Promise.all([
        this.getCompetitors(projectId),
        supabase.from("audit_queries").select("*").eq("project_id", projectId),
        supabase.from("ai_results").select("*").eq("project_id", projectId),
        supabase.from("crawled_pages").select("*").eq("project_id", projectId),
        supabase
          .from("audit_reports")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (queries.error) throw queries.error;
      if (aiResults.error) throw aiResults.error;
      if (crawledPages.error) throw crawledPages.error;
      if (report.error) throw report.error;

      return {
        project,
        competitors,
        queries: (queries.data || []) as AuditQuery[],
        aiResults: (aiResults.data || []) as AIResult[],
        crawledPages: (crawledPages.data || []) as CrawledPage[],
        report: (report.data as AuditReport | null) || null,
      };
    },
  };
}
