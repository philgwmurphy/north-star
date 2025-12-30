import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
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
      where: {
        id,
        userId,
      },
      include: {
        sets: {
          orderBy: { completedAt: "asc" },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data: {
      completedAt?: Date | null;
      notes?: string | null;
      programDay?: string | null;
    } = {};

    if (Object.prototype.hasOwnProperty.call(body, "completedAt")) {
      if (body.completedAt === null) {
        data.completedAt = null;
      } else if (typeof body.completedAt === "string") {
        const parsed = new Date(body.completedAt);
        if (!Number.isNaN(parsed.getTime())) {
          data.completedAt = parsed;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "notes")) {
      if (body.notes === null) {
        data.notes = null;
      } else if (typeof body.notes === "string") {
        data.notes = body.notes.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "programDay")) {
      if (body.programDay === null) {
        data.programDay = null;
      } else if (typeof body.programDay === "string") {
        const trimmed = body.programDay.trim();
        data.programDay = trimmed === "" ? null : trimmed;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const workout = await prisma.workout.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        sets: {
          orderBy: { completedAt: "asc" },
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.workout.delete({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
