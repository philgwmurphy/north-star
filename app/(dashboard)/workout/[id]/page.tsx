"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { programs, type RepMaxes, type WorkoutSet as ProgramSet } from "@/lib/programs";
import { formatDuration, formatDurationSeconds } from "@/lib/utils";
import { Check, Clock, Plus, Trash2, Pencil, X } from "lucide-react";
import { ExerciseAutocomplete } from "@/components/ui/exercise-autocomplete";
import { searchCardioExercises } from "@/lib/exercises";

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  durationSeconds?: number | null;
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

  // Add exercise form (for custom workouts and program custom exercises)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", weight: "", reps: "" });
  const [cardioEntry, setCardioEntry] = useState({ name: "", hours: "", minutes: "" });

  // Edit mode for logged sets
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingSetIsCardio, setEditingSetIsCardio] = useState(false);
  const [editForm, setEditForm] = useState<{ weight: string; reps: string }>({ weight: "", reps: "" });
  const [editDuration, setEditDuration] = useState<{ hours: string; minutes: string }>({
    hours: "",
    minutes: "",
  });

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

  const isCustomWorkout = !workout?.programKey;

  const getFormKey = (exerciseName: string, setIndex: number) => `${exerciseName}-${setIndex}`;

  const resolveWeight = (input: string | undefined, target: number | string): number | null => {
    if (input && input.trim() !== "") {
      const parsed = Number(input);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (typeof target === "number") {
      return target;
    }

    const normalized = target.trim().toLowerCase();
    if (normalized === "bw") {
      return 0;
    }

    const parsed = Number(target);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const resolveReps = (input: string | undefined, target: number | string): number | null => {
    const candidate = input && input.trim() !== "" ? input : String(target).replace("+", "");
    const parsed = Number(candidate);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  };

  const handleInlineChange = (key: string, field: "weight" | "reps", value: string) => {
    setInlineForms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleLogSet = async (exerciseName: string, setIndex: number, targetWeight: number | string, targetReps: number | string) => {
    const formKey = getFormKey(exerciseName, setIndex);
    const form = inlineForms[formKey] || {};

    const weight = resolveWeight(form.weight, targetWeight);
    const reps = resolveReps(form.reps, targetReps);

    if (weight === null || reps === null) return;

    setSavingSet(formKey);
    try {
      const existingSets = workout?.sets.filter(s => s.exercise === exerciseName).length || 0;

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: exerciseName,
          weight,
          reps,
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

  const handleAddExerciseSet = async () => {
    if (!newExercise.name || !newExercise.weight || !newExercise.reps) return;

    const weight = Number(newExercise.weight);
    const reps = Number(newExercise.reps);
    if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) return;

    setSavingSet("add-exercise");
    try {
      const existingSets = workout?.sets.filter(s => s.exercise === newExercise.name).length || 0;

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: newExercise.name,
          weight,
          reps,
          setNumber: existingSets + 1,
        }),
      });

      if (response.ok) {
        const newSet = await response.json();
        setWorkout(prev => prev ? { ...prev, sets: [...prev.sets, newSet] } : prev);
        // Clear the form for adding a different exercise
        setNewExercise({ name: "", weight: "", reps: "" });
      }
    } catch (error) {
      console.error("Failed to log set:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const handleLogCardio = async () => {
    if (!cardioEntry.name) return;
    const hours = Number(cardioEntry.hours || 0);
    const minutes = Number(cardioEntry.minutes || 0);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;

    const durationSeconds = Math.round((hours * 60 + minutes) * 60);
    if (durationSeconds <= 0) return;

    setSavingSet("cardio");
    try {
      const existingSets = workout?.sets.filter(s => s.exercise === cardioEntry.name).length || 0;
      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: cardioEntry.name,
          weight: 0,
          reps: 0,
          durationSeconds,
          setNumber: existingSets + 1,
        }),
      });

      if (response.ok) {
        const newSet = await response.json();
        setWorkout(prev => prev ? { ...prev, sets: [...prev.sets, newSet] } : prev);
        setCardioEntry({ name: "", hours: "", minutes: "" });
      }
    } catch (error) {
      console.error("Failed to log cardio:", error);
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

  const startEditingSet = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    if (set.durationSeconds) {
      const hours = Math.floor(set.durationSeconds / 3600);
      const minutes = Math.round((set.durationSeconds % 3600) / 60);
      setEditingSetIsCardio(true);
      setEditDuration({
        hours: hours > 0 ? String(hours) : "",
        minutes: minutes > 0 ? String(minutes) : "",
      });
      setEditForm({ weight: "", reps: "" });
      return;
    }

    setEditingSetIsCardio(false);
    setEditForm({ weight: String(set.weight), reps: String(set.reps) });
  };

  const cancelEditing = () => {
    setEditingSetId(null);
    setEditingSetIsCardio(false);
    setEditForm({ weight: "", reps: "" });
    setEditDuration({ hours: "", minutes: "" });
  };

  const handleUpdateSet = async (setId: string) => {
    const weight = Number(editForm.weight);
    const reps = Number(editForm.reps);
    if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) return;

    setSavingSet(`edit-${setId}`);
    try {
      const response = await fetch(`/api/workouts/${workoutId}/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, reps }),
      });

      if (response.ok) {
        const updatedSet = await response.json();
        setWorkout(prev => prev ? {
          ...prev,
          sets: prev.sets.map(s => s.id === setId ? updatedSet : s)
        } : prev);
        cancelEditing();
      }
    } catch (error) {
      console.error("Failed to update set:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const handleUpdateCardioSet = async (setId: string) => {
    const hours = Number(editDuration.hours || 0);
    const minutes = Number(editDuration.minutes || 0);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;

    const durationSeconds = Math.round((hours * 60 + minutes) * 60);
    if (durationSeconds <= 0) return;

    setSavingSet(`edit-${setId}`);
    try {
      const response = await fetch(`/api/workouts/${workoutId}/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds }),
      });

      if (response.ok) {
        const updatedSet = await response.json();
        setWorkout(prev => prev ? {
          ...prev,
          sets: prev.sets.map(s => s.id === setId ? updatedSet : s)
        } : prev);
        cancelEditing();
      }
    } catch (error) {
      console.error("Failed to update cardio set:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm("Delete this set?")) return;

    setSavingSet(`delete-${setId}`);
    try {
      const response = await fetch(`/api/workouts/${workoutId}/sets/${setId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWorkout(prev => prev ? {
          ...prev,
          sets: prev.sets.filter(s => s.id !== setId)
        } : prev);
      }
    } catch (error) {
      console.error("Failed to delete set:", error);
    } finally {
      setSavingSet(null);
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
  const totalCardioSeconds = workout.sets.reduce(
    (sum, set) => sum + (set.durationSeconds || 0),
    0
  );

  // Render a set row with edit capability
  const renderSetRow = (set: WorkoutSet, idx: number) => (
    <div key={set.id} className="px-4 py-3 bg-[var(--bg-elevated)]">
      {editingSetId === set.id ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-sm">Set {idx + 1}</span>
            <button onClick={cancelEditing} className="text-[var(--text-muted)] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {editingSetIsCardio ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Hours"
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editDuration.hours}
                onChange={(e) => setEditDuration(prev => ({ ...prev, hours: e.target.value }))}
              />
              <span className="text-[var(--text-muted)] shrink-0">h</span>
              <input
                type="number"
                placeholder="Minutes"
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editDuration.minutes}
                onChange={(e) => setEditDuration(prev => ({ ...prev, minutes: e.target.value }))}
              />
              <span className="text-[var(--text-muted)] shrink-0">m</span>
              <Button
                size="sm"
                onClick={() => handleUpdateCardioSet(set.id)}
                loading={savingSet === `edit-${set.id}`}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteSet(set.id)}
                loading={savingSet === `delete-${set.id}`}
                className="text-[var(--accent-danger)]"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editForm.weight}
                onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
              />
              <span className="text-[var(--text-muted)] shrink-0">x</span>
              <input
                type="number"
                className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editForm.reps}
                onChange={(e) => setEditForm(prev => ({ ...prev, reps: e.target.value }))}
              />
              <Button
                size="sm"
                onClick={() => handleUpdateSet(set.id)}
                loading={savingSet === `edit-${set.id}`}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteSet(set.id)}
                loading={savingSet === `delete-${set.id}`}
                className="text-[var(--accent-danger)]"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] w-16">Set {idx + 1}</span>
          <span className="font-[family-name:var(--font-geist-mono)] text-[var(--accent-success)] flex-1">
            {set.durationSeconds
              ? `Duration: ${formatDurationSeconds(set.durationSeconds)}`
              : `${set.weight} x ${set.reps}`}
          </span>
          {!set.durationSeconds && (
            <button
              onClick={() => startEditingSet(set)}
              className="text-[var(--text-muted)] hover:text-white p-1"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <Check className="w-5 h-5 text-[var(--accent-success)]" />
        </div>
      )}
    </div>
  );

  // Render inline add set form for an exercise
  const renderAddSetForm = (exerciseName: string, completedSetsCount: number, placeholder?: { weight?: string; reps?: string }) => {
    const formKey = getFormKey(exerciseName, completedSetsCount);
    return (
      <div className="px-4 py-3 space-y-3">
        <span className="text-[var(--text-muted)] text-sm">Set {completedSetsCount + 1}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={placeholder?.weight || "Weight"}
            className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
            value={inlineForms[formKey]?.weight || ""}
            onChange={(e) => handleInlineChange(formKey, "weight", e.target.value)}
          />
          <span className="text-[var(--text-muted)] shrink-0">x</span>
          <input
            type="number"
            placeholder={placeholder?.reps || "Reps"}
            className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
            value={inlineForms[formKey]?.reps || ""}
            onChange={(e) => handleInlineChange(formKey, "reps", e.target.value)}
          />
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            const form = inlineForms[formKey];
            if (form?.weight && form?.reps) {
              handleLogSet(exerciseName, completedSetsCount, form.weight, form.reps);
            }
          }}
          loading={savingSet === formKey}
          disabled={!inlineForms[formKey]?.weight || !inlineForms[formKey]?.reps}
        >
          Log
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          {workout.programKey && programs[workout.programKey] ? (
            <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">
              {programs[workout.programKey].name}
              {programs[workout.programKey].hasWeeks && userData?.currentWeek && (
                <span className="ml-2">Week {userData.currentWeek}</span>
              )}
            </p>
          ) : (
            <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">
              Custom Workout
            </p>
          )}
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide">
            {workout.programDay || "WORKOUT"}
          </h1>
          <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {elapsedTime}
            </span>
            <span>{workout.sets.length} sets logged</span>
            {totalCardioSeconds > 0 && (
              <span>{formatDurationSeconds(totalCardioSeconds)} cardio</span>
            )}
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-2">
            Bodyweight movements: log 0 for bodyweight, add extra load only.
          </p>
        </div>
        <Button onClick={handleFinishWorkout}>
          <Check className="w-4 h-4 mr-2" />
          Finish Workout
        </Button>
      </div>

      {/* Exercises */}
      <div className="space-y-8">
        {/* Custom Workout: Show logged exercises */}
        {isCustomWorkout && Object.entries(setsByExercise).map(([exerciseName, sets]) => (
          <div key={exerciseName} className="border border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-lg">{exerciseName}</h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {sets.map((set, idx) => renderSetRow(set, idx))}
              {renderAddSetForm(exerciseName, sets.length)}
            </div>
          </div>
        ))}

        {/* Custom Workout: Add Exercise Button/Form */}
        {isCustomWorkout && (
          <div className="border border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-bold">Add Exercise</h3>
              {!showAddForm && Object.keys(setsByExercise).length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Exercise
                </Button>
              )}
            </div>

            {(showAddForm || Object.keys(setsByExercise).length === 0) && (
              <div className="px-4 py-4 space-y-3">
                <ExerciseAutocomplete
                  value={newExercise.name}
                  onChange={(name) => setNewExercise(prev => ({ ...prev, name }))}
                  placeholder="Search exercises..."
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Weight"
                    className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                  />
                  <span className="text-[var(--text-muted)]">x</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    className="w-20 sm:w-24 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddExerciseSet}
                    loading={savingSet === "add-exercise"}
                    disabled={!newExercise.name || !newExercise.weight || !newExercise.reps}
                  >
                    Log Set
                  </Button>
                  {showAddForm && Object.keys(setsByExercise).length > 0 && (
                    <Button variant="ghost" onClick={() => {
                      setShowAddForm(false);
                      setNewExercise({ name: "", weight: "", reps: "" });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cardio Entry */}
        <div className="border border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-bold">Cardio</h3>
            <p className="text-sm text-[var(--text-muted)]">Log cardio by duration</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <ExerciseAutocomplete
              value={cardioEntry.name}
              onChange={(name) => setCardioEntry(prev => ({ ...prev, name }))}
              placeholder="Search cardio exercise..."
              searchFn={searchCardioExercises}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Hours"
                className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={cardioEntry.hours}
                onChange={(e) => setCardioEntry(prev => ({ ...prev, hours: e.target.value }))}
              />
              <span className="text-[var(--text-muted)]">h</span>
              <input
                type="number"
                placeholder="Minutes"
                className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={cardioEntry.minutes}
                onChange={(e) => setCardioEntry(prev => ({ ...prev, minutes: e.target.value }))}
              />
              <span className="text-[var(--text-muted)]">m</span>
            </div>
            <Button
              className="w-full"
              onClick={handleLogCardio}
              loading={savingSet === "cardio"}
              disabled={!cardioEntry.name || (!cardioEntry.hours && !cardioEntry.minutes)}
            >
              Log Cardio
            </Button>
          </div>
        </div>

        {/* Program Workout: Show program exercises */}
        {!isCustomWorkout && programExercises.map((exercise, exIdx) => {
          const completedSets = setsByExercise[exercise.name] || [];
          const targetSets: ProgramSet[] = Array.isArray(exercise.sets)
            ? exercise.sets
            : [];
          const isStringFormat = typeof exercise.sets === "string";

          return (
            <div key={exIdx} className="border border-[var(--border-subtle)]">
              <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                {isStringFormat && typeof exercise.sets === "string" && (
                  <p className="text-sm text-[var(--text-muted)]">{exercise.sets}</p>
                )}
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {isStringFormat ? (
                  <>
                    {completedSets.map((set, idx) => renderSetRow(set, idx))}
                    {renderAddSetForm(exercise.name, completedSets.length)}
                  </>
                ) : (
                  targetSets.map((targetSet, setIdx) => {
                    const isCompleted = setIdx < completedSets.length;
                    const completedSet = completedSets[setIdx];
                    const formKey = getFormKey(exercise.name, setIdx);
                    const form = inlineForms[formKey] || {};

                    return (
                      <div
                        key={setIdx}
                        className={`px-4 py-3 ${isCompleted ? 'bg-[var(--bg-elevated)]' : ''}`}
                      >
                        {isCompleted ? (
                          editingSetId === completedSet.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[var(--text-muted)] text-sm">Set {setIdx + 1}</span>
                                <button onClick={cancelEditing} className="text-[var(--text-muted)] hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                                  value={editForm.weight}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                                />
                                <span className="text-[var(--text-muted)] shrink-0">x</span>
                                <input
                                  type="number"
                                  className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                                  value={editForm.reps}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, reps: e.target.value }))}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateSet(completedSet.id)}
                                  loading={savingSet === `edit-${completedSet.id}`}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSet(completedSet.id)}
                                  loading={savingSet === `delete-${completedSet.id}`}
                                  className="text-[var(--accent-danger)]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-[var(--text-muted)] w-12 text-sm shrink-0">Set {setIdx + 1}</span>
                              <span className="font-[family-name:var(--font-geist-mono)] text-[var(--accent-success)] flex-1">
                                {completedSet.durationSeconds
                                  ? `Duration: ${formatDurationSeconds(completedSet.durationSeconds)}`
                                  : `${completedSet.weight} x ${completedSet.reps}`}
                              </span>
                              {!completedSet.durationSeconds && (
                                <button
                                  onClick={() => startEditingSet(completedSet)}
                                  className="text-[var(--text-muted)] hover:text-white p-1"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              <Check className="w-5 h-5 text-[var(--accent-success)]" />
                            </div>
                          )
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[var(--text-muted)] text-sm">Set {setIdx + 1}</span>
                              <span className="text-[var(--text-muted)] text-sm">
                                Target: {targetSet.weight} x {targetSet.reps}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder={String(targetSet.weight)}
                                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                                value={form.weight || ""}
                                onChange={(e) => handleInlineChange(formKey, "weight", e.target.value)}
                              />
                              <span className="text-[var(--text-muted)] shrink-0">x</span>
                              <input
                                type="number"
                                placeholder={String(targetSet.reps).replace('+', '')}
                                className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                                value={form.reps || ""}
                                onChange={(e) => handleInlineChange(formKey, "reps", e.target.value)}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleLogSet(exercise.name, setIdx, targetSet.weight, targetSet.reps)}
                              loading={savingSet === formKey}
                            >
                              Log
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Program Workout: Custom Exercise Section */}
        {!isCustomWorkout && (
          <div className="border border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-bold">Custom Exercise</h3>
              {!showAddForm && (
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {showAddForm && (
              <div className="px-4 py-4 space-y-3">
                <ExerciseAutocomplete
                  value={newExercise.name}
                  onChange={(name) => setNewExercise(prev => ({ ...prev, name }))}
                  placeholder="Search exercises..."
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Weight"
                    className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                  />
                  <span className="text-[var(--text-muted)]">x</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    className="w-20 sm:w-24 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddExerciseSet}
                    loading={savingSet === "add-exercise"}
                    disabled={!newExercise.name || !newExercise.weight || !newExercise.reps}
                  >
                    Log Set
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    setShowAddForm(false);
                    setNewExercise({ name: "", weight: "", reps: "" });
                  }}>
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
                  <div className="px-4 py-2 text-sm font-medium">{exerciseName}</div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {sets.map((set, idx) => renderSetRow(set, idx))}
                    {renderAddSetForm(exerciseName, sets.length)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
