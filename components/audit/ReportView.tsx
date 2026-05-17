import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { ReportBundle } from "@/lib/store/types";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
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

  const scores = [
    ["AI Visibility Score", report.summary.visibility_score.toString()],
    ["Brand Mention Rate", percent(report.summary.mention_rate)],
    ["Competitor Average", percent(report.summary.competitor_avg_mention_rate)],
    ["Content Score", report.summary.content_score.toString()],
    ["Technical Score", report.summary.technical_score.toString()],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        {scores.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="mt-2 text-3xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Mention Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Your brand appeared in {report.brand_mentions.target_mentions} out of{" "}
            {report.brand_mentions.total_queries} AI buyer queries.
          </p>
          <Table>
            <THead>
              <TR>
                <TH>Brand</TH>
                <TH>Mention Count</TH>
                <TH>Mention Rate</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD className="font-medium">{bundle.project.brand_name}</TD>
                <TD>{report.brand_mentions.target_mentions}</TD>
                <TD>{percent(report.summary.mention_rate)}</TD>
              </TR>
              {report.brand_mentions.competitors.map((competitor) => (
                <TR key={competitor.name}>
                  <TD className="font-medium">{competitor.name}</TD>
                  <TD>{competitor.mention_count}</TD>
                  <TD>{percent(competitor.mention_rate)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Query-Level Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Query</TH>
                <TH>Source</TH>
                <TH>Your Brand</TH>
                <TH>Competitors Mentioned</TH>
                <TH>Citations</TH>
              </TR>
            </THead>
            <TBody>
              {report.query_results.map((result) => (
                <TR key={result.query}>
                  <TD className="max-w-xl">{result.query}</TD>
                  <TD>{result.source}</TD>
                  <TD>
                    <Badge variant={result.target_brand_mentioned ? "success" : "warning"}>
                      {result.target_brand_mentioned ? "Mentioned" : "Missing"}
                    </Badge>
                  </TD>
                  <TD>{result.competitors_mentioned.join(", ") || "None"}</TD>
                  <TD>{result.citations.length}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Website Content Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {report.missing_content.map((gap) => (
                <li key={gap} className="rounded-md bg-secondary px-3 py-2">
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Pages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {report.recommended_pages.map((page) => (
              <div key={page.title} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{page.title}</h3>
                  <Badge variant={page.priority === "high" ? "warning" : "outline"}>{page.priority}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{page.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>30-Day Action Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {report.action_plan.map((item, index) => (
            <div key={item.action} className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold">Week {index + 1}</div>
              <h3 className="mt-3 font-semibold">{item.action}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.expected_impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
