import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const bundle = await getStore().getReportBundle(projectId);

  if (!bundle) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
