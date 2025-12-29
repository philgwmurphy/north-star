"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";

export function CustomStartButton() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programKey: null, programDay: null }),
      });

      if (response.ok) {
        const workout = await response.json();
        router.push(`/workout/${workout.id}`);
        return;
      }

      setError("Failed to start custom workout. Please try again.");
    } catch (err) {
      console.error("Failed to start custom workout:", err);
      setError("Failed to start custom workout. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleStart}
        disabled={isStarting}
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 text-left hover:border-[var(--border-active)] transition-colors disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Custom Workout
            </p>
            <h3 className="text-lg font-semibold">Start from scratch</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Add exercises as you go
            </p>
          </div>
          <div className="w-10 h-10 bg-[var(--bg-elevated)] flex items-center justify-center">
            {isStarting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Plus className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </button>
      {error && (
        <div className="mt-2 p-3 bg-[var(--bg-surface)] border border-red-500 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
