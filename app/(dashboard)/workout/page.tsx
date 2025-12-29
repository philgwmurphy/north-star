import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { programs, type RepMaxes } from "@/lib/programs";
import { WorkoutPageClient } from "@/components/workout/workout-page-client";

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

  const hasProgram = !!user?.selectedProgram;
  const hasRepMaxes = (user?.repMaxes?.length || 0) >= 4;

  if (!hasProgram || !hasRepMaxes) {
    return (
      <WorkoutPageClient
        hasProgram={hasProgram}
        hasRepMaxes={hasRepMaxes}
      />
    );
  }

  const repMaxes: RepMaxes = user.repMaxes.reduce((acc, rm) => {
    acc[rm.exercise as keyof RepMaxes] = rm.oneRM;
    return acc;
  }, {} as RepMaxes);

  const program = programs[user.selectedProgram];
  const workouts = program.getWorkouts(repMaxes, user.currentWeek);

  const trainingMaxes = program.usesTrainingMax
    ? {
        squat: Math.round(repMaxes.squat * 0.9),
        bench: Math.round(repMaxes.bench * 0.9),
        deadlift: Math.round(repMaxes.deadlift * 0.9),
        ohp: Math.round(repMaxes.ohp * 0.9),
      }
    : null;

  return (
    <WorkoutPageClient
      hasProgram={hasProgram}
      hasRepMaxes={hasRepMaxes}
      programName={program.name}
      programKey={user.selectedProgram}
      usesTrainingMax={program.usesTrainingMax}
      hasWeeks={program.hasWeeks}
      totalWeeks={program.totalWeeks}
      currentWeek={user.currentWeek}
      trainingMaxes={trainingMaxes}
      workouts={workouts}
    />
  );
}
