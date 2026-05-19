import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit/runAudit";
import { buildMockReport } from "@/lib/mock/report";

export async function POST(request: NextRequest) {
  let projectId = "demo-project";

  try {
    const body = (await request.json()) as { projectId?: string };

    if (!body.projectId) {
      return NextResponse.json({ ok: false, error: "Project id is required." }, { status: 400 });
    }

    projectId = body.projectId;
    const result = await runAudit(projectId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Build report failed:", error);
    console.warn("Falling back to mock report:", error);

    return NextResponse.json({
      ok: true,
      projectId,
      reportId: "mock-report",
      mock: true,
      report: buildMockReport(projectId),
    });
  }
}
