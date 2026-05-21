import { NextRequest, NextResponse } from "next/server";
import { createMemoryStore } from "@/lib/store/memoryStore";
import { createSupabaseStore } from "@/lib/store/supabaseStore";
import { getSupabaseServerConfig, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { isPrivateOrLocalUrl, isValidHttpUrl, normalizeUrl } from "@/lib/utils/url";
import type { CreateProjectInput } from "@/lib/store/types";

interface CreateProjectBody {
  brandName?: string;
  websiteUrl?: string;
  industry?: string;
  targetMarket?: string;
  buyerType?: string;
  mainProducts?: string[] | string;
  extraNotes?: string;
  competitors?: {
    name?: string;
    websiteUrl?: string;
  }[];
}

function parseProducts(input: CreateProjectBody["mainProducts"]) {
  if (Array.isArray(input)) return input.map((item) => item.trim()).filter(Boolean);
  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function buildCreateProjectInput(body: CreateProjectBody, brandName: string, websiteUrl: string): CreateProjectInput {
  return {
    brandName,
    websiteUrl,
    industry: body.industry?.trim(),
    targetMarket: body.targetMarket?.trim(),
    buyerType: body.buyerType?.trim(),
    mainProducts: parseProducts(body.mainProducts),
    extraNotes: body.extraNotes?.trim(),
    competitors:
      body.competitors?.map((competitor) => ({
        name: competitor.name?.trim() || "",
        websiteUrl: competitor.websiteUrl?.trim(),
      })) || [],
  };
}

async function createMockProject(input: CreateProjectInput) {
  const store = createMemoryStore();
  await store.createProject({
    ...input,
    projectId: "demo-project",
  });
  return NextResponse.json({ projectId: "demo-project", mock: true });
}

export async function POST(request: NextRequest) {
  let projectInput: CreateProjectInput | null = null;

  try {
    const body = (await request.json()) as CreateProjectBody;
    const brandName = body.brandName?.trim();
    const websiteUrl = normalizeUrl(body.websiteUrl || "");

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    }

    if (!isValidHttpUrl(websiteUrl) || isPrivateOrLocalUrl(websiteUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid public http or https website URL." },
        { status: 400 },
      );
    }

    projectInput = buildCreateProjectInput(body, brandName, websiteUrl);

    if (!hasSupabaseServerConfig()) {
      const config = getSupabaseServerConfig();
      console.error(
        "Create project failed:",
        new Error(
          [
            "Supabase configuration missing.",
            `NEXT_PUBLIC_SUPABASE_URL=${config.url ? "set" : "missing"}`,
            `NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.anonKey ? "set" : "missing"}`,
            `SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey ? "set" : "missing"}`,
          ].join(" "),
        ),
      );
      return createMockProject(projectInput);
    }

    const store = createSupabaseStore();
    const { project } = await store.createProject({
      ...projectInput,
    });

    return NextResponse.json({ projectId: project.id, mock: false });
  } catch (error) {
    console.error("Create project failed:", error);

    if (projectInput) {
      return createMockProject(projectInput);
    }

    const message = error instanceof Error ? error.message : "Invalid project request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
