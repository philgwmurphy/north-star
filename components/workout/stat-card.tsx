"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 mx-auto mb-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-sm font-[family-name:var(--font-geist-mono)] text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <div className="font-[family-name:var(--font-bebas-neue)] text-3xl text-white">
        {value}
      </div>
      <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
