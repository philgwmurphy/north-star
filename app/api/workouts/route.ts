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
    let programKey: string;
    let programDay: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      programKey = body.programKey;
      programDay = body.programDay;
    } else {
      const formData = await request.formData();
      programKey = formData.get("programKey") as string;
      programDay = formData.get("programDay") as string;
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

    const workout = await prisma.workout.create({
      data: {
        userId,
        programKey,
        programDay,
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
