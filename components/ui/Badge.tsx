import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  variant = "secondary",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "secondary" | "outline" | "success" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "outline" && "border-border text-muted-foreground",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        variant === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        className,
      )}
      {...props}
    />
  );
}
