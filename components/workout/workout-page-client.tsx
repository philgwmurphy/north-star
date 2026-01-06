"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeekSelector } from "@/components/workout/week-selector";
import { Play, Edit3, Save, Trash2, Plus } from "lucide-react";
import { CustomStartButton } from "./custom-start-button";
import { ExerciseAutocomplete } from "@/components/ui/exercise-autocomplete";

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
  templates?: WorkoutTemplateInput[];
}

interface TemplateExerciseSet {
  weight: number;
  reps: number;
  durationSeconds?: number | null;
}

interface TemplateExerciseItem {
  name: string;
  sets: TemplateExerciseSet[];
}

interface WorkoutTemplateInput {
  id: string;
  name: string;
  exercises: unknown[];
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExerciseItem[];
}

const normalizeTemplateExercises = (exercises: unknown[]): TemplateExerciseItem[] => {
  if (!Array.isArray(exercises)) return [];
  return exercises.flatMap((exercise) => {
    if (typeof exercise === "string") {
      const trimmed = exercise.trim();
      return trimmed ? [{ name: trimmed, sets: [] }] : [];
    }
    if (exercise && typeof exercise === "object" && "name" in exercise) {
      const name = String((exercise as { name?: string }).name || "").trim();
      if (!name) return [];
      const sets = Array.isArray((exercise as { sets?: TemplateExerciseSet[] }).sets)
        ? (exercise as { sets?: TemplateExerciseSet[] }).sets || []
        : [];
      return [{ name, sets }];
    }
    return [];
  });
};

