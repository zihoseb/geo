import { Faq } from "@/components/landing/Faq";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { UseCases } from "@/components/landing/UseCases";

export default function MarketingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <section id="sample-report" className="border-y border-border bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold">Example report preview</h2>
              <p className="mt-3 text-muted-foreground">
                See mention rates, query-level evidence, website gaps, and recommended pages in one report.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Visibility", "68"],
                  ["Mention rate", "42%"],
                  ["Competitor avg.", "64%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white p-4">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-1 text-2xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <UseCases />
      <PricingPreview />
      <Faq />
    </main>
  );
}
