import OpenAI from "openai";
import type { AuditQuery, WebsiteAuditResult } from "@/types/audit";
import {
  analyzeDemoMention,
  analyzeDemoWebsiteContent,
  generateDemoBuyerQueries,
} from "./demo";
import {
  buildBuyerQueryPrompt,
  buildMentionAnalysisPrompt,
  buildWebsiteAuditPrompt,
} from "./prompts";

export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return fallback;

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return fallback;
    }
  }
}

async function runOpenAIJson<T>(prompt: string, fallback: T): Promise<T> {
  if (!process.env.OPENAI_API_KEY) return fallback;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    return safeJsonParse(response.output_text, fallback);
  } catch {
    return fallback;
  }
}

export async function generateBuyerQueries(input: {
  brandName: string;
  industry?: string;
  products?: string[];
  targetMarket?: string;
  buyerType?: string;
  count?: number;
}): Promise<AuditQuery[]> {
  const fallback = generateDemoBuyerQueries(input);
  const prompt = buildBuyerQueryPrompt({
    brandName: input.brandName,
    industry: input.industry || "B2B supplier",
    products: input.products,
    targetMarket: input.targetMarket,
    buyerType: input.buyerType,
    count: input.count || 10,
  });

  return runOpenAIJson<AuditQuery[]>(prompt, fallback);
}

export async function analyzeMention(input: {
  brandName: string;
  competitors: string[];
  answer: string;
  citations?: { title?: string; url: string }[];
}) {
  const fallback = analyzeDemoMention(input);
  const prompt = buildMentionAnalysisPrompt(input);
  return runOpenAIJson<typeof fallback>(prompt, fallback);
}

export async function analyzeWebsiteContent(input: {
  brandName: string;
  industry?: string;
  buyerType?: string;
  websiteText: string;
}): Promise<WebsiteAuditResult> {
  const fallback = analyzeDemoWebsiteContent(input);
  const prompt = buildWebsiteAuditPrompt({
    brandName: input.brandName,
    industry: input.industry || "B2B supplier",
    buyerType: input.buyerType,
    websiteText: input.websiteText,
  });

  return runOpenAIJson<WebsiteAuditResult>(prompt, fallback);
}
