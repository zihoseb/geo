import Link from "next/link";
import { ArrowRight, CheckCircle2, SearchCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { sampleReport } from "@/lib/sample/sampleReport";

export function Hero() {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_440px] md:items-center md:py-20">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <SearchCheck className="size-5" />
            AI search visibility for B2B brands
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
              Find out if AI recommends your B2B brand
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Run an AI visibility audit and discover whether ChatGPT, Perplexity and other AI search tools mention your company when buyers look for suppliers.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              href="/audit/new"
            >
              Run Free Audit
              <ArrowRight className="size-5" />
            </Link>
            <a
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
              href="#sample-report"
            >
              View Sample Report
            </a>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {["10 buyer queries", "Competitor comparison", "Demo mode included"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Sample visibility report</CardTitle>
              <Badge variant="success">Demo</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <div className="text-sm text-muted-foreground">AI Visibility Score</div>
              <div className="mt-2 text-5xl font-semibold text-foreground">
                {sampleReport.summary.visibility_score}
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: "68%" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Brand mention rate</div>
                <div className="mt-1 text-2xl font-semibold">42%</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Competitor avg.</div>
                <div className="mt-1 text-2xl font-semibold">64%</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {sampleReport.missing_content.slice(0, 3).map((gap) => (
                <div key={gap} className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
                  <span>{gap}</span>
                  <span className="text-muted-foreground">Gap</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
