ALTER TABLE "Workout" ADD COLUMN "templateId" TEXT;

ALTER TABLE "Workout"
ADD CONSTRAINT "Workout_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Workout_templateId_idx" ON "Workout"("templateId");
