export type BuyerIntent =
  | "supplier_discovery"
  | "comparison"
  | "certification"
  | "pricing"
  | "quality"
  | "logistics"
  | "risk_check"
  | "customization";

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
  external_links?: string[];
  same_as_links?: string[];
  word_count: number;
}

export interface WebsiteCrawlStatus {
  status: "success" | "partial" | "failed";
  analyzed_pages: number;
  urls: string[];
  crawl_error?: string;
  mock_fallback_used: boolean;
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
  mode: "website_crawled_baseline" | "ai_visibility_sampling";
  data_source_status: {
    mode: "website_crawled_baseline";
    ai_search_connected: false;
    external_search_connected: false;
    website_crawl_status: "success" | "partial" | "failed";
    mock_fallback_used: boolean;
    generated_from_user_input: boolean;
    analyzed_pages: number;
    crawl_error?: string;
  };
  website_crawl: WebsiteCrawlStatus;
  summary: {
    visibility_score: number;
    baseline_readiness_score: number;
    website_content_coverage_score: number;
    buyer_decision_info_coverage: number;
    external_evidence_score: number;
    competitor_setup_score: number;
    ai_answer_presence: "not_connected";
    mention_rate: number;
    competitor_avg_mention_rate: number;
    content_score: number;
    trust_score: number;
    technical_score: number;
    core_missing_information: string[];
    high_priority_actions: string[];
    score_rationale: {
      factor: string;
      score: number;
      reason: string;
      recommendation: string;
    }[];
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
  buyer_queries: {
    query: string;
    intent: BuyerIntent;
    buyer_stage: BuyerStage;
    mentioned_target: boolean;
    competitors_mentioned: string[];
    citations: Citation[];
    confidence: number;
    visibility_score: number;
    gap: string;
    recommendation: string;
    related_metric?: string;
  }[];
  buyer_query_simulation: {
    query: string;
    intent: BuyerIntent;
    buyer_stage: BuyerStage;
    related_metric: string;
  }[];
  competitor_comparison: {
    name: string;
    mention_count: number;
    mention_rate: number;
    average_position: number | null;
    strengths: string[];
    gaps_vs_target: string[];
    recommended_response: string;
    evidence: string[];
  }[];
  competitor_gap_diagnosis: {
    competitors: {
      competitor_name: string;
      status: "tracking_ready";
      note: string;
    }[];
    empty_state?: string;
  };
  website_content: {
    key: string;
    label: string;
    dimension: string;
    status: "present" | "partial" | "missing";
    completeness_score: number;
    evidence: string | string[];
    recommendation: string;
    owner: string;
    affected_metric: string;
  }[];
  content_coverage: {
    key: string;
    label: string;
    status: "present" | "partial" | "missing";
    evidence: string[];
    recommendation: string;
    affected_metric: string;
  }[];
  external_trust: {
    source: string;
    status: "present" | "partial" | "missing";
    credibility_score: number;
    evidence: string;
    recommendation: string;
  }[];
  external_evidence: {
    external_evidence_mode: "website_links_only" | "not_connected";
    external_search_connected: false;
    same_as_links: string[];
    external_identity_links: string[];
    entity_evidence_candidates: {
      platform: string;
      url: string;
      source: "website_link" | "schema_sameAs";
    }[];
    note: string;
  };
  technical_audit: {
    item: string;
    status: "pass" | "warning" | "fail";
    impact: string;
    recommendation: string;
  }[];
  missing_content: string[];
  recommended_pages: {
    title: string;
    priority: "high" | "medium" | "low";
    reason: string;
    affected_metric: string;
  }[];
  action_plan: {
    priority: "high" | "medium" | "low";
    action: string;
    reason: string;
    affected_metric: string;
    implementation_steps: string[];
    verification_method: string;
    expected_impact: string;
    owner: string;
    timeframe: string;
    source_module: string;
  }[];
  weak_sections: string[];
  recommended_copy_improvements: string[];
  visualizations: {
    query_heatmap: {
      label: string;
      intent: BuyerIntent;
      score: number;
      status: "visible" | "weak" | "missing";
    }[];
    competitor_bars: {
      name: string;
      mention_rate: number;
    }[];
    content_radar: {
      dimension: string;
      score: number;
    }[];
    trust_matrix: {
      source: string;
      score: number;
    }[];
  };
}
