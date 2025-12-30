import { exercises, cardioExercises } from "@/lib/exercises";

export interface RecoverySet {
  exercise: string;
  weight: number;
  reps: number;
  durationSeconds?: number | null;
  completedAt: Date;
  workoutId: string;
}

export interface RecoveryScore {
  category: string;
  score: number;
  lastTrainedAt: Date;
}

const exerciseCategoryMap = new Map<string, string>();

for (const exercise of exercises) {
  exerciseCategoryMap.set(exercise.name.toLowerCase(), exercise.category);
}
for (const exercise of cardioExercises) {
  exerciseCategoryMap.set(exercise.name.toLowerCase(), "Cardio");
}

function getCategoryForExercise(name: string) {
  return exerciseCategoryMap.get(name.toLowerCase()) || "Other";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function computeRecoveryScores(sets: RecoverySet[]): RecoveryScore[] {
  const latestByCategory = new Map<string, { lastAt: Date; workoutId: string }>();
  const loadByCategoryWorkout = new Map<string, number>();

  for (const set of sets) {
    const category = getCategoryForExercise(set.exercise);
    const key = `${category}:${set.workoutId}`;
    const volume = set.weight * set.reps;
    const durationMinutes = set.durationSeconds ? set.durationSeconds / 60 : 0;
    const load = volume + durationMinutes * 10;
    loadByCategoryWorkout.set(key, (loadByCategoryWorkout.get(key) || 0) + load);

    const existing = latestByCategory.get(category);
    if (!existing || set.completedAt > existing.lastAt) {
      latestByCategory.set(category, { lastAt: set.completedAt, workoutId: set.workoutId });
    }
  }

  const now = Date.now();
  const scores: RecoveryScore[] = [];

  for (const [category, info] of latestByCategory.entries()) {
    const hoursSince = Math.max(0, (now - info.lastAt.getTime()) / 3600000);
    const load = loadByCategoryWorkout.get(`${category}:${info.workoutId}`) || 0;
    const fatigue = clamp(Math.round(Math.log10(load + 1) * 30), 15, 80);
    const score = Math.round(100 - fatigue * Math.exp(-hoursSince / 36));
    scores.push({
      category,
      score: clamp(score, 0, 100),
      lastTrainedAt: info.lastAt,
    });
  }

  return scores.sort((a, b) => a.score - b.score);
}
