"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExerciseAutocomplete } from "@/components/ui/exercise-autocomplete";
import { formatDurationSeconds } from "@/lib/utils";
import { ArrowLeft, Calendar, Check, Clock, Pencil, Trash2, X } from "lucide-react";

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  durationSeconds?: number | null;
  setNumber: number;
  rpe: number | null;
  isWarmup: boolean;
  completedAt: string;
}

interface WorkoutData {
  id: string;
  programDay: string | null;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  sets: WorkoutSet[];
}

interface WorkoutDetailEditorProps {
  initialWorkout: WorkoutData;
}

export function WorkoutDetailEditor({ initialWorkout }: WorkoutDetailEditorProps) {
  const [workout, setWorkout] = useState<WorkoutData>(initialWorkout);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingSetIsCardio, setEditingSetIsCardio] = useState(false);
  const [editForm, setEditForm] = useState<{ weight: string; reps: string }>({ weight: "", reps: "" });
  const [editDuration, setEditDuration] = useState<{ hours: string; minutes: string }>({
    hours: "",
    minutes: "",
  });
  const [savingSet, setSavingSet] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", weight: "", reps: "" });
  const [cardioEntry, setCardioEntry] = useState({ name: "", hours: "", minutes: "" });

  const sortedSets = useMemo(() => {
    return [...workout.sets].sort((a, b) => {
      const aTime = new Date(a.completedAt).getTime();
      const bTime = new Date(b.completedAt).getTime();
      return aTime - bTime;
    });
  }, [workout.sets]);

  const setsByExercise = useMemo(() => {
    return sortedSets.reduce((acc, set) => {
      if (!acc[set.exercise]) acc[set.exercise] = [];
      acc[set.exercise].push(set);
      return acc;
    }, {} as Record<string, WorkoutSet[]>);
  }, [sortedSets]);

  const totalVolume = sortedSets.reduce((sum, set) => sum + set.weight * set.reps, 0);
  const totalCardioSeconds = sortedSets.reduce(
    (sum, set) => sum + (set.durationSeconds || 0),
    0
  );
  const exerciseCount = Object.keys(setsByExercise).length;

  const date = new Date(workout.startedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let duration = "";
  if (workout.completedAt) {
    const start = new Date(workout.startedAt);
    const end = new Date(workout.completedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) {
      duration = `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      duration = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

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
      const response = await fetch(`/api/workouts/${workout.id}/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, reps }),
      });

      if (response.ok) {
        const updatedSet = await response.json();
        setWorkout((prev) => ({
          ...prev,
          sets: prev.sets.map((set) => (set.id === setId ? updatedSet : set)),
        }));
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
      const response = await fetch(`/api/workouts/${workout.id}/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds }),
      });

      if (response.ok) {
        const updatedSet = await response.json();
        setWorkout((prev) => ({
          ...prev,
          sets: prev.sets.map((set) => (set.id === setId ? updatedSet : set)),
        }));
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
      const response = await fetch(`/api/workouts/${workout.id}/sets/${setId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWorkout((prev) => ({
          ...prev,
          sets: prev.sets.filter((set) => set.id !== setId),
        }));
      }
    } catch (error) {
      console.error("Failed to delete set:", error);
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
      const existingSets = workout.sets.filter((set) => set.exercise === newExercise.name).length;

      const response = await fetch(`/api/workouts/${workout.id}/sets`, {
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
        setWorkout((prev) => ({ ...prev, sets: [...prev.sets, newSet] }));
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
      const existingSets = workout.sets.filter((set) => set.exercise === cardioEntry.name).length;
      const response = await fetch(`/api/workouts/${workout.id}/sets`, {
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
        setWorkout((prev) => ({ ...prev, sets: [...prev.sets, newSet] }));
        setCardioEntry({ name: "", hours: "", minutes: "" });
      }
    } catch (error) {
      console.error("Failed to log cardio:", error);
    } finally {
      setSavingSet(null);
    }
  };

  const renderSetRow = (set: WorkoutSet, idx: number) => (
    <div key={set.id} className="px-4 py-3 flex items-center gap-4">
      <span className="text-[var(--text-muted)] w-16 text-sm">
        Set {idx + 1}
      </span>
      {editingSetId === set.id ? (
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-sm">Editing</span>
            <button onClick={cancelEditing} className="text-[var(--text-muted)] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {editingSetIsCardio ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Hours"
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editDuration.hours}
                onChange={(e) => setEditDuration((prev) => ({ ...prev, hours: e.target.value }))}
              />
              <span className="text-[var(--text-muted)] shrink-0">h</span>
              <input
                type="number"
                placeholder="Minutes"
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editDuration.minutes}
                onChange={(e) => setEditDuration((prev) => ({ ...prev, minutes: e.target.value }))}
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
                className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editForm.weight}
                onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}
              />
              <span className="text-[var(--text-muted)] shrink-0">x</span>
              <input
                type="number"
                className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={editForm.reps}
                onChange={(e) => setEditForm((prev) => ({ ...prev, reps: e.target.value }))}
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
        <>
          <span className="font-[family-name:var(--font-geist-mono)] text-lg">
            {set.durationSeconds
              ? `Duration: ${formatDurationSeconds(set.durationSeconds)}`
              : `${set.weight} lbs x ${set.reps}`}
          </span>
          {set.rpe && (
            <span className="text-sm text-[var(--text-muted)]">
              RPE {set.rpe}
            </span>
          )}
          {set.isWarmup && (
            <span className="text-xs bg-[var(--bg-elevated)] text-[var(--text-muted)] px-2 py-0.5">
              Warmup
            </span>
          )}
          <button
            onClick={() => startEditingSet(set)}
            className="ml-auto text-[var(--text-muted)] hover:text-white p-1"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <Check className="w-5 h-5 text-[var(--accent-success)]" />
        </>
      )}
    </div>
  );

  const renderAddSetForm = (exerciseName: string, completedSetsCount: number) => (
    <div className="px-4 py-3 space-y-3">
      <span className="text-[var(--text-muted)] text-sm">Set {completedSetsCount + 1}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Weight (lbs)"
          className="w-24 sm:w-28 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
          value={newExercise.name === exerciseName ? newExercise.weight : ""}
          onChange={(e) => setNewExercise((prev) => ({ ...prev, name: exerciseName, weight: e.target.value }))}
        />
        <span className="text-[var(--text-muted)] shrink-0">x</span>
        <input
          type="number"
          placeholder="Reps"
          className="w-20 sm:w-24 shrink-0 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
          value={newExercise.name === exerciseName ? newExercise.reps : ""}
          onChange={(e) => setNewExercise((prev) => ({ ...prev, name: exerciseName, reps: e.target.value }))}
        />
      </div>
      <Button
        size="sm"
        className="w-full"
        onClick={handleAddExerciseSet}
        loading={savingSet === "add-exercise"}
        disabled={newExercise.name !== exerciseName || !newExercise.weight || !newExercise.reps}
      >
        Log
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/logs"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Logs
      </Link>

      <div className="mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide mb-1">
              {workout.programDay || "CUSTOM WORKOUT"}
            </h1>
            <p className="text-[var(--text-muted)] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </p>
          </div>
          {workout.completedAt ? (
            <span className="text-xs text-[var(--accent-success)] border border-[var(--accent-success)] px-2 py-1">
              Completed
            </span>
          ) : (
            <span className="text-xs text-[var(--accent-warning)] border border-[var(--accent-warning)] px-2 py-1">
              In Progress
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span>{workout.sets.length} sets</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span>{exerciseCount} exercises</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span>{totalVolume.toLocaleString()} lbs volume</span>
          </div>
          {totalCardioSeconds > 0 && (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <span>{formatDurationSeconds(totalCardioSeconds)} cardio</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>
        <p className="text-[var(--text-muted)] text-xs mt-2">Edits here update a logged workout, even if completed.</p>
      </div>

      <div className="space-y-6">
        {Object.entries(setsByExercise).map(([exerciseName, sets]) => {
          const exerciseVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
          const exerciseCardioSeconds = sets.reduce(
            (sum, set) => sum + (set.durationSeconds || 0),
            0
          );

          return (
            <div
              key={exerciseName}
              className="border border-[var(--border-subtle)]"
            >
              <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h3 className="font-bold text-lg">{exerciseName}</h3>
                <span className="text-sm text-[var(--text-muted)]">
                  {sets.length} sets &middot;{" "}
                  {exerciseCardioSeconds > 0
                    ? `${formatDurationSeconds(exerciseCardioSeconds)}`
                    : `${exerciseVolume.toLocaleString()} lbs`}
                </span>
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {sets.map((set, idx) => renderSetRow(set, idx))}
                {renderAddSetForm(exerciseName, sets.length)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-6">
        <div className="border border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-bold">Add Exercise</h3>
            {!showAddForm && (
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                Add
              </Button>
            )}
          </div>

          {showAddForm && (
            <div className="px-4 py-4 space-y-3">
              <ExerciseAutocomplete
                value={newExercise.name}
                onChange={(name) => setNewExercise((prev) => ({ ...prev, name }))}
                placeholder="Search exercises..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, weight: e.target.value }))}
                />
                <span className="text-[var(--text-muted)]">x</span>
                <input
                  type="number"
                  placeholder="Reps"
                  className="w-20 sm:w-24 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, reps: e.target.value }))}
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
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewExercise({ name: "", weight: "", reps: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-bold">Cardio</h3>
            <p className="text-sm text-[var(--text-muted)]">Log cardio by duration</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <ExerciseAutocomplete
              value={cardioEntry.name}
              onChange={(name) => setCardioEntry((prev) => ({ ...prev, name }))}
              placeholder="Search cardio exercise..."
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Hours"
                className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={cardioEntry.hours}
                onChange={(e) => setCardioEntry((prev) => ({ ...prev, hours: e.target.value }))}
              />
              <span className="text-[var(--text-muted)]">h</span>
              <input
                type="number"
                placeholder="Minutes"
                className="w-24 sm:w-28 shrink-0 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
                value={cardioEntry.minutes}
                onChange={(e) => setCardioEntry((prev) => ({ ...prev, minutes: e.target.value }))}
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
      </div>

      {workout.notes && (
        <div className="mt-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <h3 className="font-bold mb-2">Notes</h3>
          <p className="text-[var(--text-muted)] whitespace-pre-wrap">
            {workout.notes}
          </p>
        </div>
      )}

      {workout.sets.length === 0 && (
        <div className="text-center py-16 border border-[var(--border-subtle)]">
          <div className="text-4xl mb-4 text-[var(--text-muted)]">—</div>
          <h2 className="text-xl font-bold mb-2">No Sets Logged</h2>
          <p className="text-[var(--text-muted)]">
            This workout has no recorded sets
          </p>
        </div>
      )}
    </div>
  );
}
