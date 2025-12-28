"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "beginner" | "intermediate" | "advanced" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    beginner: "bg-transparent text-[var(--accent-success)] border border-[var(--accent-success)]",
    intermediate: "bg-transparent text-[var(--accent-warning)] border border-[var(--accent-warning)]",
    advanced: "bg-transparent text-white border border-white",
    success: "bg-transparent text-[var(--accent-success)] border border-[var(--accent-success)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
