"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { programs, type RepMaxes } from "@/lib/programs";
import { formatDuration } from "@/lib/utils";
import { Check, Plus, Clock } from "lucide-react";

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

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [logForm, setLogForm] = useState({
    weight: "",
    reps: "",
    rpe: "",
  });
  const [saving, setSaving] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("");

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

  const openLogModal = (exercise: string) => {
    setSelectedExercise(exercise);
    setLogForm({ weight: "", reps: "", rpe: "" });
    setShowLogModal(true);
  };

  const handleLogSet = async () => {
    if (!logForm.weight || !logForm.reps) return;

    setSaving(true);
    try {
      const existingSets = workout?.sets.filter(
        (s) => s.exercise === selectedExercise
      ).length || 0;

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: selectedExercise,
          weight: parseFloat(logForm.weight),
          reps: parseInt(logForm.reps),
          setNumber: existingSets + 1,
          rpe: logForm.rpe ? parseInt(logForm.rpe) : undefined,
        }),
      });

      if (response.ok) {
        const newSet = await response.json();
        setWorkout((prev) =>
          prev ? { ...prev, sets: [...prev.sets, newSet] } : prev
        );
        setShowLogModal(false);
      }
    } catch (error) {
      console.error("Failed to log set:", error);
    } finally {
      setSaving(false);
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
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-3xl tracking-wide">
            {workout.programDay || "CUSTOM WORKOUT"}
          </h1>
          <div className="flex items-center gap-4 text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {elapsedTime}
            </span>
            <span>{workout.sets.length} sets completed</span>
          </div>
        </div>
        <Button onClick={handleFinishWorkout} variant="secondary">
          <Check className="w-4 h-4 mr-2" />
          Finish
        </Button>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {programExercises.map((exercise, idx) => {
          const completedSets = setsByExercise[exercise.name] || [];
          const targetSets = Array.isArray(exercise.sets)
            ? exercise.sets.length
            : 3;

          return (
            <Card key={idx}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                    <div className="text-sm text-[var(--text-muted)]">
                      {Array.isArray(exercise.sets) ? (
                        exercise.sets.map((s, i) => (
                          <span key={i} className="mr-2">
                            {s.weight}lbs x {s.reps}
                          </span>
                        ))
                      ) : (
                        <span>{exercise.sets}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {completedSets.length}/{targetSets} sets
                  </div>
                </div>

                {/* Completed sets */}
                {completedSets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {completedSets.map((set) => (
                      <div
                        key={set.id}
                        className="bg-[var(--bg-elevated)] text-[var(--accent-success)] border border-[var(--accent-success)] px-3 py-1 text-sm font-[family-name:var(--font-geist-mono)]"
                      >
                        {set.weight}lbs x {set.reps}
                        {set.rpe && <span className="ml-1 opacity-70">@{set.rpe}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => openLogModal(exercise.name)}
                  variant="secondary"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Set
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Custom exercise button */}
        <Button
          onClick={() => openLogModal("")}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Exercise
        </Button>
      </div>

      {/* Log Set Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="LOG SET"
      >
        <div className="space-y-4">
          {!selectedExercise && (
            <Input
              label="Exercise"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              placeholder="Exercise name"
            />
          )}
          {selectedExercise && (
            <div className="text-lg font-bold mb-4">{selectedExercise}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (lbs)"
              type="number"
              value={logForm.weight}
              onChange={(e) =>
                setLogForm((prev) => ({ ...prev, weight: e.target.value }))
              }
              placeholder="225"
            />
            <Input
              label="Reps"
              type="number"
              value={logForm.reps}
              onChange={(e) =>
                setLogForm((prev) => ({ ...prev, reps: e.target.value }))
              }
              placeholder="5"
            />
          </div>

          <Input
            label="RPE (optional)"
            type="number"
            min="1"
            max="10"
            value={logForm.rpe}
            onChange={(e) =>
              setLogForm((prev) => ({ ...prev, rpe: e.target.value }))
            }
            placeholder="8"
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowLogModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleLogSet} loading={saving} className="flex-1">
              Save Set
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
