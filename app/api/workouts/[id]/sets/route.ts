import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: workoutId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify workout belongs to user
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId,
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const { exercise, weight, reps, setNumber, rpe, isWarmup, durationSeconds } = await request.json();

    const set = await prisma.workoutSet.create({
      data: {
        workoutId,
        exercise,
        weight,
        reps,
        durationSeconds,
        setNumber,
        rpe,
        isWarmup: isWarmup || false,
      },
    });

    return NextResponse.json(set);
  } catch (error) {
    console.error("Error creating set:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
