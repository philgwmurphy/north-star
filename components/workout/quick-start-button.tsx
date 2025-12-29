"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { programs, type RepMaxes } from "@/lib/programs";

interface QuickStartButtonProps {
  programKey: string | null;
  repMaxes: RepMaxes | null;
  nextDay?: string;
}

export function QuickStartButton({ programKey, repMaxes, nextDay }: QuickStartButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickStart = async () => {
    if (!programKey || !repMaxes) return;

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programKey,
          programDay: nextDay,
        }),
      });

      if (response.ok) {
        const workout = await response.json();
        router.push(`/workout/${workout.id}`);
        return;
      }
      setError("Failed to start workout. Please try again.");
      setIsStarting(false);
    } catch (err) {
      console.error("Failed to start workout:", err);
      setError("Failed to start workout. Please try again.");
      setIsStarting(false);
    }
  };

  if (!programKey || !repMaxes) {
    return (
      <Link href="/programs">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 hover:border-[var(--border-active)] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Get Started</h2>
              <p className="text-[var(--text-muted)]">Set up your program to begin</p>
            </div>
            <ChevronRight className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
        </div>
      </Link>
    );
  }

  const program = programs[programKey];

  return (
    <div>
      <button
        onClick={handleQuickStart}
        disabled={isStarting}
        className="w-full group bg-white text-black p-8 hover:bg-neutral-200 active:bg-neutral-300 transition-colors text-left disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Quick Start
            </p>
            <h2 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide">
              START WORKOUT
            </h2>
            <p className="text-neutral-600 mt-1">
              {nextDay} &bull; {program?.name}
            </p>
          </div>

          <div className="w-14 h-14 bg-black flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
            {isStarting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
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
