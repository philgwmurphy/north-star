import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type TemplateExerciseSet = {
  weight: number;
  reps: number;
  durationSeconds?: number | null;
};

type TemplateExercise = {
  name: string;
  sets: TemplateExerciseSet[];
};

type ProgressionRule = {
  name: string;
  baseWeight?: number | null;
  increment?: number | null;
};

const normalizeTemplateExercises = (raw: unknown): TemplateExercise[] => {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((exercise) => {
    if (typeof exercise === "string") {
      const trimmed = exercise.trim();
      return trimmed ? [{ name: trimmed, sets: [] }] : [];
    }
    if (exercise && typeof exercise === "object" && "name" in exercise) {
      const name = String((exercise as { name?: string }).name || "").trim();
      if (!name) return [];
      const sets = Array.isArray((exercise as { sets?: TemplateExerciseSet[] }).sets)
        ? ((exercise as { sets?: TemplateExerciseSet[] }).sets as TemplateExerciseSet[])
        : [];
      return [{ name, sets }];
    }
    return [];
  });
};

const buildProgressedExercises = (
  exercises: TemplateExercise[],
  rules: ProgressionRule[],
  week: number
) => {
  const ruleMap = new Map(
    rules.map((rule) => [rule.name.toLowerCase(), rule])
  );

  return exercises.map((exercise) => {
    const rule = ruleMap.get(exercise.name.toLowerCase());
    const increment = rule?.increment ?? 0;
    const baseOverride = rule?.baseWeight !== null && rule?.baseWeight !== undefined
      ? Number(rule?.baseWeight)
      : null;
    const hasBase = Number.isFinite(baseOverride);

    const sets = exercise.sets.map((set) => {
      if (set.durationSeconds) {
        return set;
      }

      const baseWeight = hasBase ? (baseOverride as number) : set.weight;
      const shouldProgress = increment !== 0 && (hasBase || baseWeight > 0);
      const nextWeight = shouldProgress ? baseWeight + increment * (week - 1) : baseWeight;

      return {
        ...set,
        weight: Number.isFinite(nextWeight) ? nextWeight : set.weight,
      };
    });

    return {
      ...exercise,
      sets,
    };
  });
};

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

    const program = await prisma.customProgram.findFirst({
      where: { id, userId },
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

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (program.currentWeek > program.weeks) {
      return NextResponse.json({ error: "Program complete" }, { status: 400 });
    }

    const week = program.currentWeek;
    const baseExercises = normalizeTemplateExercises(program.template.exercises);
    const rules = Array.isArray(program.rules) ? (program.rules as ProgressionRule[]) : [];
    const progressedExercises = buildProgressedExercises(baseExercises, rules, week);

    const templateName = `${program.name} - Week ${week}`;
    const workoutName = `${program.name} • Week ${week}`;

    const workout = await prisma.$transaction(async (tx) => {
      const template = await tx.workoutTemplate.create({
        data: {
          userId,
          name: templateName,
          exercises: progressedExercises,
        },
      });

      const createdWorkout = await tx.workout.create({
        data: {
          userId,
          programKey: null,
          programDay: workoutName,
          templateId: template.id,
        },
      });

      await tx.customProgram.update({
        where: { id },
        data: { currentWeek: program.currentWeek + 1 },
      });

      return createdWorkout;
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error starting custom program week:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
