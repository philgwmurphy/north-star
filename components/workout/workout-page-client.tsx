"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeekSelector } from "@/components/workout/week-selector";
import { Play, Edit3, Save, Trash2 } from "lucide-react";
import { CustomStartButton } from "./custom-start-button";

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
  hasWeeks?: boolean;
  totalWeeks?: number;
  currentWeek?: number;
  trainingMaxes?: { squat: number; bench: number; deadlift: number; ohp: number } | null;
  workouts?: WorkoutDay[];
  templates?: WorkoutTemplate[];
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: unknown[];
}

export function WorkoutPageClient({
  hasProgram,
  hasRepMaxes,
  programName,
  programKey,
  hasWeeks,
  totalWeeks,
  currentWeek,
  trainingMaxes,
  workouts,
  templates = [],
}: WorkoutPageClientProps) {
  const router = useRouter();
  const [templateList, setTemplateList] = useState(templates);

  const startTemplateWorkout = async (templateId: string) => {
    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        const workout = await response.json();
        router.push(`/workout/${workout.id}`);
      }
    } catch (error) {
      console.error("Failed to start template workout:", error);
    }
  };

  const handleRenameTemplate = async (templateId: string, name: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const updated = await response.json();
        setTemplateList((prev) => prev.map((tpl) => (tpl.id === templateId ? updated : tpl)));
      }
    } catch (error) {
      console.error("Failed to rename template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplateList((prev) => prev.filter((tpl) => tpl.id !== templateId));
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const TemplateCard = ({ template }: { template: WorkoutTemplate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(template.name);

    return (
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
            />
            <Button
              size="sm"
              onClick={() => {
                const trimmed = name.trim();
                if (!trimmed) return;
                handleRenameTemplate(template.id, trimmed);
                setIsEditing(false);
              }}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[var(--text-muted)] hover:text-white"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-[var(--accent-danger)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <p className="text-sm text-[var(--text-muted)]">
          {template.exercises.length} exercises
        </p>
        <Button size="sm" variant="outline" onClick={() => startTemplateWorkout(template.id)}>
          <Play className="w-3 h-3 mr-2" />
          Start Template
        </Button>
      </div>
    );
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
        <CustomStartButton />
        {templateList.length > 0 && (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide mb-4">
              TEMPLATES
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {templateList.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}
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
        <CustomStartButton variant="inline" />
      </div>

      {templateList.length > 0 && (
        <section className="mb-10">
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide mb-4">
            TEMPLATES
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {templateList.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}

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
