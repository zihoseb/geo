import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isPrivateOrLocalUrl, isValidHttpUrl, normalizeUrl } from "@/lib/utils/url";

interface CreateProjectBody {
  brandName?: string;
  websiteUrl?: string;
  industry?: string;
  targetMarket?: string;
  buyerType?: string;
  mainProducts?: string[] | string;
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

export async function POST(request: NextRequest) {
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

    const store = getStore();
    const { project } = await store.createProject({
      brandName,
      websiteUrl,
      industry: body.industry?.trim(),
      targetMarket: body.targetMarket?.trim(),
      buyerType: body.buyerType?.trim(),
      mainProducts: parseProducts(body.mainProducts),
      competitors:
        body.competitors?.map((competitor) => ({
          name: competitor.name?.trim() || "",
          websiteUrl: competitor.websiteUrl?.trim(),
        })) || [],
    });

    return NextResponse.json({ projectId: project.id });
  } catch {
    return NextResponse.json(
      { error: "We could not create this audit project. Please try again." },
      { status: 500 },
    );
  }
}
