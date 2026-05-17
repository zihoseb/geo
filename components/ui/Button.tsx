import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "secondary" &&
            "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" &&
            "border-border bg-background text-foreground hover:bg-muted",
          variant === "ghost" &&
            "border-transparent bg-transparent text-foreground hover:bg-muted",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-11 px-5 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
