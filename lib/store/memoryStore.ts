import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AIResult, AuditQuery, AuditReportJson, CrawledPage } from "@/types/audit";
import type { Competitor, Project, ProjectStatus } from "@/types/project";
import type { AuditReport } from "@/types/report";
import type { AuditStore, CreateProjectInput, ReportBundle } from "./types";

interface LocalState {
  projects: Map<string, Project>;
  competitors: Map<string, Competitor[]>;
  queries: Map<string, AuditQuery[]>;
  aiResults: Map<string, AIResult[]>;
  crawledPages: Map<string, CrawledPage[]>;
  reports: Map<string, AuditReport>;
}

interface PersistedState {
  projects: Project[];
  competitors: Record<string, Competitor[]>;
  queries: Record<string, AuditQuery[]>;
  aiResults: Record<string, AIResult[]>;
  crawledPages: Record<string, CrawledPage[]>;
  reports: Record<string, AuditReport>;
}

function getStorePath() {
  return process.env.LOCAL_AUDIT_STORE_PATH || join(process.cwd(), ".data", "audit-store.json");
}

function createState(): LocalState {
  return {
    projects: new Map(),
    competitors: new Map(),
    queries: new Map(),
    aiResults: new Map(),
    crawledPages: new Map(),
    reports: new Map(),
  };
}

function toPersistedState(state: LocalState): PersistedState {
  return {
    projects: Array.from(state.projects.values()),
    competitors: Object.fromEntries(state.competitors.entries()),
    queries: Object.fromEntries(state.queries.entries()),
    aiResults: Object.fromEntries(state.aiResults.entries()),
    crawledPages: Object.fromEntries(state.crawledPages.entries()),
    reports: Object.fromEntries(state.reports.entries()),
  };
}

function fromPersistedState(persisted: PersistedState): LocalState {
  return {
    projects: new Map(persisted.projects.map((project) => [project.id, project])),
    competitors: new Map(Object.entries(persisted.competitors || {})),
    queries: new Map(Object.entries(persisted.queries || {})),
    aiResults: new Map(Object.entries(persisted.aiResults || {})),
    crawledPages: new Map(Object.entries(persisted.crawledPages || {})),
    reports: new Map(Object.entries(persisted.reports || {})),
  };
}

function getState() {
  const storePath = getStorePath();
  if (!existsSync(storePath)) return createState();

  try {
    return fromPersistedState(JSON.parse(readFileSync(storePath, "utf8")) as PersistedState);
  } catch {
    return createState();
  }
}

function saveState(state: LocalState) {
  const storePath = getStorePath();
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(toPersistedState(state), null, 2));
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

export function createMemoryStore(): AuditStore {
  return {
    async createProject(input: CreateProjectInput) {
      const state = getState();
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
      saveState(state);

      return { project, competitors };
    },

    async getProject(projectId: string) {
      const state = getState();
      return state.projects.get(projectId) || null;
    },

    async getCompetitors(projectId: string) {
      const state = getState();
      return state.competitors.get(projectId) || [];
    },

    async updateProjectStatus(projectId: string, status: ProjectStatus, errorMessage?: string | null) {
      const state = getState();
      const project = state.projects.get(projectId);
      if (!project) return;
      state.projects.set(projectId, {
        ...project,
        status,
        error_message: errorMessage ?? null,
        updated_at: now(),
      });
      saveState(state);
    },

    async createAuditQueries(projectId: string, queries: AuditQuery[]) {
      const state = getState();
      const saved = queries.map((query) => ({
        ...query,
        id: query.id || id("query"),
        project_id: projectId,
      }));
      state.queries.set(projectId, saved);
      saveState(state);
      return saved;
    },

    async createAIResults(projectId: string, results: AIResult[]) {
      const state = getState();
      const saved = results.map((result) => ({
        ...result,
        id: result.id || id("result"),
        project_id: projectId,
      }));
      state.aiResults.set(projectId, saved);
      saveState(state);
      return saved;
    },

    async createCrawledPages(projectId: string, pages: CrawledPage[]) {
      const state = getState();
      const saved = pages.map((page) => ({
        ...page,
        id: page.id || id("page"),
        project_id: projectId,
      }));
      state.crawledPages.set(projectId, saved);
      saveState(state);
      return saved;
    },

    async createAuditReport(projectId: string, reportJson: AuditReportJson) {
      const state = getState();
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
      saveState(state);
      return report;
    },

    async getReportBundle(projectId: string): Promise<ReportBundle | null> {
      const state = getState();
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
