import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDuration, formatDurationSeconds } from "@/lib/utils";
import { ArrowLeft, Clock, Dumbbell, Calendar } from "lucide-react";

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  durationSeconds?: number | null;
  setNumber: number;
  rpe: number | null;
  isWarmup: boolean;
  completedAt: Date;
}

async function getWorkout(workoutId: string, userId: string) {
  return await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      sets: {
        orderBy: { completedAt: "asc" },
      },
    },
  });
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const workout = await getWorkout(id, userId);

  if (!workout) {
    notFound();
  }

  // Group sets by exercise
  const setsByExercise = workout.sets.reduce((acc, set) => {
    if (!acc[set.exercise]) acc[set.exercise] = [];
    acc[set.exercise].push(set);
    return acc;
  }, {} as Record<string, WorkoutSet[]>);

  // Calculate stats
  const totalVolume = workout.sets.reduce(
    (sum, set) => sum + set.weight * set.reps,
    0
  );
  const exerciseCount = Object.keys(setsByExercise).length;

  // Format date
  const date = new Date(workout.startedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate duration if completed
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/logs"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Logs
      </Link>

      {/* Header */}
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

        {/* Stats */}
        <div className="flex flex-wrap gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Dumbbell className="w-4 h-4" />
            <span>{workout.sets.length} sets</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span>{exerciseCount} exercises</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span>{totalVolume.toLocaleString()} lbs volume</span>
          </div>
          {duration && (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        {Object.entries(setsByExercise).map(([exerciseName, sets]) => {
          const exerciseVolume = sets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0
          );

          return (
            <div
              key={exerciseName}
              className="border border-[var(--border-subtle)]"
            >
              {/* Exercise Header */}
              <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h3 className="font-bold text-lg">{exerciseName}</h3>
                <span className="text-sm text-[var(--text-muted)]">
                  {sets.length} sets &middot; {exerciseVolume.toLocaleString()}{" "}
                  lbs
                </span>
              </div>

              {/* Sets */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {sets.map((set, idx) => (
                  <div
                    key={set.id}
                    className="px-4 py-3 flex items-center gap-4"
                  >
                    <span className="text-[var(--text-muted)] w-16 text-sm">
                      Set {idx + 1}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-lg">
                      {set.durationSeconds
                        ? `Duration: ${formatDurationSeconds(set.durationSeconds)}`
                        : `${set.weight} x ${set.reps}`}
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {workout.notes && (
        <div className="mt-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <h3 className="font-bold mb-2">Notes</h3>
          <p className="text-[var(--text-muted)] whitespace-pre-wrap">
            {workout.notes}
          </p>
        </div>
      )}

      {/* Empty state */}
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
