"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeekSelector } from "@/components/workout/week-selector";
import { Play, Dumbbell } from "lucide-react";
import { type RepMaxes } from "@/lib/programs";

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: {
    name: string;
    sets: { weight: number | string; reps: number | string }[] | string;
  }[];
}

interface WorkoutPageClientProps {
  hasProgram: boolean;
  hasRepMaxes: boolean;
  programName?: string;
  programKey?: string;
  usesTrainingMax?: boolean;
  hasWeeks?: boolean;
  totalWeeks?: number;
  currentWeek?: number;
  trainingMaxes?: { squat: number; bench: number; deadlift: number; ohp: number } | null;
  workouts?: WorkoutDay[];
}

export function WorkoutPageClient({
  hasProgram,
  hasRepMaxes,
  programName,
  programKey,
  usesTrainingMax,
  hasWeeks,
  totalWeeks,
  currentWeek,
  trainingMaxes,
  workouts,
}: WorkoutPageClientProps) {
  const router = useRouter();
  const [isStartingCustom, setIsStartingCustom] = useState(false);

  const startCustomWorkout = async () => {
    setIsStartingCustom(true);
    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programKey: null, programDay: null }),
      });

      if (response.ok) {
        const workout = await response.json();
        router.push(`/workout/${workout.id}`);
      }
    } catch (error) {
      console.error("Failed to start custom workout:", error);
      setIsStartingCustom(false);
    }
  };

  // No program selected - show simple start options
  if (!hasProgram || !hasRepMaxes) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide mb-2">
            START A WORKOUT
          </h1>
          <p className="text-[var(--text-muted)]">
            Start a custom workout or{" "}
            <Link href="/programs" className="text-white underline hover:no-underline">
              choose a training program
            </Link>
          </p>
        </div>
        <button
          onClick={startCustomWorkout}
          disabled={isStartingCustom}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 text-left hover:border-[var(--border-active)] transition-colors disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Custom Workout</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Add exercises as you go
              </p>
            </div>
            <div className="w-10 h-10 bg-[var(--bg-elevated)] flex items-center justify-center">
              {isStartingCustom ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Dumbbell className="w-5 h-5" />
              )}
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Has program - show program days with option for custom
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">
            Current Program
          </p>
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wide">
            {programName?.toUpperCase()}
          </h1>
        </div>

        {/* Training Maxes - only shown for 5/3/1 programs */}
        {trainingMaxes && (
          <div className="hidden sm:flex gap-6 text-right">
            {Object.entries(trainingMaxes).map(([lift, value]) => (
              <div key={lift}>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {lift} TM
                </div>
                <div className="font-[family-name:var(--font-geist-mono)] text-lg">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week Selector for 5/3/1 */}
      {hasWeeks && totalWeeks && currentWeek && (
        <WeekSelector currentWeek={currentWeek} totalWeeks={totalWeeks} />
      )}

      {/* Custom Workout Button */}
      <div className="mb-8">
        <button
          onClick={startCustomWorkout}
          disabled={isStartingCustom}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white hover:border-white transition-colors disabled:opacity-50"
        >
          {isStartingCustom ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Dumbbell className="w-4 h-4" />
          )}
          Start Custom Workout
        </button>
      </div>

      {/* Workout Days */}
      <div className="space-y-8">
        {workouts?.map((workout) => (
          <div key={workout.day} className="border border-[var(--border-subtle)]">
            {/* Day Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-bebas-neue)] text-xl tracking-wide">
                  {workout.day.toUpperCase()}
                </span>
                <Badge variant="default">{workout.focus}</Badge>
              </div>
              <form action="/api/workouts" method="POST">
                <input type="hidden" name="programKey" value={programKey || ""} />
                <input type="hidden" name="programDay" value={workout.day} />
                <Button size="sm" variant="outline">
                  <Play className="w-3 h-3 mr-2" />
                  Start
                </Button>
              </form>
            </div>

            {/* Exercises Table */}
            <div className="overflow-x-auto">
              <table className="data-table min-w-[520px]">
                <thead>
                  <tr className="bg-[var(--bg-elevated)]">
                    <th className="w-1/3">Exercise</th>
                    <th>Sets</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.exercises.map((exercise, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{exercise.name}</td>
                      <td>
                        {Array.isArray(exercise.sets) ? (
                          <div className="flex flex-wrap gap-2">
                            {exercise.sets.map((set, setIdx) => (
                              <span
                                key={setIdx}
                                className="inline-flex items-center gap-1 font-[family-name:var(--font-geist-mono)] text-sm bg-[var(--bg-elevated)] px-3 py-1 border border-[var(--border-subtle)]"
                              >
                                <span className="text-white">{set.weight}</span>
                                <span className="text-[var(--text-muted)]">x</span>
                                <span
                                  className={
                                    String(set.reps).includes("+")
                                      ? "text-[var(--accent-success)]"
                                      : "text-white"
                                  }
                                >
                                  {set.reps}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--text-secondary)] font-[family-name:var(--font-geist-mono)] text-sm">
                            {exercise.sets}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
