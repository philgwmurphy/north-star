import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, formatLargeNumber } from "@/lib/utils";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";
import { ChevronRight } from "lucide-react";

async function getWorkoutsWithSets(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      programDay: true,
      startedAt: true,
      completedAt: true,
    },
  });

  if (workouts.length === 0) {
    return { workouts, sets: [] };
  }

  const workoutIds = workouts.map((workout) => workout.id);
  const sets = await prisma.workoutSet.findMany({
    where: { workoutId: { in: workoutIds } },
    select: {
      workoutId: true,
      exercise: true,
      weight: true,
      reps: true,
    },
  });

  return { workouts, sets };
}

export default async function LogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workouts, sets } = await getWorkoutsWithSets(userId);

  const workoutStats = new Map<string, { totalVolume: number; exercises: Set<string>; setCount: number }>();
  for (const set of sets) {
    const existing = workoutStats.get(set.workoutId) || { totalVolume: 0, exercises: new Set<string>(), setCount: 0 };
    existing.totalVolume += set.weight * set.reps;
    existing.exercises.add(set.exercise);
    existing.setCount += 1;
    workoutStats.set(set.workoutId, existing);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-2">
        WORKOUT HISTORY
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Track your progress over time
      </p>

      {workouts.length === 0 ? (
        <div className="text-center py-16 border border-[var(--border-subtle)]">
          <div className="text-4xl mb-4 text-[var(--text-muted)]">—</div>
          <h2 className="text-xl font-bold mb-2">No Workouts Yet</h2>
          <p className="text-[var(--text-muted)]">
            Start logging to see your history
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const date = new Date(workout.startedAt);
            const stats = workoutStats.get(workout.id);
            const exercises = stats ? [...stats.exercises] : [];
            const totalVolume = stats?.totalVolume ?? 0;
            const setCount = stats?.setCount ?? 0;

            return (
              <Card key={workout.id} variant="interactive">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Date */}
                    <div className="text-center bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] p-3 min-w-[70px]">
                      <div className="font-[family-name:var(--font-bebas-neue)] text-2xl">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] uppercase">
                        {date.toLocaleString("default", { month: "short" })}
                      </div>
                    </div>

                    {/* Content - Clickable Link */}
                    <Link href={`/logs/${workout.id}`} className="flex-1 min-w-0 group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-[var(--text-muted)] transition-colors">
                            {workout.programDay || "Custom Workout"}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            {formatRelativeTime(workout.startedAt)}
                          </p>
                        </div>
                        {workout.completedAt ? (
                          <span className="text-xs text-[var(--accent-success)] border border-[var(--accent-success)] px-2 py-1 shrink-0">
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--accent-warning)] border border-[var(--accent-warning)] px-2 py-1 shrink-0">
                            In Progress
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                        <span>{setCount} sets</span>
                        <span>
                          {formatLargeNumber(totalVolume)} lbs volume
                        </span>
                        <span>{exercises.length} exercises</span>
                      </div>

                      {/* Exercises */}
                      {exercises.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exercises.slice(0, 4).map((exercise) => (
                            <span
                              key={exercise}
                              className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-1"
                            >
                              {exercise}
                            </span>
                          ))}
                          {exercises.length > 4 && (
                            <span className="text-xs text-[var(--text-muted)]">
                              +{exercises.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/logs/${workout.id}`}
                        className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                      <DeleteWorkoutButton workoutId={workout.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
