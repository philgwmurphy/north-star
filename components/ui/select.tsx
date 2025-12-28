"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]",
            "text-[var(--text-primary)]",
            "focus:border-[var(--border-active)] focus:outline-none",
            "transition-colors cursor-pointer",
            "appearance-none bg-no-repeat bg-right",
            error && "border-[var(--accent-danger)] focus:border-[var(--accent-danger)]",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b6b70' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.5em 1.5em",
          }}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-[var(--accent-danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
