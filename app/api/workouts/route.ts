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
    let templateWorkoutId: string | null = null;
    let templateId: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      programKey = body.programKey || null;
      programDay = body.programDay || null;
      workoutName = body.workoutName || null;
      templateWorkoutId = body.templateWorkoutId || null;
      templateId = body.templateId || null;
    } else {
      const formData = await request.formData();
      programKey = (formData.get("programKey") as string) || null;
      programDay = (formData.get("programDay") as string) || null;
      workoutName = (formData.get("workoutName") as string) || null;
      templateWorkoutId = (formData.get("templateWorkoutId") as string) || null;
      templateId = (formData.get("templateId") as string) || null;
    }

    let templateWorkout: { programDay: string | null } | null = null;

    if (templateWorkoutId) {
      templateWorkout = await prisma.workout.findFirst({
        where: {
          id: templateWorkoutId,
          userId,
          programKey: null,
        },
        select: {
          programDay: true,
        },
      });

      if (!templateWorkout) {
        return NextResponse.json({ error: "Template workout not found" }, { status: 404 });
      }
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
        return NextResponse.json({ ...existingWorkout, resumed: true });
      }
      return NextResponse.redirect(new URL(`/workout/${existingWorkout.id}`, request.url));
    }

    let resolvedTemplateId: string | null = null;
    let resolvedProgramDay: string | null = programDay || workoutName || templateWorkout?.programDay || null;

    if (templateId) {
      const template = await prisma.workoutTemplate.findFirst({
        where: { id: templateId, userId },
        select: { id: true, name: true },
      });

      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      resolvedTemplateId = template.id;
      resolvedProgramDay = template.name;
    }

    // For custom workouts, use workoutName as programDay for display
    const workout = await prisma.workout.create({
      data: {
        userId,
        programKey: programKey || null,
        programDay: resolvedProgramDay,
        templateId: resolvedTemplateId,
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
