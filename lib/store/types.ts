import type { AIResult, AuditQuery, AuditReportJson, CrawledPage } from "@/types/audit";
import type { Competitor, Project, ProjectStatus } from "@/types/project";
import type { AuditReport } from "@/types/report";

export interface CreateProjectInput {
  brandName: string;
  websiteUrl: string;
  industry?: string;
  targetMarket?: string;
  buyerType?: string;
  mainProducts?: string[];
  competitors: {
    name: string;
    websiteUrl?: string;
  }[];
}

export interface ReportBundle {
  project: Project;
  competitors: Competitor[];
  queries: AuditQuery[];
  aiResults: AIResult[];
  crawledPages: CrawledPage[];
  report: AuditReport | null;
}

export interface AuditStore {
  createProject(input: CreateProjectInput): Promise<{ project: Project; competitors: Competitor[] }>;
  getProject(projectId: string): Promise<Project | null>;
  getCompetitors(projectId: string): Promise<Competitor[]>;
  updateProjectStatus(projectId: string, status: ProjectStatus, errorMessage?: string | null): Promise<void>;
  createAuditQueries(projectId: string, queries: AuditQuery[]): Promise<AuditQuery[]>;
  createAIResults(projectId: string, results: AIResult[]): Promise<AIResult[]>;
  createCrawledPages(projectId: string, pages: CrawledPage[]): Promise<CrawledPage[]>;
  createAuditReport(projectId: string, reportJson: AuditReportJson): Promise<AuditReport>;
  getReportBundle(projectId: string): Promise<ReportBundle | null>;
}
