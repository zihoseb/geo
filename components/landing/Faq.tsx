const faqs = [
  {
    question: "Does this guarantee AI recommendations?",
    answer: "No. The report identifies current visibility patterns and content gaps without promising ranking outcomes.",
  },
  {
    question: "Can I run it without API keys?",
    answer: "Yes. The MVP includes demo fallback data so the full workflow can be tested locally.",
  },
  {
    question: "What does the crawler read?",
    answer: "The MVP reads public HTML pages only, extracts text and metadata, and blocks local/private URLs.",
  },
];

export function Faq() {
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5">
        <h2 className="text-3xl font-semibold">FAQ</h2>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border bg-white p-5">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
