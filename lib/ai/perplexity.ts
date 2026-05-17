import type { Citation } from "@/types/audit";
import type { Competitor, Project } from "@/types/project";
import { runDemoSearch } from "./demo";

export async function runPerplexitySearch(input: {
  query: string;
  project: Project;
  competitors: Competitor[];
  index: number;
}): Promise<{
  answer: string;
  citations: Citation[];
  raw: unknown;
  source: "perplexity" | "demo";
}> {
  if (!process.env.PERPLEXITY_API_KEY) {
    return runDemoSearch(input);
  }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI search assistant. Answer with sources when possible.",
          },
          {
            role: "user",
            content: input.query,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Perplexity API error: ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      citations?: Citation[];
    };

    return {
      answer: data.choices?.[0]?.message?.content || "",
      citations: data.citations || [],
      raw: data,
      source: "perplexity",
    };
  } catch {
    return runDemoSearch(input);
  }
}
