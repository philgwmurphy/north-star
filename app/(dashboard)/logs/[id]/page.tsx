import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WorkoutDetailEditor } from "@/components/workout/workout-detail-editor";

async function getWorkout(workoutId: string, userId: string) {
  return await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    select: {
      id: true,
      programDay: true,
      startedAt: true,
      completedAt: true,
      notes: true,
      sets: {
        orderBy: { completedAt: "asc" },
        select: {
          id: true,
          exercise: true,
          weight: true,
          reps: true,
          durationSeconds: true,
          setNumber: true,
          rpe: true,
          isWarmup: true,
          completedAt: true,
        },
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

  const initialWorkout = {
    id: workout.id,
    programDay: workout.programDay,
    startedAt: workout.startedAt.toISOString(),
    completedAt: workout.completedAt ? workout.completedAt.toISOString() : null,
    notes: workout.notes,
    sets: workout.sets.map((set) => ({
      ...set,
      completedAt: set.completedAt.toISOString(),
    })),
  };

  return (
    <WorkoutDetailEditor initialWorkout={initialWorkout} />
  );
}
