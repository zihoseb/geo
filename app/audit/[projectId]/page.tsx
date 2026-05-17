import Link from "next/link";
import { AuditProgress } from "@/components/audit/AuditProgress";

export default async function AuditStatusPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-primary" href="/">
            B2B AI Visibility Audit
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/audit/new">
            New audit
          </Link>
        </header>
        <AuditProgress projectId={projectId} />
      </div>
    </main>
  );
}
