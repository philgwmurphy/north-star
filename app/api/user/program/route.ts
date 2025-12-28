import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { programKey } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        selectedProgram: programKey,
        currentWeek: 1, // Reset to week 1 when changing programs
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error saving program:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
