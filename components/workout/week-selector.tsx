"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
}

export function WeekSelector({ currentWeek, totalWeeks }: WeekSelectorProps) {
  const router = useRouter();
  const [week, setWeek] = useState(currentWeek);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateWeek = async (newWeek: number) => {
    if (newWeek < 1 || newWeek > totalWeeks || isUpdating) return;

    setIsUpdating(true);
    setWeek(newWeek);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentWeek: newWeek }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        // Revert on error
        setWeek(currentWeek);
      }
    } catch (error) {
      console.error("Failed to update week:", error);
      setWeek(currentWeek);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--border-subtle)]">
      <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider">Week</span>
      <div className="flex items-center border border-[var(--border-subtle)]">
        <button
          onClick={() => updateWeek(week - 1)}
          disabled={week <= 1 || isUpdating}
          className="px-3 py-2 hover:bg-[var(--bg-surface)] transition-colors border-r border-[var(--border-subtle)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 font-[family-name:var(--font-geist-mono)] min-w-[80px] text-center">
          {isUpdating ? "..." : `${week} / ${totalWeeks}`}
        </span>
        <button
          onClick={() => updateWeek(week + 1)}
          disabled={week >= totalWeeks || isUpdating}
          className="px-3 py-2 hover:bg-[var(--bg-surface)] transition-colors border-l border-[var(--border-subtle)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
