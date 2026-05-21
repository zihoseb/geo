import { generateBaselineBuyerQueries, generateBaselineReportJson } from "@/lib/analysis/generateBaselineReportJson";
import { createDemoCrawledPages } from "@/lib/ai/demo";
import { crawlWebsite } from "@/lib/crawler/crawlWebsite";
import { DEMO_PROJECT_ID, getStore } from "@/lib/store";
import type { AuditStore } from "@/lib/store/types";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { CrawledPage, WebsiteCrawlStatus } from "@/types/audit";
import type { Project } from "@/types/project";

async function ensureDemoProject(projectId: string, store: AuditStore) {
  if (projectId !== DEMO_PROJECT_ID) return null;

  const existingProject = await store.getProject(projectId);
  if (existingProject) return existingProject;

  const { project } = await store.createProject({
    projectId: DEMO_PROJECT_ID,
    brandName: "Demo B2B Brand",
    websiteUrl: "https://example.com",
    industry: "B2B Export Manufacturer",
    targetMarket: "US / EU",
    buyerType: "Procurement teams",
    mainProducts: ["industrial components", "custom assemblies"],
    competitors: [
      { name: "Global Supplier Co" },
      { name: "North Star Manufacturing" },
    ],
  });

  return project;
}

async function getCrawledPages(project: Project): Promise<{
  pages: CrawledPage[];
  crawlStatus: WebsiteCrawlStatus;
}> {
  try {
    const pages = await crawlWebsite(project.website_url);
    if (pages.length > 0) {
      return {
        pages,
        crawlStatus: {
          status: pages.length >= 2 ? "success" : "partial",
          analyzed_pages: pages.length,
          urls: pages.map((page) => page.url),
          mock_fallback_used: false,
        },
      };
    }
    throw new Error("Crawler returned no pages.");
  } catch (error) {
    const pages = createDemoCrawledPages(project);
    return {
      pages,
      crawlStatus: {
        status: "failed",
        analyzed_pages: 0,
        urls: [],
        crawl_error: error instanceof Error ? error.message : "Website crawl failed.",
        mock_fallback_used: true,
      },
    };
  }
}

export async function runAudit(projectId: string) {
  console.log("Starting audit:", projectId);
  const store = getStore(projectId);
  const project = (await store.getProject(projectId)) || (await ensureDemoProject(projectId, store));
  if (!project) {
    throw new Error("Project not found.");
  }

  try {
    const competitors = await store.getCompetitors(projectId);

    console.log("Generating buyer questions...");
    await store.updateProjectStatus(projectId, "generating_queries");
    const generatedQueries = generateBaselineBuyerQueries(project);
    const queries = await store.createAuditQueries(projectId, generatedQueries);

    console.log("Crawling website content...");
    await store.updateProjectStatus(projectId, "crawling_website");
    const { pages: crawledPages, crawlStatus } = await getCrawledPages(project);
    await store.createCrawledPages(projectId, crawledPages);

    console.log("Analyzing gaps and scores...");
    await store.updateProjectStatus(projectId, "analyzing");
    console.log("Building report...");
    const reportJson = generateBaselineReportJson({
      project,
      competitors,
      queries,
      crawledPages,
      crawlStatus,
    });
    const report = await store.createAuditReport(projectId, reportJson);

    await store.updateProjectStatus(projectId, "completed");
    return {
      ok: true,
      status: "completed" as const,
      projectId,
      reportId: report.id,
      mock: projectId === DEMO_PROJECT_ID || !hasSupabaseServerConfig(),
      report: report.report_json,
    };
  } catch (error) {
    console.error("Build report failed:", error);
    try {
      await store.updateProjectStatus(
        projectId,
        "failed",
        error instanceof Error ? error.message : "Audit failed.",
      );
    } catch (statusError) {
      console.error("Failed to mark audit failed:", statusError);
    }
    throw error;
  }
}
