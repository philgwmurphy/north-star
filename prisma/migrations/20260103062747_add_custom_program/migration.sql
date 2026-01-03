CREATE TABLE "CustomProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "weeks" INTEGER NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomProgram_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomProgram_userId_idx" ON "CustomProgram"("userId");

CREATE INDEX "CustomProgram_templateId_idx" ON "CustomProgram"("templateId");

ALTER TABLE "CustomProgram"
ADD CONSTRAINT "CustomProgram_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomProgram"
ADD CONSTRAINT "CustomProgram_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
