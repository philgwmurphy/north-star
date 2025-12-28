"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { programs, type RepMaxes, type WorkoutSet as ProgramSet } from "@/lib/programs";
import { formatDuration } from "@/lib/utils";
import { Check, Clock, Plus } from "lucide-react";
import { ExerciseAutocomplete } from "@/components/ui/exercise-autocomplete";

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  setNumber: number;
  rpe?: number;
  isWarmup: boolean;
  completedAt: string;
}

interface Workout {
  id: string;
  programKey: string | null;
  programDay: string | null;
  startedAt: string;
  completedAt: string | null;
  sets: WorkoutSet[];
}

interface UserData {
  currentWeek: number;
  repMaxes: { exercise: string; oneRM: number }[];
}

interface InlineFormState {
  weight: string;
  reps: string;
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("");
  const [savingSet, setSavingSet] = useState<string | null>(null);

  // Track inline form state per exercise/set
  const [inlineForms, setInlineForms] = useState<Record<string, InlineFormState>>({});

  // Custom exercise form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customExercise, setCustomExercise] = useState({ name: "", weight: "", reps: "" });

  // Fetch workout and user data
  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutRes, userRes] = await Promise.all([
          fetch(`/api/workouts/${workoutId}`),
          fetch("/api/user"),
        ]);

        if (workoutRes.ok) {
          const workoutData = await workoutRes.json();
          setWorkout(workoutData);
        } else {
          router.push("/workout");
          return;
        }

        if (userRes.ok) {
          const user = await userRes.json();
          setUserData(user);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [workoutId, router]);

  // Update elapsed time
  useEffect(() => {
    if (!workout) return;

    const updateTime = () => {
      setElapsedTime(formatDuration(workout.startedAt));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [workout]);

  const getFormKey = (exerciseName: string, setIndex: number) => `${exerciseName}-${setIndex}`;

  const handleInlineChange = (key: string, field: "weight" | "reps", value: string) => {
    setInlineForms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleLogSet = async (exerciseName: string, setIndex: number, targetWeight: number | string, targetReps: number | string) => {
    const formKey = getFormKey(exerciseName, setIndex);
    const form = inlineForms[formKey] || {};

    const weight = form.weight || String(targetWeight);
    const reps = form.reps || String(targetReps).replace('+', '');

    if (!weight || !reps) return;

    setSavingSet(formKey);
    try {
      const existingSets = workout?.sets.filter(s => s.exercise === exerciseName).length || 0;

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: exerciseName,
          weight: parseFloat(weight),
          reps: parseInt(reps),
          setNumber: existingSets + 1,
        }),
      });

      if (response.ok) {
        const newSet = await response.json();
        setWorkout(prev => prev ? { ...prev, sets: [...prev.sets, newSet] } : prev);
        // Clear the form
        setInlineForms(prev => {
          const updated = { ...prev };
          delete updated[formKey];
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to log set:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const handleLogCustomSet = async () => {
    if (!customExercise.name || !customExercise.weight || !customExercise.reps) return;

    setSavingSet("custom");
    try {
      const existingSets = workout?.sets.filter(s => s.exercise === customExercise.name).length || 0;

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: customExercise.name,
          weight: parseFloat(customExercise.weight),
          reps: parseInt(customExercise.reps),
          setNumber: existingSets + 1,
        }),
      });

      if (response.ok) {
        const newSet = await response.json();
        setWorkout(prev => prev ? { ...prev, sets: [...prev.sets, newSet] } : prev);
        setCustomExercise({ name: "", weight: "", reps: "" });
        setShowCustomForm(false);
      }
    } catch (error) {
      console.error("Failed to log set:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const handleFinishWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to finish workout:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  // Convert user's rep maxes to object format
  const repMaxes: RepMaxes = userData?.repMaxes?.reduce((acc, rm) => {
    acc[rm.exercise as keyof RepMaxes] = rm.oneRM;
    return acc;
  }, {} as RepMaxes) || { squat: 0, bench: 0, deadlift: 0, ohp: 0 };

  // Get exercise list from program with actual weights
  const programExercises = workout.programKey
    ? programs[workout.programKey]
        ?.getWorkouts(repMaxes, userData?.currentWeek || 1)
        .find((w) => w.day === workout.programDay)?.exercises || []
    : [];

  // Group completed sets by exercise
  const setsByExercise = workout.sets.reduce((acc, set) => {
    if (!acc[set.exercise]) acc[set.exercise] = [];
    acc[set.exercise].push(set);
    return acc;
  }, {} as Record<string, WorkoutSet[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide">
            {workout.programDay || "CUSTOM WORKOUT"}
          </h1>
          <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {elapsedTime}
            </span>
            <span>{workout.sets.length} sets logged</span>
          </div>
        </div>
        <Button onClick={handleFinishWorkout}>
          <Check className="w-4 h-4 mr-2" />
          Finish Workout
        </Button>
      </div>

      {/* Exercises */}
      <div className="space-y-8">
        {programExercises.map((exercise, exIdx) => {
          const completedSets = setsByExercise[exercise.name] || [];
          const targetSets: ProgramSet[] = Array.isArray(exercise.sets)
            ? exercise.sets
            : [];
          const isStringFormat = typeof exercise.sets === "string";

          return (
            <div key={exIdx} className="border border-[var(--border-subtle)]">
              {/* Exercise Header */}
              <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                {isStringFormat && typeof exercise.sets === "string" && (
                  <p className="text-sm text-[var(--text-muted)]">{exercise.sets}</p>
                )}
              </div>

              {/* Sets List */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {isStringFormat ? (
                  // For exercises with string format (e.g., "3x10"), show completed sets + add button
                  <>
                    {completedSets.map((set, idx) => (
                      <div key={set.id} className="flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)]">
                        <span className="text-[var(--text-muted)] w-16">Set {idx + 1}</span>
                        <span className="font-[family-name:var(--font-geist-mono)] text-[var(--accent-success)]">
                          {set.weight} x {set.reps}
                        </span>
                        <Check className="w-5 h-5 text-[var(--accent-success)]" />
                      </div>
                    ))}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--text-muted)] w-16">Set {completedSets.length + 1}</span>
                        <input
                          type="number"
                          placeholder="Weight"
                          className="w-24 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                          value={inlineForms[getFormKey(exercise.name, completedSets.length)]?.weight || ""}
                          onChange={(e) => handleInlineChange(getFormKey(exercise.name, completedSets.length), "weight", e.target.value)}
                        />
                        <span className="text-[var(--text-muted)]">x</span>
                        <input
                          type="number"
                          placeholder="Reps"
                          className="w-20 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                          value={inlineForms[getFormKey(exercise.name, completedSets.length)]?.reps || ""}
                          onChange={(e) => handleInlineChange(getFormKey(exercise.name, completedSets.length), "reps", e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleLogSet(exercise.name, completedSets.length, "", "")}
                          loading={savingSet === getFormKey(exercise.name, completedSets.length)}
                          disabled={!inlineForms[getFormKey(exercise.name, completedSets.length)]?.weight || !inlineForms[getFormKey(exercise.name, completedSets.length)]?.reps}
                        >
                          Log
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // For exercises with specific sets, show each target set
                  targetSets.map((targetSet, setIdx) => {
                    const isCompleted = setIdx < completedSets.length;
                    const completedSet = completedSets[setIdx];
                    const formKey = getFormKey(exercise.name, setIdx);
                    const form = inlineForms[formKey] || {};

                    return (
                      <div
                        key={setIdx}
                        className={`flex items-center gap-4 px-4 py-3 ${isCompleted ? 'bg-[var(--bg-elevated)]' : ''}`}
                      >
                        <span className="text-[var(--text-muted)] w-16 text-sm">Set {setIdx + 1}</span>

                        {isCompleted ? (
                          <>
                            <span className="font-[family-name:var(--font-geist-mono)] text-[var(--accent-success)] flex-1">
                              {completedSet.weight} x {completedSet.reps}
                            </span>
                            <Check className="w-5 h-5 text-[var(--accent-success)]" />
                          </>
                        ) : (
                          <>
                            <span className="text-[var(--text-muted)] text-sm">
                              Target: {targetSet.weight} x {targetSet.reps}
                            </span>
                            <div className="flex items-center gap-2 ml-auto">
                              <input
                                type="number"
                                placeholder={String(targetSet.weight)}
                                className="w-20 px-2 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] text-sm focus:border-white focus:outline-none"
                                value={form.weight || ""}
                                onChange={(e) => handleInlineChange(formKey, "weight", e.target.value)}
                              />
                              <span className="text-[var(--text-muted)]">x</span>
                              <input
                                type="number"
                                placeholder={String(targetSet.reps).replace('+', '')}
                                className="w-16 px-2 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] text-sm focus:border-white focus:outline-none"
                                value={form.reps || ""}
                                onChange={(e) => handleInlineChange(formKey, "reps", e.target.value)}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleLogSet(exercise.name, setIdx, targetSet.weight, targetSet.reps)}
                                loading={savingSet === formKey}
                              >
                                Log
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Custom Exercise Section */}
        <div className="border border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-bold">Custom Exercise</h3>
            {!showCustomForm && (
              <Button size="sm" variant="outline" onClick={() => setShowCustomForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {showCustomForm && (
            <div className="px-4 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <ExerciseAutocomplete
                  value={customExercise.name}
                  onChange={(name) => setCustomExercise(prev => ({ ...prev, name }))}
                  placeholder="Search exercises..."
                />
                <input
                  type="number"
                  placeholder="Weight"
                  className="w-24 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                  value={customExercise.weight}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, weight: e.target.value }))}
                />
                <span className="text-[var(--text-muted)]">x</span>
                <input
                  type="number"
                  placeholder="Reps"
                  className="w-20 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                  value={customExercise.reps}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, reps: e.target.value }))}
                />
                <Button
                  onClick={handleLogCustomSet}
                  loading={savingSet === "custom"}
                  disabled={!customExercise.name || !customExercise.weight || !customExercise.reps}
                >
                  Log Set
                </Button>
                <Button variant="ghost" onClick={() => setShowCustomForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Show logged custom exercises */}
          {Object.entries(setsByExercise)
            .filter(([name]) => !programExercises.some(e => e.name === name))
            .map(([exerciseName, sets]) => (
              <div key={exerciseName} className="border-t border-[var(--border-subtle)]">
                <div className="px-4 py-2 text-sm text-[var(--text-muted)]">{exerciseName}</div>
                {sets.map((set, idx) => (
                  <div key={set.id} className="flex items-center justify-between px-4 py-2 bg-[var(--bg-elevated)]">
                    <span className="text-[var(--text-muted)] w-16">Set {idx + 1}</span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[var(--accent-success)]">
                      {set.weight} x {set.reps}
                    </span>
                    <Check className="w-5 h-5 text-[var(--accent-success)]" />
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
