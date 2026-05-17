import Link from "next/link";

const plans = [
  {
    name: "Free Audit",
    price: "$0",
    features: ["10 buyer queries", "1 AI source", "Basic visibility score"],
  },
  {
    name: "Starter Report",
    price: "$29",
    features: ["30 buyer queries", "2 AI sources", "Website content gap analysis", "Competitor comparison"],
  },
  {
    name: "Pro Report",
    price: "$99",
    features: ["100 buyer queries", "3 AI sources", "Full action plan", "Shareable report"],
  },
];

export function PricingPreview() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold">Pricing preview</h2>
            <p className="mt-3 text-muted-foreground">MVP pricing display only; no payment flow is connected.</p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            href="/audit/new"
          >
            Run Free Audit
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-3 text-4xl font-semibold">{plan.price}</div>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
