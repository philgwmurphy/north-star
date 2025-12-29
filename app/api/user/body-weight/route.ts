import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const bodyWeights = await prisma.bodyWeight.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json(bodyWeights);
  } catch (error) {
    console.error("Error fetching body weights:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight, notes } = await request.json();

    if (!weight || typeof weight !== "number") {
      return NextResponse.json({ error: "Weight is required" }, { status: 400 });
    }

    // Get user's preferred unit
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const unit = settings?.weightUnit || "lbs";

    const entry = await prisma.bodyWeight.create({
      data: {
        userId,
        weight,
        unit,
        notes,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error saving body weight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
