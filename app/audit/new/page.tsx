import Link from "next/link";
import { AuditForm } from "@/components/audit/AuditForm";

export default function NewAuditPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-primary" href="/">
            B2B AI Visibility Audit
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
            Back to home
          </Link>
        </header>
        <section className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold">Run your free audit</h1>
            <p className="leading-7 text-muted-foreground">
              The demo fallback runs the full workflow locally and still uses the same report structure as the production integrations.
            </p>
          </div>
          <AuditForm />
        </section>
      </div>
    </main>
  );
}
