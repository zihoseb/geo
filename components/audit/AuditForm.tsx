"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const emptyCompetitors = [
  { name: "", websiteUrl: "" },
  { name: "", websiteUrl: "" },
  { name: "", websiteUrl: "" },
];

export function AuditForm() {
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [buyerType, setBuyerType] = useState("");
  const [mainProducts, setMainProducts] = useState("");
  const [competitors, setCompetitors] = useState(emptyCompetitors);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          websiteUrl,
          industry,
          targetMarket,
          buyerType,
          mainProducts,
          competitors,
        }),
      });
      const payload = (await response.json()) as { projectId?: string; mock?: boolean; error?: string };

      if (payload.projectId) {
        window.location.assign(`/audit/${payload.projectId}`);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create project.");
      }

      throw new Error(payload.error || "Unable to create project.");
    } catch (submitError) {
      console.error("Create project failed:", submitError);
      window.location.assign("/audit/demo-project");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create AI visibility audit</CardTitle>
        <CardDescription>
          Enter the brand, site, products, buyer profile, and competitors to generate the audit report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Brand Name
              <Input value={brandName} onChange={(event) => setBrandName(event.target.value)} required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Website URL
              <Input
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://example.com"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Industry
              <Input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="Silicone Kitchenware Manufacturer"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Target Market
              <Input
                value={targetMarket}
                onChange={(event) => setTargetMarket(event.target.value)}
                placeholder="US / EU"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Buyer Type
              <Input
                value={buyerType}
                onChange={(event) => setBuyerType(event.target.value)}
                placeholder="Kitchenware brands"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Main Products
              <Input
                value={mainProducts}
                onChange={(event) => setMainProducts(event.target.value)}
                placeholder="silicone spatula, silicone baking mat"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold">Competitors</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add up to three competitors for comparison.</p>
            </div>
            <div className="grid gap-3">
              {competitors.map((competitor, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={competitor.name}
                    onChange={(event) => {
                      const next = [...competitors];
                      next[index] = { ...next[index], name: event.target.value };
                      setCompetitors(next);
                    }}
                    placeholder="Competitor Name"
                  />
                  <Input
                    value={competitor.websiteUrl}
                    onChange={(event) => {
                      const next = [...competitors];
                      next[index] = { ...next[index], websiteUrl: event.target.value };
                      setCompetitors(next);
                    }}
                    placeholder="Competitor Website URL optional"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Extra notes
            <Textarea placeholder="Optional: target buyers, priority regions, certificates, or product categories." />
          </label>

          {error ? <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Creating audit" : "Start Audit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
