import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const programs = await prisma.customProgram.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            exercises: true,
          },
        },
      },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching custom programs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, templateId, weeks, rules } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ error: "Template is required" }, { status: 400 });
    }

    if (![4, 8, 12].includes(Number(weeks))) {
      return NextResponse.json({ error: "Weeks must be 4, 8, or 12" }, { status: 400 });
    }

    const template = await prisma.workoutTemplate.findFirst({
      where: { id: templateId, userId },
      select: { id: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const program = await prisma.customProgram.create({
      data: {
        userId,
        name: name.trim(),
        templateId,
        weeks: Number(weeks),
        rules: Array.isArray(rules) ? rules : [],
      },
      include: {
        template: {
          select: { id: true, name: true, exercises: true },
        },
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error creating custom program:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
