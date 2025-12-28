import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { programs, type RepMaxes } from "@/lib/programs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeekSelector } from "@/components/workout/week-selector";
import { Play } from "lucide-react";

async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      repMaxes: true,
    },
  });
}

export default async function WorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user?.selectedProgram || user.repMaxes.length < 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 border border-[var(--border-subtle)]">
          <div className="text-4xl mb-4 text-[var(--text-muted)]">—</div>
          <h2 className="text-lg font-semibold mb-2">NO PROGRAM SELECTED</h2>
          <p className="text-[var(--text-muted)] mb-6 text-sm">
            Set up your program to begin training
          </p>
          <Link href="/programs">
            <Button>Configure Program</Button>
          </Link>
        </div>
      </div>
    );
  }

  const repMaxes: RepMaxes = user.repMaxes.reduce((acc, rm) => {
    acc[rm.exercise as keyof RepMaxes] = rm.oneRM;
    return acc;
  }, {} as RepMaxes);

  const program = programs[user.selectedProgram];
  const workouts = program.getWorkouts(repMaxes, user.currentWeek);

  const trainingMaxes = {
    squat: Math.round(repMaxes.squat * 0.9),
    bench: Math.round(repMaxes.bench * 0.9),
    deadlift: Math.round(repMaxes.deadlift * 0.9),
    ohp: Math.round(repMaxes.ohp * 0.9),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">
            Current Program
          </p>
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wide">
            {program.name.toUpperCase()}
          </h1>
        </div>

        {/* Training Maxes */}
        <div className="hidden sm:flex gap-6 text-right">
          {Object.entries(trainingMaxes).map(([lift, value]) => (
            <div key={lift}>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                {lift} TM
              </div>
              <div className="font-[family-name:var(--font-geist-mono)] text-lg">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Selector for 5/3/1 */}
      {program.hasWeeks && program.totalWeeks && (
        <WeekSelector
          currentWeek={user.currentWeek}
          totalWeeks={program.totalWeeks}
        />
      )}

      {/* Workout Days */}
      <div className="space-y-8">
        {workouts.map((workout, dayIdx) => (
          <div key={workout.day} className="border border-[var(--border-subtle)]">
            {/* Day Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-bebas-neue)] text-xl tracking-wide">
                  {workout.day.toUpperCase()}
                </span>
                <Badge variant="default">{workout.focus}</Badge>
              </div>
              <form action="/api/workouts" method="POST">
                <input type="hidden" name="programKey" value={user.selectedProgram || ""} />
                <input type="hidden" name="programDay" value={workout.day} />
                <Button size="sm" variant="outline">
                  <Play className="w-3 h-3 mr-2" />
                  Start
                </Button>
              </form>
            </div>

            {/* Exercises Table */}
            <table className="data-table">
              <thead>
                <tr className="bg-[var(--bg-elevated)]">
                  <th className="w-1/3">Exercise</th>
                  <th>Sets</th>
                </tr>
              </thead>
              <tbody>
                {workout.exercises.map((exercise, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{exercise.name}</td>
                    <td>
                      {Array.isArray(exercise.sets) ? (
                        <div className="flex flex-wrap gap-2">
                          {exercise.sets.map((set, setIdx) => (
                            <span
                              key={setIdx}
                              className="inline-flex items-center gap-1 font-[family-name:var(--font-geist-mono)] text-sm bg-[var(--bg-elevated)] px-3 py-1 border border-[var(--border-subtle)]"
                            >
                              <span className="text-white">{set.weight}</span>
                              <span className="text-[var(--text-muted)]">×</span>
                              <span className={String(set.reps).includes('+') ? 'text-[var(--accent-success)]' : 'text-white'}>
                                {set.reps}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--text-secondary)] font-[family-name:var(--font-geist-mono)] text-sm">
                          {exercise.sets}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
