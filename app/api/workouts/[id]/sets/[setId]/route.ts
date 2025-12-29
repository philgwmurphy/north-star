import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: workoutId, setId } = await params;

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

    // Verify set belongs to this workout
    const existingSet = await prisma.workoutSet.findFirst({
      where: {
        id: setId,
        workoutId,
      },
    });

    if (!existingSet) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    const { weight, reps, rpe, durationSeconds } = await request.json();

    const updatedSet = await prisma.workoutSet.update({
      where: { id: setId },
      data: {
        ...(weight !== undefined && { weight }),
        ...(reps !== undefined && { reps }),
        ...(durationSeconds !== undefined && { durationSeconds }),
        ...(rpe !== undefined && { rpe }),
      },
    });

    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error("Error updating set:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: workoutId, setId } = await params;

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

    // Verify set belongs to this workout
    const existingSet = await prisma.workoutSet.findFirst({
      where: {
        id: setId,
        workoutId,
      },
    });

    if (!existingSet) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    await prisma.workoutSet.delete({
      where: { id: setId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting set:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
