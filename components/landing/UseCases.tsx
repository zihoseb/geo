const cases = [
  "Export factories that sell through buyer search and RFQ workflows",
  "SaaS teams that need to understand AI answer visibility",
  "Cross-border independent sites competing with better-known brands",
  "B2B marketers planning product, certification, and comparison content",
];

export function UseCases() {
  return (
    <section className="border-y border-border bg-muted/40 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-semibold">Who it is for</h2>
          <p className="mt-3 text-muted-foreground">
            Built for teams whose buyers increasingly ask AI tools before contacting suppliers.
          </p>
        </div>
        <div className="grid gap-3">
          {cases.map((item) => (
            <div key={item} className="rounded-lg border border-border bg-white p-4 text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
