export type ProjectStatus =
  | "created"
  | "generating_queries"
  | "running_ai_search"
  | "crawling_website"
  | "analyzing"
  | "completed"
  | "failed";

export interface Project {
  id: string;
  user_id: string | null;
  brand_name: string;
  website_url: string;
  industry?: string;
  target_market?: string;
  buyer_type?: string;
  main_products?: string[];
  status: ProjectStatus;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id?: string;
  project_id?: string;
  name: string;
  website_url?: string;
}
