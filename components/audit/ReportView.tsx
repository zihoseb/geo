import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { ReportBundle } from "@/lib/store/types";
import type { AuditReportJson } from "@/types/audit";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function scoreLabel(score: number) {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Needs work";
  return "Critical gap";
}

function scoreBarClass(score: number) {
  if (score >= 70) return "bg-emerald-600";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

function statusVariant(status: string) {
  if (["pass", "present", "visible"].includes(status)) return "success";
  if (["warning", "partial", "weak"].includes(status)) return "warning";
  return "outline";
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-2 h-2 rounded-full bg-secondary">
      <div className={`h-2 rounded-full ${scoreBarClass(score)}`} style={{ width: `${Math.max(4, score)}%` }} />
    </div>
  );
}

function RateBar({ value }: { value: number }) {
  return (
    <div className="h-2 min-w-28 rounded-full bg-secondary">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, Math.round(value * 100))}%` }} />
    </div>
  );
}

function buildLegacyBuyerQueries(report: AuditReportJson): AuditReportJson["buyer_queries"] {
  return report.query_results.map((result) => ({
    query: result.query,
    intent: "supplier_discovery",
    buyer_stage: "awareness",
    mentioned_target: result.target_brand_mentioned,
    competitors_mentioned: result.competitors_mentioned,
    citations: result.citations,
    confidence: result.citations.length ? 72 : 58,
    visibility_score: result.target_brand_mentioned ? 72 : 24,
    gap: result.target_brand_mentioned
      ? "The brand appears for this query, but the answer still needs stronger proof."
      : "The brand is missing from this buyer question.",
    recommendation: "Add a buyer-intent page that answers this question with proof, citations, and procurement details.",
  }));
}

export function ReportView({ bundle }: { bundle: ReportBundle }) {
  const report = bundle.report?.report_json;

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report is not ready</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The audit has not generated a report for this project yet.
        </CardContent>
      </Card>
    );
  }

  const buyerQueries = report.buyer_queries?.length ? report.buyer_queries : buildLegacyBuyerQueries(report);
  const competitorComparison = report.competitor_comparison?.length
    ? report.competitor_comparison
    : report.brand_mentions.competitors.map((competitor) => ({
        ...competitor,
        average_position: null,
        strengths: ["Visible in AI buyer answers."],
        gaps_vs_target: ["Target brand needs stronger sourceable proof."],
        recommended_response: "Create comparison-ready proof pages around procurement questions.",
        evidence: [],
      }));
  const websiteContent = report.website_content?.length
    ? report.website_content
    : report.missing_content.map((gap) => ({
        dimension: gap,
        status: "missing" as const,
        completeness_score: 20,
        evidence: "Missing from the generated report.",
        recommendation: "Add a dedicated section or page that answers this buyer requirement.",
        owner: "Content lead",
      }));
  const externalTrust = report.external_trust || [];
  const technicalAudit = report.technical_audit || [];
  const scoreRationale = report.summary.score_rationale || [];

  const scores = [
    ["AI Visibility Score", report.summary.visibility_score.toString(), report.summary.visibility_score],
    ["Brand Mention Rate", percent(report.summary.mention_rate), Math.round(report.summary.mention_rate * 100)],
    [
      "Competitor Average Mention Rate",
      percent(report.summary.competitor_avg_mention_rate),
      Math.round(report.summary.competitor_avg_mention_rate * 100),
    ],
    ["Content Score", report.summary.content_score.toString(), report.summary.content_score],
    ["Trust Score", report.summary.trust_score.toString(), report.summary.trust_score],
    ["Technical Score", report.summary.technical_score.toString(), report.summary.technical_score],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>
            {bundle.project.brand_name} is visible in {report.brand_mentions.target_mentions} of{" "}
            {report.brand_mentions.total_queries} buyer questions. The fastest wins are procurement proof,
            trust signals, and extractable technical structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            {scores.map(([label, value, score]) => (
              <div key={label} className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="text-3xl font-semibold">{value}</div>
                  <Badge variant={statusVariant(scoreLabel(Number(score)) === "Strong" ? "pass" : "warning")}>
                    {scoreLabel(Number(score))}
                  </Badge>
                </div>
                <ScoreBar score={Number(score)} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">Core Missing Information</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {(report.summary.core_missing_information || report.missing_content).slice(0, 6).map((item) => (
                  <li key={item} className="rounded-md bg-secondary px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">High Priority Actions</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
                {(report.summary.high_priority_actions || report.action_plan.map((item) => item.action))
                  .slice(0, 4)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold">Score Rationale</h3>
              <div className="mt-3 flex flex-col gap-3">
                {scoreRationale.map((item) => (
                  <div key={item.factor}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{item.factor}</span>
                      <span className="text-muted-foreground">{item.score}/100</span>
                    </div>
                    <ScoreBar score={item.score} />
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Queries Analysis</CardTitle>
          <CardDescription>
            Heatmap view of buyer questions where the brand is visible, weak, or missing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-2 md:grid-cols-5">
            {buyerQueries.map((query) => (
              <div
                key={query.query}
                className="rounded-md border border-border p-3"
                title={query.query}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={query.mentioned_target ? "success" : "warning"}>
                    {query.mentioned_target ? "Visible" : "Missing"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{query.visibility_score}</span>
                </div>
                <div className="mt-3 line-clamp-3 text-xs leading-5">{query.query}</div>
                <ScoreBar score={query.visibility_score} />
              </div>
            ))}
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Buyer Question</TH>
                <TH>Category</TH>
                <TH>Target Brand</TH>
                <TH>Competitors</TH>
                <TH>Confidence</TH>
                <TH>Actionable Recommendation</TH>
              </TR>
            </THead>
            <TBody>
              {buyerQueries.map((query) => (
                <TR key={query.query}>
                  <TD className="max-w-sm">{query.query}</TD>
                  <TD>
                    <Badge variant="outline">{query.intent.replaceAll("_", " ")}</Badge>
                  </TD>
                  <TD>
                    <Badge variant={query.mentioned_target ? "success" : "warning"}>
                      {query.mentioned_target ? "Mentioned" : "Ignored"}
                    </Badge>
                  </TD>
                  <TD>{query.competitors_mentioned.join(", ") || "None"}</TD>
                  <TD>{query.confidence}/100</TD>
                  <TD className="min-w-80 text-muted-foreground">{query.recommendation}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competitor Comparison</CardTitle>
          <CardDescription>
            Mention-rate gap and content signals that explain why competitors appear in AI answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 md:grid-cols-2">
            {report.visualizations?.competitor_bars?.map((item) => (
              <div key={item.name} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{percent(item.mention_rate)}</span>
                </div>
                <RateBar value={item.mention_rate} />
              </div>
            ))}
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Competitor</TH>
                <TH>Mentions</TH>
                <TH>Mention Rate</TH>
                <TH>Avg Position</TH>
                <TH>Core Strengths</TH>
                <TH>Response</TH>
              </TR>
            </THead>
            <TBody>
              {competitorComparison.map((competitor) => (
                <TR key={competitor.name}>
                  <TD className="font-medium">{competitor.name}</TD>
                  <TD>{competitor.mention_count}</TD>
                  <TD>{percent(competitor.mention_rate)}</TD>
                  <TD>{competitor.average_position ?? "N/A"}</TD>
                  <TD className="min-w-72 text-muted-foreground">{competitor.strengths.join(" ")}</TD>
                  <TD className="min-w-80 text-muted-foreground">{competitor.recommended_response}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Website Content Audit</CardTitle>
            <CardDescription>
              Procurement content coverage across company, product, certification, MOQ, lead time, QC, export, cases, contact, and FAQ.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Dimension</TH>
                  <TH>Status</TH>
                  <TH>Coverage</TH>
                  <TH>Owner</TH>
                  <TH>Recommendation</TH>
                </TR>
              </THead>
              <TBody>
                {websiteContent.map((item) => (
                  <TR key={item.dimension}>
                    <TD className="font-medium">{item.dimension}</TD>
                    <TD>
                      <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                    </TD>
                    <TD>
                      <div className="flex min-w-28 items-center gap-2">
                        <RateBar value={item.completeness_score / 100} />
                        <span className="text-xs text-muted-foreground">{item.completeness_score}</span>
                      </div>
                    </TD>
                    <TD>{item.owner}</TD>
                    <TD className="min-w-80 text-muted-foreground">{item.recommendation}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Trust & References</CardTitle>
            <CardDescription>
              Third-party signals that help AI answers corroborate brand claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {externalTrust.map((item) => (
              <div key={item.source} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.source}</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.recommendation}</p>
                  </div>
                  <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                </div>
                <ScoreBar score={item.credibility_score} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical SEO & Schema Audit</CardTitle>
          <CardDescription>
            Extractability checks for title, metadata, headings, canonical tags, schema, sitemap, and robots rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Check</TH>
                <TH>Status</TH>
                <TH>AI Visibility Impact</TH>
                <TH>Fix</TH>
              </TR>
            </THead>
            <TBody>
              {technicalAudit.map((item) => (
                <TR key={item.item}>
                  <TD className="font-medium">{item.item}</TD>
                  <TD>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </TD>
                  <TD className="min-w-80 text-muted-foreground">{item.impact}</TD>
                  <TD className="min-w-80 text-muted-foreground">{item.recommendation}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>30-Day Action Plan</CardTitle>
          <CardDescription>
            Prioritized execution plan generated from query gaps, competitor pressure, content coverage, trust signals, and technical audit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Priority</TH>
                <TH>Timeframe</TH>
                <TH>Action</TH>
                <TH>Expected Impact</TH>
                <TH>Owner</TH>
                <TH>Source</TH>
              </TR>
            </THead>
            <TBody>
              {report.action_plan.map((item) => (
                <TR key={`${item.timeframe}-${item.action}`}>
                  <TD>
                    <Badge variant={item.priority === "high" ? "warning" : "outline"}>{item.priority}</Badge>
                  </TD>
                  <TD>{item.timeframe}</TD>
                  <TD className="min-w-80 font-medium">{item.action}</TD>
                  <TD className="min-w-80 text-muted-foreground">{item.expected_impact}</TD>
                  <TD>{item.owner}</TD>
                  <TD>{item.source_module}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
