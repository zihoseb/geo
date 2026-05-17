import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit/runAudit";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { projectId?: string };

    if (!body.projectId) {
      return NextResponse.json({ error: "Project id is required." }, { status: 400 });
    }

    const result = await runAudit(body.projectId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We could not complete the audit. Please try again later.",
      },
      { status: 500 },
    );
  }
}
