"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExerciseAutocomplete } from "@/components/ui/exercise-autocomplete";
import { Plus, Trash2, GripVertical, Play } from "lucide-react";

interface PlannedExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

interface CustomWorkoutBuilderProps {
  onCancel?: () => void;
}

export function CustomWorkoutBuilder({ onCancel }: CustomWorkoutBuilderProps) {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<PlannedExercise[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        reps: "10",
        weight: "",
      },
    ]);
  };

  const updateExercise = (id: string, updates: Partial<PlannedExercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleStartWorkout = async () => {
    if (exercises.length === 0 || exercises.some((ex) => !ex.name)) {
      return;
    }

    setIsStarting(true);
    try {
      // Create the workout
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutName: workoutName || "Custom Workout",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workout");
      }

      const workout = await response.json();

      // Store planned exercises in sessionStorage for the active workout page
      sessionStorage.setItem(
        `custom-workout-${workout.id}`,
        JSON.stringify(exercises)
      );

      router.push(`/workout/${workout.id}`);
    } catch (error) {
      console.error("Failed to start workout:", error);
      setIsStarting(false);
    }
  };

  const canStart = exercises.length > 0 && exercises.every((ex) => ex.name);

  return (
    <div className="border border-[var(--border-subtle)]">
      <div className="bg-[var(--bg-surface)] px-5 py-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-[family-name:var(--font-bebas-neue)] text-xl tracking-wide">
          BUILD CUSTOM WORKOUT
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Add exercises and plan your sets before starting
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Workout Name */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Workout Name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Upper Body, Leg Day, Push..."
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-white focus:outline-none"
          />
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-[var(--text-muted)]">
              Exercises
            </label>
            <Button size="sm" variant="outline" onClick={addExercise}>
              <Plus className="w-4 h-4 mr-1" />
              Add Exercise
            </Button>
          </div>

          {exercises.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)] mb-3">No exercises added yet</p>
              <Button size="sm" variant="outline" onClick={addExercise}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Exercise
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, idx) => (
                <div
                  key={exercise.id}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                >
                  <div className="flex items-center gap-2 p-3 border-b border-[var(--border-subtle)]">
                    <GripVertical className="w-4 h-4 text-[var(--text-muted)] cursor-grab" />
                    <span className="text-sm text-[var(--text-muted)] w-6">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <ExerciseAutocomplete
                        value={exercise.name}
                        onChange={(name) => updateExercise(exercise.id, { name })}
                        placeholder="Search exercises..."
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExercise(exercise.id)}
                      className="text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--text-muted)]">Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(exercise.id, {
                            sets: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-16 px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] text-sm focus:border-white focus:outline-none"
                      />
                    </div>
                    <span className="text-[var(--text-muted)]">x</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--text-muted)]">Reps</label>
                      <input
                        type="text"
                        placeholder="10"
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExercise(exercise.id, { reps: e.target.value })
                        }
                        className="w-16 px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] text-sm focus:border-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-xs text-[var(--text-muted)]">Weight</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={exercise.weight}
                        onChange={(e) =>
                          updateExercise(exercise.id, { weight: e.target.value })
                        }
                        className="w-20 px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] text-sm focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            className="flex-1"
            onClick={handleStartWorkout}
            disabled={!canStart}
            loading={isStarting}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
