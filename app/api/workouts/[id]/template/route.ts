import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function buildTemplateExercises(sets: Array<{ exercise: string; weight: number; reps: number; durationSeconds: number | null }>) {
  const grouped = new Map<string, Array<{ weight: number; reps: number; durationSeconds?: number | null }>>();

  for (const set of sets) {
    const existing = grouped.get(set.exercise) || [];
    existing.push({
      weight: set.weight,
      reps: set.reps,
      ...(set.durationSeconds ? { durationSeconds: set.durationSeconds } : {}),
    });
    grouped.set(set.exercise, existing);
  }

  return Array.from(grouped.entries()).map(([name, exerciseSets]) => ({
    name,
    sets: exerciseSets,
  }));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workout = await prisma.workout.findFirst({
      where: { id, userId },
      include: {
        sets: {
          orderBy: { completedAt: "asc" },
          select: {
            exercise: true,
            weight: true,
            reps: true,
            durationSeconds: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const exercises = buildTemplateExercises(workout.sets);
    const baseName = workout.programDay || "Workout";
    const templateName = `${baseName} Template`;

    const template = await prisma.workoutTemplate.create({
      data: {
        userId,
        name: templateName,
        exercises,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating template from workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
