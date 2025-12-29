"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

interface BodyWeightQuickEntryProps {
  latestWeight?: { weight: number; unit: string; recordedAt: string } | null;
  defaultUnit: string;
}

export function BodyWeightQuickEntry({ latestWeight, defaultUnit }: BodyWeightQuickEntryProps) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/body-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (response.ok) {
        setWeight("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Log Weight
        </span>
      </div>

      {latestWeight && (
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Last: <span className="font-[family-name:var(--font-geist-mono)]">{latestWeight.weight}</span> {latestWeight.unit}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          step="0.1"
          placeholder={`Weight (${defaultUnit})`}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none transition-colors"
        />
        <Button type="submit" loading={isSubmitting} disabled={!weight} size="sm">
          {showSuccess ? "Saved!" : "Log"}
        </Button>
      </form>
    </div>
  );
}
