import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repMaxes = await request.json();

    // Upsert each rep max
    const results = await Promise.all(
      repMaxes.map(
        (rm: { exercise: string; weight: number; reps: number; oneRM: number }) =>
          prisma.repMax.upsert({
            where: {
              userId_exercise: {
                userId,
                exercise: rm.exercise,
              },
            },
            update: {
              weight: rm.weight,
              reps: rm.reps,
              oneRM: rm.oneRM,
            },
            create: {
              userId,
              exercise: rm.exercise,
              weight: rm.weight,
              reps: rm.reps,
              oneRM: rm.oneRM,
            },
          })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error saving rep maxes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repMaxes = await prisma.repMax.findMany({
      where: { userId },
    });

    return NextResponse.json(repMaxes);
  } catch (error) {
    console.error("Error fetching rep maxes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
