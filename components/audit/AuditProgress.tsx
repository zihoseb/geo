"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const steps = [
  "Generate buyer questions",
  "Run AI search checks",
  "Crawl website content",
  "Analyze gaps and scores",
  "Build report",
];

export function AuditProgress({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"running" | "completed" | "failed">("running");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reportProjectId, setReportProjectId] = useState(projectId);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function startAudit() {
      try {
        const response = await fetch("/api/audit/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          projectId?: string;
          mock?: boolean;
          error?: string;
        };

        if (!response.ok || payload.ok === false) {
          throw new Error(payload.error || "Audit failed.");
        }

        setMessage(payload.mock ? "Demo report generated" : "Report generated");
        setReportProjectId(payload.projectId || projectId);
        setStatus("completed");
        router.push(`/audit/${payload.projectId || projectId}/report`);
      } catch (auditError) {
        setStatus("failed");
        setError(auditError instanceof Error ? auditError.message : "Audit failed.");
      }
    }

    void startAudit();
  }, [projectId, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit in progress</CardTitle>
        <CardDescription>Project ID: {projectId}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3">
          {steps.map((step, index) => {
            const completed = status === "completed";
            return (
              <div key={step} className="flex items-center gap-3 rounded-lg border border-border p-4">
                {completed ? (
                  <CheckCircle2 className="size-5 text-emerald-600" />
                ) : status === "failed" && index === steps.length - 1 ? (
                  <XCircle className="size-5 text-destructive" />
                ) : (
                  <Loader2 className="size-5 animate-spin text-primary" />
                )}
                <span className="text-sm font-medium">{step}</span>
              </div>
            );
          })}
        </div>

        {status === "failed" ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {message}
          </div>
        ) : null}

        {status === "completed" ? (
          <Link
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-fit"
            href={`/audit/${reportProjectId}/report`}
          >
            Open Report
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
