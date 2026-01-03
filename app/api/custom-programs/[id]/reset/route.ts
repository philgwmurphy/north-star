import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    const program = await prisma.customProgram.update({
      where: { id, userId },
      data: { currentWeek: 1 },
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

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error resetting custom program:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
