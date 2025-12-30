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

async function getTemplates(userId: string) {
  return await prisma.workoutTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      exercises: true,
    },
  });
}

export default async function WorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [user, templates] = await Promise.all([
    getUserData(userId),
    getTemplates(userId),
  ]);
  const normalizedTemplates = templates.map((template) => ({
    ...template,
    exercises: Array.isArray(template.exercises) ? template.exercises : [],
  }));

  const hasProgram = !!user?.selectedProgram;
  const hasRepMaxes = (user?.repMaxes?.length || 0) >= 4;

  if (!hasProgram || !hasRepMaxes) {
    return (
      <WorkoutPageClient
        hasProgram={hasProgram}
        hasRepMaxes={hasRepMaxes}
        templates={normalizedTemplates}
      />
    );
  }

  const repMaxes: RepMaxes = user.repMaxes.reduce((acc, rm) => {
    acc[rm.exercise as keyof RepMaxes] = rm.oneRM;
    return acc;
  }, {} as RepMaxes);

  // We've already verified selectedProgram exists via hasProgram check above
  const selectedProgram = user.selectedProgram!;
  const program = programs[selectedProgram];
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
      programKey={selectedProgram}
      hasWeeks={program.hasWeeks}
      totalWeeks={program.totalWeeks}
      currentWeek={user.currentWeek}
      trainingMaxes={trainingMaxes}
      workouts={workouts}
      templates={normalizedTemplates}
    />
  );
}
