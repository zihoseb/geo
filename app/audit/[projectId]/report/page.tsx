import Link from "next/link";
import { ReportView } from "@/components/audit/ReportView";
import { buildMockReportBundle } from "@/lib/mock/report";
import { getStore } from "@/lib/store";
import type { ReportBundle } from "@/lib/store/types";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  let bundle: ReportBundle | null = null;

  try {
    bundle = await getStore(projectId).getReportBundle(projectId);
  } catch (error) {
    console.error("Failed to load report:", error);
  }

  if (!bundle?.report) {
    bundle = buildMockReportBundle(projectId, {
      project: bundle?.project,
      competitors: bundle?.competitors,
    });
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link className="text-sm font-semibold text-primary" href="/">
              B2B AI Visibility Audit
            </Link>
            <h1 className="mt-4 text-4xl font-semibold">{bundle.project.brand_name} AI Visibility Report</h1>
            <p className="mt-2 text-muted-foreground">{bundle.project.website_url}</p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-muted"
            href="/audit/new"
          >
            New Audit
          </Link>
        </header>
        <ReportView bundle={bundle} />
      </div>
    </main>
  );
}