const normalizeTemplate = (template: WorkoutTemplateInput | WorkoutTemplate): WorkoutTemplate => ({
  id: template.id,
  name: template.name,
  exercises: normalizeTemplateExercises((template as WorkoutTemplateInput).exercises ?? (template as WorkoutTemplate).exercises),
});

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
  const [templateList, setTemplateList] = useState<WorkoutTemplate[]>(
    () => templates.map((template) => normalizeTemplate(template))
  );
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateExercises, setNewTemplateExercises] = useState<TemplateExerciseItem[]>([
    { name: "", sets: [] },
  ]);

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
        const updated = normalizeTemplate(await response.json());
        setTemplateList((prev) => prev.map((tpl) => (tpl.id === templateId ? updated : tpl)));
      }
    } catch (error) {
      console.error("Failed to rename template:", error);
    }
  };

  const handleUpdateTemplateExercises = async (
    templateId: string,
    exercises: TemplateExerciseItem[]
  ) => {
    setSavingTemplateId(templateId);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises }),
      });

      if (response.ok) {
        const updated = normalizeTemplate(await response.json());
        setTemplateList((prev) => prev.map((tpl) => (tpl.id === templateId ? updated : tpl)));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update template exercises:", error);
      return false;
    } finally {
      setSavingTemplateId(null);
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

  const resetNewTemplate = () => {
    setNewTemplateName("");
    setNewTemplateExercises([{ name: "", sets: [] }]);
    setCreateError(null);
    setShowCreateTemplate(false);
  };

  const handleCreateTemplate = async () => {
    const name = newTemplateName.trim();
    if (!name) {
      setCreateError("Template name is required.");
      return;
    }

    const exercises = newTemplateExercises
      .map((exercise) => ({ ...exercise, name: exercise.name.trim() }))
      .filter((exercise) => exercise.name.length > 0);

    setCreatingTemplate(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, exercises }),
      });

      if (response.ok) {
        const created = normalizeTemplate(await response.json());
        setTemplateList((prev) => [created, ...prev]);
        resetNewTemplate();
        return;
      }

      setCreateError("Failed to create template.");
    } catch (error) {
      console.error("Failed to create template:", error);
      setCreateError("Failed to create template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const TemplateCard = ({ template }: { template: WorkoutTemplate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(template.name);
    const [isEditingExercises, setIsEditingExercises] = useState(false);
    const [exerciseItems, setExerciseItems] = useState<TemplateExerciseItem[]>(template.exercises);

    useEffect(() => {
      if (!isEditing) {
        setName(template.name);
      }
    }, [template.name, isEditing]);

    useEffect(() => {
      if (!isEditingExercises) {
        setExerciseItems(template.exercises);
      }
    }, [template.exercises, isEditingExercises]);

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
                onClick={() => {
                  setIsEditing(true);
                  setIsEditingExercises(false);
                }}
                className="text-[var(--text-muted)] hover:text-white disabled:opacity-40"
                disabled={isEditingExercises}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-[var(--accent-danger)] disabled:opacity-40"
                disabled={isEditingExercises}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <p className="text-sm text-[var(--text-muted)]">{template.exercises.length} exercises</p>
        {isEditingExercises ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {exerciseItems.map((exercise, idx) => (
                <div key={`${template.id}-exercise-${idx}`} className="flex items-center gap-2">
                  <ExerciseAutocomplete
                    value={exercise.name}
                    onChange={(name) =>
                      setExerciseItems((prev) =>
                        prev.map((item, index) =>
                          index === idx ? { ...item, name } : item
                        )
                      )
                    }
                    placeholder={`Exercise ${idx + 1}`}
                  />
                  <button
                    onClick={() =>
                      setExerciseItems((prev) => prev.filter((_, index) => index !== idx))
                    }
                    className="shrink-0 p-2 text-[var(--accent-danger)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExerciseItems((prev) => [...prev, { name: "", sets: [] }])}
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Exercise
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  const trimmed = exerciseItems
                    .map((exercise) => ({ ...exercise, name: exercise.name.trim() }))
                    .filter((exercise) => exercise.name.length > 0);
                  const saved = await handleUpdateTemplateExercises(template.id, trimmed);
                  if (saved) {
                    setIsEditingExercises(false);
                  }
                }}
                loading={savingTemplateId === template.id}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Exercises
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setExerciseItems(template.exercises);
                  setIsEditingExercises(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => startTemplateWorkout(template.id)}>
              <Play className="w-3 h-3 mr-2" />
              Start Template
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditingExercises(true);
                setIsEditing(false);
              }}
            >
              <Edit3 className="w-3 h-3 mr-2" />
              Edit Exercises
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderTemplateSection = () => (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide">
            TEMPLATES
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Build custom workouts and start them when you are ready.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateTemplate((prev) => !prev)}
          >
            <Plus className="w-3 h-3 mr-2" />
            {showCreateTemplate ? "Close" : "New Template"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push("/program-builder")}
          >
            Program Builder
          </Button>
        </div>
      </div>

      {showCreateTemplate && (
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3 mb-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Template Name
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
              placeholder="e.g. Upper Body Pump"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Exercises
            </label>
            {newTemplateExercises.map((exercise, idx) => (
              <div key={`new-exercise-${idx}`} className="flex items-center gap-2">
                <ExerciseAutocomplete
                  value={exercise.name}
                  onChange={(name) =>
                    setNewTemplateExercises((prev) =>
                      prev.map((item, index) =>
                        index === idx ? { ...item, name } : item
                      )
                    )
                  }
                  placeholder={`Exercise ${idx + 1}`}
                />
                <button
                  onClick={() =>
                    setNewTemplateExercises((prev) => prev.filter((_, index) => index !== idx))
                  }
                  className="shrink-0 p-2 text-[var(--accent-danger)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setNewTemplateExercises((prev) => [...prev, { name: "", sets: [] }])}
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Exercise
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleCreateTemplate} loading={creatingTemplate}>
              <Save className="w-4 h-4 mr-1" />
              Save Template
            </Button>
            <Button size="sm" variant="ghost" onClick={resetNewTemplate}>
              Cancel
            </Button>
          </div>
          {createError && <p className="text-sm text-[var(--accent-danger)]">{createError}</p>}
        </div>
      )}

      {templateList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {templateList.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        !showCreateTemplate && (
          <p className="text-sm text-[var(--text-muted)]">
            No templates yet. Create one to start faster later.
          </p>
        )
      )}
    </section>
  );

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
        {renderTemplateSection()}
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

      {renderTemplateSection()}

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
