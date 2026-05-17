import { Bot, FileSearch, Globe2, LineChart } from "lucide-react";

const steps = [
  {
    icon: Bot,
    title: "Generate buyer questions",
    text: "The audit creates supplier discovery, comparison, certification, pricing, logistics, and risk-check questions.",
  },
  {
    icon: FileSearch,
    title: "Check AI answers",
    text: "It evaluates whether your brand and competitors appear in AI-style search answers.",
  },
  {
    icon: Globe2,
    title: "Read your website",
    text: "The crawler extracts page text, titles, headings, metadata, and schema signals where available.",
  },
  {
    icon: LineChart,
    title: "Prioritize fixes",
    text: "The report ranks visibility gaps, missing trust proof, content opportunities, and next actions.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            A focused audit pipeline for B2B teams that need practical AI search visibility answers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-lg border border-border bg-card p-5">
              <step.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
