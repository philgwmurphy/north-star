import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, ClipboardList, BookOpen, Settings, ChevronRight, ArrowRight } from "lucide-react";
import { QuickStartSection } from "@/components/workout/quick-start-section";
import { BodyWeightQuickEntry } from "@/components/body-weight/quick-entry";
import { prisma } from "@/lib/db";
import { programs, type RepMaxes } from "@/lib/programs";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { computeRecoveryScores } from "@/lib/recovery";

async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      selectedProgram: true,
      currentWeek: true,
      repMaxes: {
        select: {
          exercise: true,
          oneRM: true,
        },
      },
      workouts: {
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          id: true,
          programDay: true,
          startedAt: true,
          completedAt: true,
          _count: { select: { sets: true } },
        },
      },
      settings: {
        select: {
          weightUnit: true,
        },
      },
    },
  });
}

async function getLatestBodyWeight(userId: string) {
  return await prisma.bodyWeight.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    select: {
      weight: true,
      unit: true,
      recordedAt: true,
    },
  });
}

async function getActiveWorkout(userId: string) {
  return await prisma.workout.findFirst({
    where: {
      userId,
      completedAt: null,
    },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      programKey: true,
      programDay: true,
      startedAt: true,
      _count: { select: { sets: true } },
    },
  });
}

async function getRecoverySets(userId: string) {
  return await prisma.workoutSet.findMany({
    where: { workout: { userId } },
    select: {
      workoutId: true,
      exercise: true,
      weight: true,
      reps: true,
      durationSeconds: true,
      completedAt: true,
    },
    orderBy: { completedAt: "desc" },
    take: 500,
  });
}

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [user, activeWorkout, latestBodyWeight, recoverySets] = await Promise.all([
    getUserData(userId),
    getActiveWorkout(userId),
    getLatestBodyWeight(userId),
    getRecoverySets(userId),
  ]);

  // Convert rep maxes array to object
  const repMaxes: RepMaxes | null = user?.repMaxes.length === 4
    ? user.repMaxes.reduce((acc, rm) => {
        acc[rm.exercise as keyof RepMaxes] = rm.oneRM;
        return acc;
      }, {} as RepMaxes)
    : null;

  const program = user?.selectedProgram ? programs[user.selectedProgram] : null;
  const nextDay = program?.getWorkouts(repMaxes || { squat: 0, bench: 0, deadlift: 0, ohp: 0 })[0]?.day;
  const recoveryScores = computeRecoveryScores(
    recoverySets.map((set) => ({
      ...set,
      completedAt: set.completedAt,
      durationSeconds: set.durationSeconds ?? null,
    }))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-[var(--text-muted)]">Welcome back</p>
        <h1 className="text-3xl font-bold">Ready to train?</h1>
      </div>

      {/* Active Workout or Quick Start */}
      <section className="mb-8">
        {activeWorkout ? (
          <Link href={`/workout/${activeWorkout.id}`}>
            <div className="relative overflow-hidden bg-[var(--bg-surface)] border-2 border-white p-6 hover:bg-[var(--bg-elevated)] transition-colors">
              <div className="relative">
                <p className="text-white font-semibold text-xs uppercase tracking-wider mb-1">
                  WORKOUT IN PROGRESS
                </p>
                <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide mb-1">
                  {activeWorkout.programKey ? programs[activeWorkout.programKey]?.name : "Custom Workout"}
                </h2>
                {activeWorkout.programKey && (
                  <p className="text-[var(--text-muted)] text-sm mb-2">
                    {programs[activeWorkout.programKey]?.hasWeeks && user?.currentWeek && (
                      <>Week {user.currentWeek} &bull; </>
                    )}
                    {activeWorkout.programDay}
                  </p>
                )}
                <p className="text-[var(--text-muted)] text-sm">
                  {activeWorkout._count.sets} sets completed &bull; {formatDuration(activeWorkout.startedAt)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider">
                  Continue Workout <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <QuickStartSection
            programKey={user?.selectedProgram || null}
            repMaxes={repMaxes}
            nextDay={nextDay}
          />
        )}
      </section>

      {/* Quick Actions Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Metrics"
            href="/metrics"
          />
          <QuickActionCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Programs"
            href="/programs"
          />
          <QuickActionCard
            icon={<ClipboardList className="w-6 h-6" />}
            label="Logs"
            href="/logs"
          />
          <QuickActionCard
            icon={<Settings className="w-6 h-6" />}
            label="Settings"
            href="/settings"
          />
        </div>
      </section>

      {/* Body Weight Quick Entry */}
      <section className="mb-8">
        <BodyWeightQuickEntry
          latestWeight={latestBodyWeight ? {
            weight: latestBodyWeight.weight,
            unit: latestBodyWeight.unit,
            recordedAt: latestBodyWeight.recordedAt.toISOString(),
          } : null}
          defaultUnit={user?.settings?.weightUnit || "lbs"}
        />
      </section>

      {recoveryScores.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recovery Snapshot</h2>
            <span className="text-xs text-[var(--text-muted)]">Estimated</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recoveryScores.slice(0, 6).map((score) => (
              <div
                key={score.category}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4"
              >
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {score.category}
                </div>
                <div className="font-[family-name:var(--font-bebas-neue)] text-3xl">
                  {score.score}%
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Last trained {formatRelativeTime(score.lastTrainedAt)}
                </div>
                <div className="mt-2 h-1 bg-[var(--bg-elevated)]">
                  <div
                    className="h-full bg-[var(--accent-primary)]"
                    style={{ width: `${score.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Workouts */}
      {user?.workouts && user.workouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Workouts</h2>
            <Link
              href="/logs"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {user.workouts.filter(w => w.completedAt).slice(0, 3).map((workout) => (
              <div
                key={workout.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {workout.programDay || "Custom Workout"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {workout._count.sets} sets &bull; {formatRelativeTime(workout.startedAt)}
                  </p>
                </div>
                <span className="text-xs text-[var(--accent-success)] border border-[var(--accent-success)] px-2 py-1">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuickActionCard({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex items-center gap-3 hover:border-[var(--border-active)] transition-colors group"
    >
      <div className="w-10 h-10 bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="font-semibold">{label}</span>
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] ml-auto" />
    </Link>
  );
}
