"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]",
            "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
            "focus:border-[var(--border-active)] focus:outline-none",
            "transition-colors",
            "font-[family-name:var(--font-geist-mono)]",
            error && "border-[var(--accent-danger)] focus:border-[var(--accent-danger)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--accent-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
