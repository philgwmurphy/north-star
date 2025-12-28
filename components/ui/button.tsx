"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-40 uppercase tracking-wider";

    const variants = {
      default:
        "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300",
      secondary:
        "bg-[var(--bg-elevated)] text-white border border-[var(--border-subtle)] hover:bg-[var(--bg-interactive)] hover:border-[var(--border-active)]",
      ghost:
        "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-interactive)]",
      outline:
        "border border-[var(--border-subtle)] bg-transparent text-white hover:bg-[var(--bg-surface)] hover:border-[var(--border-active)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-6 text-sm",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin border border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
