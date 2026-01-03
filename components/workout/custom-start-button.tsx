"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, Copy, Dumbbell } from "lucide-react";
import clsx from "clsx";

type TemplateOption = {
  id: string;
  name: string;
  startedAt: string;
};

type Variant = "card" | "inline";

interface CustomStartButtonProps {
  variant?: Variant;
}

export function CustomStartButton({ variant = "card" }: CustomStartButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/workouts");
        if (!res.ok) return;
        const workouts = await res.json();
        const customTemplates = (workouts as Array<{ id: string; programKey: string | null; programDay: string | null; startedAt: string }>)
          .filter((w) => !w.programKey && w.programDay)
          .slice(0, 8)
          .map((w) => ({
            id: w.id,
            name: w.programDay as string,
            startedAt: w.startedAt,
          }));
        setTemplates(customTemplates);
      } catch (err) {
        console.error("Failed to load custom templates", err);
      }
    }

    loadTemplates();
  }, []);

  const templateOptions = useMemo(
    () =>
      templates.map((template) => ({
        ...template,
        label: `${template.name} • ${new Date(template.startedAt).toLocaleDateString()}`,
      })),
    [templates]
  );

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programKey: null,
          programDay: null,
          workoutName: workoutName.trim() || null,
          templateWorkoutId: selectedTemplate,
        }),
      });

      if (response.ok) {
        const workout = await response.json();
        const search = selectedTemplate ? `?template=${selectedTemplate}` : "";
        router.push(`/workout/${workout.id}${search}`);
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

  const inputClasses =
    "w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-white focus:border-white focus:outline-none";

  return (
    <div className={clsx("border border-[var(--border-subtle)] bg-[var(--bg-surface)]", variant === "card" ? "p-5" : "p-4")}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Custom Workout
          </p>
          <h3 className={clsx("font-semibold", variant === "card" ? "text-lg" : "text-base")}>
            {variant === "card" ? "Start from scratch or a template" : "Start custom workout"}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Name it, optionally copy a past workout
          </p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          aria-label="Start custom workout"
          className="w-10 h-10 bg-[var(--bg-elevated)] flex items-center justify-center disabled:opacity-50"
        >
          {isStarting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
          ) : variant === "card" ? (
            <Plus className="w-5 h-5 text-white" />
          ) : (
            <Dumbbell className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        <input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout name (optional)"
          className={inputClasses}
        />
        <div className="relative">
          <select
            value={selectedTemplate || ""}
            onChange={(e) => setSelectedTemplate(e.target.value || null)}
            className={clsx(inputClasses, "appearance-none pr-10")}
          >
            <option value="">No template</option>
            {templateOptions.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
          <Copy className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={handleStart}
          disabled={isStarting}
          className={clsx(
            "w-full flex items-center justify-center gap-2 px-4 py-3 border transition-colors disabled:opacity-50",
            "bg-white text-black hover:bg-white/90 border-white"
          )}
        >
          {isStarting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Start Workout
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-[var(--bg-surface)] border border-red-500 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
