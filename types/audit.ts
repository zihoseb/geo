export type BuyerIntent =
  | "supplier_discovery"
  | "comparison"
  | "certification"
  | "pricing"
  | "quality"
  | "logistics"
  | "risk_check";

export type BuyerStage = "awareness" | "consideration" | "decision";

export interface AuditQuery {
  id?: string;
  project_id?: string;
  query: string;
  intent: BuyerIntent;
  buyer_stage: BuyerStage;
}

export interface Citation {
  title?: string;
  url: string;
  source?: string;
}

export interface AIResult {
  id?: string;
  project_id: string;
  query_id: string;
  source: "perplexity" | "openai" | "demo";
  answer: string;
  target_brand_mentioned: boolean;
  mentioned_brands: string[];
  competitors_mentioned: string[];
  citations: Citation[];
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned";
  issues: string[];
  raw_response?: unknown;
}

export interface CrawledPage {
  id?: string;
  project_id?: string;
  url: string;
  title?: string;
  meta_description?: string;
  h1?: string;
  h2?: string[];
  text_content: string;
  schema_json?: unknown;
  word_count: number;
}

export interface WebsiteAuditResult {
  content_score: number;
  missing_information: string[];
  weak_sections: string[];
  recommended_pages: {
    title: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }[];
  recommended_copy_improvements: string[];
  priority_actions: {
    priority: "high" | "medium" | "low";
    action: string;
    expected_impact: string;
  }[];
}

export interface AuditReportJson {
  summary: {
    visibility_score: number;
    mention_rate: number;
    competitor_avg_mention_rate: number;
    content_score: number;
    trust_score: number;
    technical_score: number;
  };
  brand_mentions: {
    total_queries: number;
    target_mentions: number;
    competitors: {
      name: string;
      mention_count: number;
      mention_rate: number;
    }[];
  };
  query_results: {
    query: string;
    source: string;
    target_brand_mentioned: boolean;
    competitors_mentioned: string[];
    citations: Citation[];
  }[];
  missing_content: string[];
  recommended_pages: {
    title: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }[];
  action_plan: {
    priority: "high" | "medium" | "low";
    action: string;
    expected_impact: string;
  }[];
  weak_sections: string[];
  recommended_copy_improvements: string[];
}
