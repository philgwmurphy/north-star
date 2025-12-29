import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/workout/stat-card";
import { BodyWeightChart } from "@/components/body-weight/trend-chart";
import { formatLargeNumber } from "@/lib/utils";

async function getMetrics(userId: string) {
  const [workouts, repMaxes, bodyWeights] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      include: {
        sets: true,
      },
    }),
    prisma.repMax.findMany({
      where: { userId },
    }),
    prisma.bodyWeight.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 90,
    }),
  ]);

  return { workouts, repMaxes, bodyWeights };
}

export default async function MetricsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workouts, repMaxes, bodyWeights } = await getMetrics(userId);

  // Calculate stats
  const allSets = workouts.flatMap((w) => w.sets);
  const totalVolume = allSets.reduce((sum, set) => sum + set.weight * set.reps, 0);
  const totalSets = allSets.length;
  const uniqueExercises = [...new Set(allSets.map((s) => s.exercise))];

  // Group sets by exercise
  const exerciseStats = uniqueExercises.map((exercise) => {
    const exerciseSets = allSets.filter((s) => s.exercise === exercise);
    const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
    const avgWeight = Math.round(
      exerciseSets.reduce((sum, s) => sum + s.weight, 0) / exerciseSets.length
    );
    const totalReps = exerciseSets.reduce((sum, s) => sum + s.reps, 0);
    const exerciseVolume = exerciseSets.reduce(
      (sum, s) => sum + s.weight * s.reps,
      0
    );

    return {
      name: exercise,
      maxWeight,
      avgWeight,
      totalReps,
      totalVolume: exerciseVolume,
      setCount: exerciseSets.length,
    };
  });

  // Sort by volume
  exerciseStats.sort((a, b) => b.totalVolume - a.totalVolume);

  if (allSets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-2">
          PERFORMANCE METRICS
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Analyze your training data
        </p>

        <div className="text-center py-16 border border-[var(--border-subtle)]">
          <div className="text-4xl mb-4 text-[var(--text-muted)]">—</div>
          <h2 className="text-xl font-bold mb-2">No Data Yet</h2>
          <p className="text-[var(--text-muted)]">
            Log workouts to see your metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-2">
        PERFORMANCE METRICS
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Analyze your training data
      </p>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          value={workouts.length}
          label="Workouts"
        />
        <StatCard
          value={formatLargeNumber(totalVolume)}
          label="Total Volume"
        />
        <StatCard
          value={totalSets}
          label="Total Sets"
        />
        <StatCard
          value={uniqueExercises.length}
          label="Exercises"
        />
      </div>

      {/* Current 1RMs */}
      {repMaxes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Current 1RMs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {repMaxes.map((rm) => (
              <Card key={rm.id}>
                <CardContent className="py-4 text-center">
                  <div className="text-sm text-[var(--text-muted)] uppercase mb-1">
                    {rm.exercise}
                  </div>
                  <div className="font-[family-name:var(--font-bebas-neue)] text-3xl gradient-text">
                    {rm.oneRM}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">lbs</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Body Weight Trend */}
      {bodyWeights.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Body Weight</h2>
          <BodyWeightChart
            entries={bodyWeights.map(bw => ({
              id: bw.id,
              weight: bw.weight,
              unit: bw.unit,
              recordedAt: bw.recordedAt.toISOString(),
            }))}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard
              value={bodyWeights[0]?.weight || "—"}
              label="Current"
            />
            <StatCard
              value={(() => {
                if (bodyWeights.length < 2) return "—";
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const older = bodyWeights.find(bw => new Date(bw.recordedAt) <= weekAgo) || bodyWeights[bodyWeights.length - 1];
                const change = bodyWeights[0].weight - older.weight;
                const sign = change >= 0 ? "+" : "";
                return `${sign}${change.toFixed(1)}`;
              })()}
              label="7-Day Change"
            />
            <StatCard
              value={Math.min(...bodyWeights.map(bw => bw.weight)).toFixed(1)}
              label="Min"
            />
            <StatCard
              value={Math.max(...bodyWeights.map(bw => bw.weight)).toFixed(1)}
              label="Max"
            />
          </div>
        </section>
      )}

      {/* Exercise Breakdown */}
      <section>
        <h2 className="text-xl font-bold mb-4">Exercise Breakdown</h2>
        <div className="space-y-4">
          {exerciseStats.map((exercise) => (
            <Card key={exercise.name}>
              <CardContent className="py-4">
                <h3 className="font-bold text-lg mb-4">{exercise.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] p-3 text-center">
                    <div className="font-[family-name:var(--font-bebas-neue)] text-2xl text-white">
                      {exercise.maxWeight}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">
                      Max Weight
                    </div>
                  </div>
                  <div className="bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] p-3 text-center">
                    <div className="font-[family-name:var(--font-bebas-neue)] text-2xl text-white">
                      {exercise.avgWeight}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">
                      Avg Weight
                    </div>
                  </div>
                  <div className="bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] p-3 text-center">
                    <div className="font-[family-name:var(--font-bebas-neue)] text-2xl text-white">
                      {formatLargeNumber(exercise.totalVolume)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">
                      Total Volume
                    </div>
                  </div>
                  <div className="bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] p-3 text-center">
                    <div className="font-[family-name:var(--font-bebas-neue)] text-2xl text-white">
                      {exercise.totalReps}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">
                      Total Reps
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
