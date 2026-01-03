"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, RefreshCcw, Plus } from "lucide-react";

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

interface CustomProgramInput {
  id: string;
  name: string;
  weeks: number;
  currentWeek: number;
  rules: unknown;
  template: WorkoutTemplateInput;
}

interface ProgramBuilderClientProps {
  templates: WorkoutTemplateInput[];
  programs: CustomProgramInput[];
}

type RuleInput = {
  name: string;
  baseWeight: string;
  increment: string;
};

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

const getDefaultBaseWeight = (exercise: TemplateExerciseItem) => {
  const firstWeightedSet = exercise.sets.find((set) => set.weight > 0);
  return firstWeightedSet ? String(firstWeightedSet.weight) : "";
};

export function ProgramBuilderClient({ templates, programs }: ProgramBuilderClientProps) {
  const router = useRouter();
  const [programList, setProgramList] = useState(programs);
  const [name, setName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [weeks, setWeeks] = useState("8");
  const [rules, setRules] = useState<RuleInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(true);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const templateExercises = useMemo(
    () => normalizeTemplateExercises(selectedTemplate?.exercises || []),
    [selectedTemplate]
  );

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    const exercises = normalizeTemplateExercises(template?.exercises || []);
    setRules(
      exercises.map((exercise) => ({
        name: exercise.name,
        baseWeight: getDefaultBaseWeight(exercise),
        increment: "5",
      }))
    );
  };

  const handleRuleChange = (index: number, field: "baseWeight" | "increment", value: string) => {
    setRules((prev) =>
      prev.map((rule, idx) => (idx === index ? { ...rule, [field]: value } : rule))
    );
  };

  const handleCreateProgram = async () => {
    setErrors(null);

    if (!name.trim()) {
      setErrors("Program name is required.");
      return;
    }

    if (!selectedTemplateId) {
      setErrors("Pick a template to build from.");
      return;
    }

    setIsSaving(true);
    try {
      const payloadRules = rules.map((rule) => ({
        name: rule.name,
        baseWeight: rule.baseWeight === "" ? null : Number(rule.baseWeight),
        increment: rule.increment === "" ? null : Number(rule.increment),
      }));

      const response = await fetch("/api/custom-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          templateId: selectedTemplateId,
          weeks: Number(weeks),
          rules: payloadRules,
        }),
      });

      if (!response.ok) {
        setErrors("Failed to create program.");
        return;
      }

      const created = await response.json();
      setProgramList((prev) => [created, ...prev]);
      setName("");
      setSelectedTemplateId("");
      setRules([]);
      setWeeks("8");
      setShowBuilder(false);
    } catch (error) {
      console.error("Failed to create program:", error);
      setErrors("Failed to create program.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWeek = async (programId: string) => {
    setIsStarting(programId);
    setErrors(null);
    try {
      const response = await fetch(`/api/custom-programs/${programId}/next-week`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrors(data?.error || "Failed to start week.");
        return;
      }

      const workout = await response.json();
      setProgramList((prev) =>
        prev.map((program) =>
          program.id === programId
            ? { ...program, currentWeek: program.currentWeek + 1 }
            : program
        )
      );
      router.push(`/workout/${workout.id}`);
    } catch (error) {
      console.error("Failed to start week:", error);
      setErrors("Failed to start week.");
    } finally {
      setIsStarting(null);
    }
  };

  const handleResetWeek = async (programId: string) => {
    setIsStarting(programId);
    setErrors(null);
    try {
      const response = await fetch(`/api/custom-programs/${programId}/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        setErrors("Failed to reset program.");
        return;
      }

      const updated = await response.json();
      setProgramList((prev) =>
        prev.map((program) => (program.id === programId ? updated : program))
      );
    } catch (error) {
      console.error("Failed to reset program:", error);
      setErrors("Failed to reset program.");
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide mb-2">
          PROGRAM BUILDER
        </h1>
        <p className="text-[var(--text-muted)]">
          Build multi-week custom programs from your templates with per-exercise progression.
        </p>
        <div className="mt-3">
          <Link href="/workout" className="text-sm text-white underline hover:no-underline">
            Back to workouts
          </Link>
        </div>
      </div>

      <section className="mb-10 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide">
            New Custom Program
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBuilder((prev) => !prev)}
          >
            <Plus className="w-3 h-3 mr-2" />
            {showBuilder ? "Hide" : "Show"}
          </Button>
        </div>

        {showBuilder && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Program Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
                  placeholder="e.g. Upper/Lower Linear"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Duration
                </label>
                <select
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
                >
                  <option value="4">4 weeks</option>
                  <option value="8">8 weeks</option>
                  <option value="12">12 weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={templates.length === 0}
                className="mt-2 w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
              >
                <option value="">
                  {templates.length === 0 ? "No templates yet" : "Select a template"}
                </option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Progression Rules</h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    Week 1 uses base weights
                  </span>
                </div>
                <div className="space-y-3">
                  {templateExercises.map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr] items-center"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)]">Base Weight</label>
                        <input
                          type="number"
                          value={rules[index]?.baseWeight ?? ""}
                          onChange={(e) => handleRuleChange(index, "baseWeight", e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
                          placeholder="Use template"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)]">Weekly +lbs</label>
                        <input
                          type="number"
                          value={rules[index]?.increment ?? ""}
                          onChange={(e) => handleRuleChange(index, "increment", e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCreateProgram}
                loading={isSaving}
                disabled={templates.length === 0 || !selectedTemplateId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Program
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setName("");
                  setSelectedTemplateId("");
                  setRules([]);
                  setWeeks("8");
                }}
              >
                Clear
              </Button>
            </div>

            {errors && <p className="text-sm text-[var(--accent-danger)]">{errors}</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide mb-4">
          Your Programs
        </h2>
        {programList.length === 0 ? (
          <p className="text-[var(--text-muted)]">No custom programs yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {programList.map((program) => {
              const isComplete = program.currentWeek > program.weeks;
              const nextWeekLabel = isComplete
                ? "Program Complete"
                : `Start Week ${program.currentWeek}`;

              return (
                <div
                  key={program.id}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{program.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {program.template.name} • {program.weeks} weeks
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Week {Math.min(program.currentWeek, program.weeks)} of {program.weeks}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isComplete}
                      loading={isStarting === program.id}
                      onClick={() => handleStartWeek(program.id)}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      {nextWeekLabel}
                    </Button>
                    {isComplete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={isStarting === program.id}
                        onClick={() => handleResetWeek(program.id)}
                      >
                        <RefreshCcw className="w-3 h-3 mr-2" />
                        Restart
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {errors && <p className="text-sm text-[var(--accent-danger)] mt-4">{errors}</p>}
      </section>
    </div>
  );
}
