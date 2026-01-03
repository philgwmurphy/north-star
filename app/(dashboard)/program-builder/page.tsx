import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProgramBuilderClient } from "@/components/workout/program-builder-client";

async function getTemplates(userId: string) {
  return await prisma.workoutTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      exercises: true,
    },
  });
}

async function getPrograms(userId: string) {
  return await prisma.customProgram.findMany({
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
}

export default async function ProgramBuilderPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [templates, programs] = await Promise.all([
    getTemplates(userId),
    getPrograms(userId),
  ]);

  return (
    <ProgramBuilderClient
      templates={templates}
      programs={programs}
    />
  );
}
