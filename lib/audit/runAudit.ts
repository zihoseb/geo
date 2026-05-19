import { generateReportJson } from "@/lib/analysis/generateReportJson";
import { calculateTechnicalScore } from "@/lib/analysis/scoreVisibility";
import { analyzeMention, analyzeWebsiteContent, generateBuyerQueries } from "@/lib/ai/openai";
import { runPerplexitySearch } from "@/lib/ai/perplexity";
import { createDemoCrawledPages } from "@/lib/ai/demo";
import { crawlWebsite } from "@/lib/crawler/crawlWebsite";
import { DEMO_PROJECT_ID, getStore } from "@/lib/store";
import type { AuditStore } from "@/lib/store/types";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { AIResult, CrawledPage } from "@/types/audit";
import type { Project } from "@/types/project";

function combineWebsiteText(pages: CrawledPage[]) {
  return pages.map((page) => page.text_content).join("\n\n").slice(0, 60000);
}

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

async function getCrawledPages(project: Project) {
  try {
    const pages = await crawlWebsite(project.website_url);
    return pages.length > 0 ? pages : createDemoCrawledPages(project);
  } catch {
    return createDemoCrawledPages(project);
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
    const generatedQueries = await generateBuyerQueries({
      brandName: project.brand_name,
      industry: project.industry,
      products: project.main_products,
      targetMarket: project.target_market,
      buyerType: project.buyer_type,
      count: 10,
    });
    const queries = await store.createAuditQueries(projectId, generatedQueries.slice(0, 20));

    console.log("Running AI search checks...");
    await store.updateProjectStatus(projectId, "running_ai_search");
    const aiResults: AIResult[] = [];
    for (const [index, query] of queries.entries()) {
      const search = await runPerplexitySearch({
        query: query.query,
        project,
        competitors,
        index,
      });
      const mentionAnalysis = await analyzeMention({
        brandName: project.brand_name,
        competitors: competitors.map((competitor) => competitor.name),
        answer: search.answer,
        citations: search.citations,
      });

      aiResults.push({
        project_id: projectId,
        query_id: query.id || "",
        source: search.source,
        answer: search.answer,
        target_brand_mentioned: mentionAnalysis.target_brand_mentioned,
        mentioned_brands: mentionAnalysis.mentioned_brands,
        competitors_mentioned: mentionAnalysis.competitors_mentioned,
        citations: mentionAnalysis.citations,
        sentiment: mentionAnalysis.sentiment,
        issues: mentionAnalysis.issues,
        raw_response: search.raw,
      });
    }
    const savedResults = await store.createAIResults(projectId, aiResults);

    console.log("Crawling website content...");
    await store.updateProjectStatus(projectId, "crawling_website");
    const crawledPages = await getCrawledPages(project);
    const savedPages = await store.createCrawledPages(projectId, crawledPages);

    console.log("Analyzing gaps and scores...");
    await store.updateProjectStatus(projectId, "analyzing");
    const websiteAudit = await analyzeWebsiteContent({
      brandName: project.brand_name,
      industry: project.industry,
      buyerType: project.buyer_type,
      websiteText: combineWebsiteText(savedPages),
    });
    const firstPage = savedPages[0];
    const schema = firstPage?.schema_json;
    const technicalScore = calculateTechnicalScore({
      hasTitle: Boolean(firstPage?.title),
      hasMetaDescription: Boolean(firstPage?.meta_description),
      hasH1: Boolean(firstPage?.h1),
      hasSchema: Array.isArray(schema) ? schema.length > 0 : Boolean(schema),
      hasSitemap: false,
      hasRobots: false,
      enoughText: (firstPage?.word_count || 0) >= 50,
    });
    console.log("Building report...");
    const reportJson = generateReportJson({
      project,
      competitors,
      queries,
      aiResults: savedResults,
      crawledPages: savedPages,
      websiteAudit,
      technicalScore,
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
