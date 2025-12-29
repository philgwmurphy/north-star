import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    const wantsJson = contentType.includes("application/json");
    let programKey: string | null = null;
    let programDay: string | null = null;
    let workoutName: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      programKey = body.programKey || null;
      programDay = body.programDay || null;
      workoutName = body.workoutName || null;
    } else {
      const formData = await request.formData();
      programKey = (formData.get("programKey") as string) || null;
      programDay = (formData.get("programDay") as string) || null;
      workoutName = (formData.get("workoutName") as string) || null;
    }

    const existingWorkout = await prisma.workout.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    if (existingWorkout) {
      if (wantsJson) {
        return NextResponse.json(existingWorkout);
      }
      return NextResponse.redirect(new URL(`/workout/${existingWorkout.id}`, request.url));
    }

    // For custom workouts, use workoutName as programDay for display
    const workout = await prisma.workout.create({
      data: {
        userId,
        programKey: programKey || null,
        programDay: programDay || workoutName || null,
      },
    });

    if (wantsJson) {
      return NextResponse.json(workout);
    }
    return NextResponse.redirect(new URL(`/workout/${workout.id}`, request.url));
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: {
        sets: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
