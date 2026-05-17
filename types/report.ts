import type { AuditReportJson } from "./audit";

export interface AuditReport {
  id: string;
  project_id: string;
  visibility_score: number;
  mention_rate: number;
  competitor_avg_mention_rate: number;
  content_score: number;
  trust_score: number;
  technical_score: number;
  report_json: AuditReportJson;
  public_share_id: string;
  created_at: string;
}
