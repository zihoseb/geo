import type { AIResult, AuditQuery, AuditReportJson, CrawledPage } from "@/types/audit";
import type { Competitor, Project, ProjectStatus } from "@/types/project";
import type { AuditReport } from "@/types/report";
import type { AuditStore, CreateProjectInput, ReportBundle } from "./types";

interface MemoryState {
  projects: Map<string, Project>;
  competitors: Map<string, Competitor[]>;
  queries: Map<string, AuditQuery[]>;
  aiResults: Map<string, AIResult[]>;
  crawledPages: Map<string, CrawledPage[]>;
  reports: Map<string, AuditReport>;
}

const globalForStore = globalThis as typeof globalThis & {
  __b2bAuditMemoryStore?: MemoryState;
};

function createState(): MemoryState {
  return {
    projects: new Map(),
    competitors: new Map(),
    queries: new Map(),
    aiResults: new Map(),
    crawledPages: new Map(),
    reports: new Map(),
  };
}

function getState() {
  globalForStore.__b2bAuditMemoryStore ||= createState();
  return globalForStore.__b2bAuditMemoryStore;
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

export function createMemoryStore(): AuditStore {
  const state = getState();

  return {
    async createProject(input: CreateProjectInput) {
      const timestamp = now();
      const project: Project = {
        id: id("project"),
        user_id: "demo-user",
        brand_name: input.brandName,
        website_url: input.websiteUrl,
        industry: input.industry,
        target_market: input.targetMarket,
        buyer_type: input.buyerType,
        main_products: input.mainProducts || [],
        status: "created",
        error_message: null,
        created_at: timestamp,
        updated_at: timestamp,
      };
      const competitors = input.competitors
        .filter((competitor) => competitor.name.trim())
        .slice(0, 3)
        .map((competitor) => ({
          id: id("competitor"),
          project_id: project.id,
          name: competitor.name.trim(),
          website_url: competitor.websiteUrl?.trim(),
        }));

      state.projects.set(project.id, project);
      state.competitors.set(project.id, competitors);
      state.queries.set(project.id, []);
      state.aiResults.set(project.id, []);
      state.crawledPages.set(project.id, []);

      return { project, competitors };
    },

    async getProject(projectId: string) {
      return state.projects.get(projectId) || null;
    },

    async getCompetitors(projectId: string) {
      return state.competitors.get(projectId) || [];
    },

    async updateProjectStatus(projectId: string, status: ProjectStatus, errorMessage?: string | null) {
      const project = state.projects.get(projectId);
      if (!project) return;
      state.projects.set(projectId, {
        ...project,
        status,
        error_message: errorMessage ?? null,
        updated_at: now(),
      });
    },

    async createAuditQueries(projectId: string, queries: AuditQuery[]) {
      const saved = queries.map((query) => ({
        ...query,
        id: query.id || id("query"),
        project_id: projectId,
      }));
      state.queries.set(projectId, saved);
      return saved;
    },

    async createAIResults(projectId: string, results: AIResult[]) {
      const saved = results.map((result) => ({
        ...result,
        id: result.id || id("result"),
        project_id: projectId,
      }));
      state.aiResults.set(projectId, saved);
      return saved;
    },

    async createCrawledPages(projectId: string, pages: CrawledPage[]) {
      const saved = pages.map((page) => ({
        ...page,
        id: page.id || id("page"),
        project_id: projectId,
      }));
      state.crawledPages.set(projectId, saved);
      return saved;
    },

    async createAuditReport(projectId: string, reportJson: AuditReportJson) {
      const report: AuditReport = {
        id: id("report"),
        project_id: projectId,
        visibility_score: reportJson.summary.visibility_score,
        mention_rate: reportJson.summary.mention_rate,
        competitor_avg_mention_rate: reportJson.summary.competitor_avg_mention_rate,
        content_score: reportJson.summary.content_score,
        trust_score: reportJson.summary.trust_score,
        technical_score: reportJson.summary.technical_score,
        report_json: reportJson,
        public_share_id: id("share"),
        created_at: now(),
      };
      state.reports.set(projectId, report);
      return report;
    },

    async getReportBundle(projectId: string): Promise<ReportBundle | null> {
      const project = state.projects.get(projectId);
      if (!project) return null;

      return {
        project,
        competitors: state.competitors.get(projectId) || [],
        queries: state.queries.get(projectId) || [],
        aiResults: state.aiResults.get(projectId) || [],
        crawledPages: state.crawledPages.get(projectId) || [],
        report: state.reports.get(projectId) || null,
      };
    },
  };
}
