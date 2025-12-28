import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, formatLargeNumber } from "@/lib/utils";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";

async function getWorkouts(userId: string) {
  return await prisma.workout.findMany({
    where: { userId },
    include: {
      sets: true,
    },
    orderBy: { startedAt: "desc" },
  });
}

export default async function LogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workouts = await getWorkouts(userId);

  // Calculate total volume for each workout
  const workoutsWithVolume = workouts.map((workout) => {
    const totalVolume = workout.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    return { ...workout, totalVolume };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-2">
        WORKOUT HISTORY
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Track your progress over time
      </p>

      {workoutsWithVolume.length === 0 ? (
        <div className="text-center py-16 border border-[var(--border-subtle)]">
          <div className="text-4xl mb-4 text-[var(--text-muted)]">—</div>
          <h2 className="text-xl font-bold mb-2">No Workouts Yet</h2>
          <p className="text-[var(--text-muted)]">
            Start logging to see your history
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutsWithVolume.map((workout) => {
            const date = new Date(workout.startedAt);
            const exercises = [...new Set(workout.sets.map((s) => s.exercise))];

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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg">
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
                        <span>{workout.sets.length} sets</span>
                        <span>
                          {formatLargeNumber(workout.totalVolume)} lbs volume
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
                    </div>

                    {/* Delete button */}
                    <DeleteWorkoutButton workoutId={workout.id} />
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
