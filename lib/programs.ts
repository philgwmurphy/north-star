import { roundWeight } from "./utils";

export interface RepMaxes {
  squat: number;
  bench: number;
  deadlift: number;
  ohp: number;
}

export interface WorkoutSet {
  weight: number | string;
  reps: number | string;
}

export interface Exercise {
  name: string;
  sets: WorkoutSet[] | string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Program {
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  cycleLength: string;
  description: string;
  hasWeeks?: boolean;
  totalWeeks?: number;
  getWorkouts: (maxes: RepMaxes, week?: number) => WorkoutDay[];
}

export const programs: Record<string, Program> = {
  "531": {
    name: "Wendler's 5/3/1",
    level: "intermediate",
    daysPerWeek: 4,
    cycleLength: "4 weeks",
    hasWeeks: true,
    totalWeeks: 4,
    description:
      "The classic periodized strength program. Slow, steady progress with built-in deload weeks. Uses training maxes at 90% for sustainable gains.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: roundWeight(maxes.squat * 0.9),
        bench: roundWeight(maxes.bench * 0.9),
        deadlift: roundWeight(maxes.deadlift * 0.9),
        ohp: roundWeight(maxes.ohp * 0.9),
      };

      const schemes: Record<number, { name: string; pcts: number[]; reps: (number | string)[] }> = {
        1: { name: "5/5/5+", pcts: [0.65, 0.75, 0.85], reps: [5, 5, "5+"] },
        2: { name: "3/3/3+", pcts: [0.7, 0.8, 0.9], reps: [3, 3, "3+"] },
        3: { name: "5/3/1+", pcts: [0.75, 0.85, 0.95], reps: [5, 3, "1+"] },
        4: { name: "Deload", pcts: [0.4, 0.5, 0.6], reps: [5, 5, 5] },
      };

      const s = schemes[week];

      return [
        {
          day: "Day 1",
          focus: "Squat",
          exercises: [
            {
              name: "Squat",
              sets: s.pcts.map((p, i) => ({
                weight: roundWeight(tm.squat * p),
                reps: s.reps[i],
              })),
            },
            { name: "Leg Press", sets: "3x10" },
            { name: "Leg Curls", sets: "3x10" },
          ],
        },
        {
          day: "Day 2",
          focus: "Bench",
          exercises: [
            {
              name: "Bench Press",
              sets: s.pcts.map((p, i) => ({
                weight: roundWeight(tm.bench * p),
                reps: s.reps[i],
              })),
            },
            { name: "Dumbbell Row", sets: "5x10" },
            { name: "Tricep Pushdowns", sets: "3x15" },
          ],
        },
        {
          day: "Day 3",
          focus: "Deadlift",
          exercises: [
            {
              name: "Deadlift",
              sets: s.pcts.map((p, i) => ({
                weight: roundWeight(tm.deadlift * p),
                reps: s.reps[i],
              })),
            },
            { name: "Good Mornings", sets: "3x10" },
            { name: "Hanging Leg Raises", sets: "3x15" },
          ],
        },
        {
          day: "Day 4",
          focus: "OHP",
          exercises: [
            {
              name: "Overhead Press",
              sets: s.pcts.map((p, i) => ({
                weight: roundWeight(tm.ohp * p),
                reps: s.reps[i],
              })),
            },
            { name: "Chin-ups", sets: "5x5" },
            { name: "Face Pulls", sets: "3x20" },
          ],
        },
      ];
    },
  },

  nsuns: {
    name: "nSuns 5/3/1 LP",
    level: "intermediate",
    daysPerWeek: 5,
    cycleLength: "1 week",
    description:
      "High volume linear progression based on 5/3/1. Weekly weight increases based on AMRAP performance.",
    getWorkouts: (maxes: RepMaxes): WorkoutDay[] => {
      const tm = {
        squat: roundWeight(maxes.squat * 0.9),
        bench: roundWeight(maxes.bench * 0.9),
        deadlift: roundWeight(maxes.deadlift * 0.9),
        ohp: roundWeight(maxes.ohp * 0.9),
      };

      return [
        {
          day: "Monday",
          focus: "Bench/OHP",
          exercises: [
            {
              name: "Bench (T1)",
              sets: [
                { weight: roundWeight(tm.bench * 0.75), reps: 5 },
                { weight: roundWeight(tm.bench * 0.85), reps: 3 },
                { weight: roundWeight(tm.bench * 0.95), reps: "1+" },
                { weight: roundWeight(tm.bench * 0.9), reps: 3 },
                { weight: roundWeight(tm.bench * 0.85), reps: 3 },
                { weight: roundWeight(tm.bench * 0.8), reps: 3 },
                { weight: roundWeight(tm.bench * 0.75), reps: 5 },
                { weight: roundWeight(tm.bench * 0.7), reps: 5 },
                { weight: roundWeight(tm.bench * 0.65), reps: "5+" },
              ],
            },
            { name: "OHP (T2)", sets: "8 sets @ 50-70%" },
          ],
        },
        {
          day: "Tuesday",
          focus: "Squat/Sumo",
          exercises: [
            {
              name: "Squat (T1)",
              sets: [
                { weight: roundWeight(tm.squat * 0.75), reps: 5 },
                { weight: roundWeight(tm.squat * 0.85), reps: 3 },
                { weight: roundWeight(tm.squat * 0.95), reps: "1+" },
                { weight: roundWeight(tm.squat * 0.9), reps: 3 },
                { weight: roundWeight(tm.squat * 0.85), reps: 3 },
                { weight: roundWeight(tm.squat * 0.8), reps: 3 },
                { weight: roundWeight(tm.squat * 0.75), reps: 5 },
                { weight: roundWeight(tm.squat * 0.7), reps: 5 },
                { weight: roundWeight(tm.squat * 0.65), reps: "5+" },
              ],
            },
            { name: "Sumo DL (T2)", sets: "8 sets @ 50-70%" },
          ],
        },
        {
          day: "Wednesday",
          focus: "OHP/Incline",
          exercises: [
            {
              name: "OHP (T1)",
              sets: [
                { weight: roundWeight(tm.ohp * 0.75), reps: 5 },
                { weight: roundWeight(tm.ohp * 0.85), reps: 3 },
                { weight: roundWeight(tm.ohp * 0.95), reps: "1+" },
                { weight: roundWeight(tm.ohp * 0.9), reps: 3 },
                { weight: roundWeight(tm.ohp * 0.85), reps: 5 },
                { weight: roundWeight(tm.ohp * 0.8), reps: 3 },
                { weight: roundWeight(tm.ohp * 0.75), reps: 5 },
                { weight: roundWeight(tm.ohp * 0.7), reps: 3 },
                { weight: roundWeight(tm.ohp * 0.65), reps: "5+" },
              ],
            },
            { name: "Incline Bench (T2)", sets: "8 sets @ 50-70%" },
          ],
        },
        {
          day: "Thursday",
          focus: "Deadlift/FS",
          exercises: [
            {
              name: "Deadlift (T1)",
              sets: [
                { weight: roundWeight(tm.deadlift * 0.75), reps: 5 },
                { weight: roundWeight(tm.deadlift * 0.85), reps: 3 },
                { weight: roundWeight(tm.deadlift * 0.95), reps: "1+" },
                { weight: roundWeight(tm.deadlift * 0.9), reps: 3 },
                { weight: roundWeight(tm.deadlift * 0.85), reps: 3 },
                { weight: roundWeight(tm.deadlift * 0.8), reps: 3 },
                { weight: roundWeight(tm.deadlift * 0.75), reps: 3 },
                { weight: roundWeight(tm.deadlift * 0.7), reps: "3+" },
              ],
            },
            { name: "Front Squat (T2)", sets: "5 sets @ 55-70%" },
          ],
        },
        {
          day: "Friday",
          focus: "Bench/CG",
          exercises: [
            {
              name: "Bench (T1)",
              sets: [
                { weight: roundWeight(tm.bench * 0.75), reps: 5 },
                { weight: roundWeight(tm.bench * 0.825), reps: 3 },
                { weight: roundWeight(tm.bench * 0.9), reps: "1+" },
                { weight: roundWeight(tm.bench * 0.9), reps: 3 },
                { weight: roundWeight(tm.bench * 0.9), reps: 3 },
                { weight: roundWeight(tm.bench * 0.85), reps: 3 },
                { weight: roundWeight(tm.bench * 0.8), reps: 5 },
                { weight: roundWeight(tm.bench * 0.75), reps: 5 },
                { weight: roundWeight(tm.bench * 0.7), reps: "5+" },
              ],
            },
            { name: "Close Grip Bench (T2)", sets: "8 sets @ 50-65%" },
          ],
        },
      ];
    },
  },

  sl5x5: {
    name: "StrongLifts 5x5",
    level: "beginner",
    daysPerWeek: 3,
    cycleLength: "1 week",
    description:
      "The quintessential beginner program. Simple, effective, builds foundation. Add 5 lbs every successful workout.",
    getWorkouts: (maxes: RepMaxes): WorkoutDay[] => {
      const w = {
        squat: roundWeight(maxes.squat * 0.5),
        bench: roundWeight(maxes.bench * 0.5),
        row: roundWeight(maxes.bench * 0.5),
        ohp: roundWeight(maxes.ohp * 0.5),
        deadlift: roundWeight(maxes.deadlift * 0.5),
      };

      return [
        {
          day: "Workout A",
          focus: "Squat/Bench/Row",
          exercises: [
            {
              name: "Squat",
              sets: Array(5).fill({ weight: w.squat, reps: 5 }),
            },
            {
              name: "Bench Press",
              sets: Array(5).fill({ weight: w.bench, reps: 5 }),
            },
            {
              name: "Barbell Row",
              sets: Array(5).fill({ weight: w.row, reps: 5 }),
            },
          ],
        },
        {
          day: "Workout B",
          focus: "Squat/OHP/DL",
          exercises: [
            {
              name: "Squat",
              sets: Array(5).fill({ weight: w.squat, reps: 5 }),
            },
            {
              name: "Overhead Press",
              sets: Array(5).fill({ weight: w.ohp, reps: 5 }),
            },
            {
              name: "Deadlift",
              sets: [{ weight: w.deadlift, reps: 5 }],
            },
          ],
        },
      ];
    },
  },

  gzclp: {
    name: "GZCLP",
    level: "beginner",
    daysPerWeek: 4,
    cycleLength: "1 week",
    description:
      "Cody Lefever's beginner GZCL. Balances strength and hypertrophy with T1/T2/T3 exercise tiers.",
    getWorkouts: (maxes: RepMaxes): WorkoutDay[] => {
      const tm = {
        squat: roundWeight(maxes.squat * 0.85),
        bench: roundWeight(maxes.bench * 0.85),
        deadlift: roundWeight(maxes.deadlift * 0.85),
        ohp: roundWeight(maxes.ohp * 0.85),
      };

      return [
        {
          day: "Day 1",
          focus: "Squat/Bench",
          exercises: [
            {
              name: "Squat (T1)",
              sets: [
                { weight: tm.squat, reps: 3 },
                { weight: tm.squat, reps: 3 },
                { weight: tm.squat, reps: 3 },
                { weight: tm.squat, reps: 3 },
                { weight: tm.squat, reps: "3+" },
              ],
            },
            {
              name: "Bench (T2)",
              sets: [
                { weight: roundWeight(tm.bench * 0.65), reps: 10 },
                { weight: roundWeight(tm.bench * 0.65), reps: 10 },
                { weight: roundWeight(tm.bench * 0.65), reps: 10 },
              ],
            },
            { name: "Lat Pulldown (T3)", sets: "3x15+" },
          ],
        },
        {
          day: "Day 2",
          focus: "OHP/Deadlift",
          exercises: [
            {
              name: "OHP (T1)",
              sets: [
                { weight: tm.ohp, reps: 3 },
                { weight: tm.ohp, reps: 3 },
                { weight: tm.ohp, reps: 3 },
                { weight: tm.ohp, reps: 3 },
                { weight: tm.ohp, reps: "3+" },
              ],
            },
            {
              name: "Deadlift (T2)",
              sets: [
                { weight: roundWeight(tm.deadlift * 0.65), reps: 10 },
                { weight: roundWeight(tm.deadlift * 0.65), reps: 10 },
                { weight: roundWeight(tm.deadlift * 0.65), reps: 10 },
              ],
            },
            { name: "Dumbbell Row (T3)", sets: "3x15+" },
          ],
        },
        {
          day: "Day 3",
          focus: "Bench/Squat",
          exercises: [
            {
              name: "Bench (T1)",
              sets: [
                { weight: tm.bench, reps: 3 },
                { weight: tm.bench, reps: 3 },
                { weight: tm.bench, reps: 3 },
                { weight: tm.bench, reps: 3 },
                { weight: tm.bench, reps: "3+" },
              ],
            },
            {
              name: "Squat (T2)",
              sets: [
                { weight: roundWeight(tm.squat * 0.65), reps: 10 },
                { weight: roundWeight(tm.squat * 0.65), reps: 10 },
                { weight: roundWeight(tm.squat * 0.65), reps: 10 },
              ],
            },
            { name: "Lat Pulldown (T3)", sets: "3x15+" },
          ],
        },
        {
          day: "Day 4",
          focus: "Deadlift/OHP",
          exercises: [
            {
              name: "Deadlift (T1)",
              sets: [
                { weight: tm.deadlift, reps: 3 },
                { weight: tm.deadlift, reps: 3 },
                { weight: tm.deadlift, reps: 3 },
                { weight: tm.deadlift, reps: 3 },
                { weight: tm.deadlift, reps: "3+" },
              ],
            },
            {
              name: "OHP (T2)",
              sets: [
                { weight: roundWeight(tm.ohp * 0.65), reps: 10 },
                { weight: roundWeight(tm.ohp * 0.65), reps: 10 },
                { weight: roundWeight(tm.ohp * 0.65), reps: 10 },
              ],
            },
            { name: "Dumbbell Row (T3)", sets: "3x15+" },
          ],
        },
      ];
    },
  },

  texas: {
    name: "Texas Method",
    level: "intermediate",
    daysPerWeek: 3,
    cycleLength: "1 week",
    description:
      "Volume day, recovery day, intensity day. Perfect for those who stalled on LP but want weekly PRs.",
    getWorkouts: (maxes: RepMaxes): WorkoutDay[] => {
      const w = {
        squat: roundWeight(maxes.squat * 0.9),
        bench: roundWeight(maxes.bench * 0.9),
        deadlift: roundWeight(maxes.deadlift * 0.9),
      };

      return [
        {
          day: "Monday",
          focus: "Volume Day",
          exercises: [
            {
              name: "Squat",
              sets: Array(5).fill({ weight: roundWeight(w.squat * 0.9), reps: 5 }),
            },
            {
              name: "Bench Press",
              sets: Array(5).fill({ weight: roundWeight(w.bench * 0.9), reps: 5 }),
            },
            { name: "Barbell Row", sets: "3x5" },
          ],
        },
        {
          day: "Wednesday",
          focus: "Recovery Day",
          exercises: [
            {
              name: "Squat",
              sets: [
                { weight: roundWeight(w.squat * 0.8), reps: 5 },
                { weight: roundWeight(w.squat * 0.8), reps: 5 },
              ],
            },
            {
              name: "Overhead Press",
              sets: [
                { weight: roundWeight(w.bench * 0.6), reps: 5 },
                { weight: roundWeight(w.bench * 0.6), reps: 5 },
                { weight: roundWeight(w.bench * 0.6), reps: 5 },
              ],
            },
            { name: "Chin-ups", sets: "3x max" },
            { name: "Back Extensions", sets: "5x10" },
          ],
        },
        {
          day: "Friday",
          focus: "Intensity Day",
          exercises: [
            {
              name: "Squat",
              sets: [{ weight: w.squat, reps: 5 }],
            },
            {
              name: "Bench Press",
              sets: [{ weight: w.bench, reps: 5 }],
            },
            {
              name: "Deadlift",
              sets: [{ weight: w.deadlift, reps: 5 }],
            },
          ],
        },
      ];
    },
  },

  greyskull: {
    name: "Greyskull LP",
    level: "beginner",
    daysPerWeek: 3,
    cycleLength: "1 week",
    description:
      "Linear progression with AMRAP final sets. Reset at 90% after stalls. Great for flexible beginners.",
    getWorkouts: (maxes: RepMaxes): WorkoutDay[] => {
      const w = {
        squat: roundWeight(maxes.squat * 0.65),
        bench: roundWeight(maxes.bench * 0.65),
        ohp: roundWeight(maxes.ohp * 0.65),
        deadlift: roundWeight(maxes.deadlift * 0.65),
        row: roundWeight(maxes.bench * 0.65),
      };

      return [
        {
          day: "Workout A",
          focus: "Bench/Row/Squat",
          exercises: [
            {
              name: "Bench Press",
              sets: [
                { weight: w.bench, reps: 5 },
                { weight: w.bench, reps: 5 },
                { weight: w.bench, reps: "5+" },
              ],
            },
            {
              name: "Barbell Row",
              sets: [
                { weight: w.row, reps: 5 },
                { weight: w.row, reps: 5 },
                { weight: w.row, reps: "5+" },
              ],
            },
            {
              name: "Squat",
              sets: [
                { weight: w.squat, reps: 5 },
                { weight: w.squat, reps: 5 },
                { weight: w.squat, reps: "5+" },
              ],
            },
          ],
        },
        {
          day: "Workout B",
          focus: "OHP/Chin-ups/Deadlift",
          exercises: [
            {
              name: "Overhead Press",
              sets: [
                { weight: w.ohp, reps: 5 },
                { weight: w.ohp, reps: 5 },
                { weight: w.ohp, reps: "5+" },
              ],
            },
            {
              name: "Chin-ups",
              sets: [
                { weight: "BW", reps: 5 },
                { weight: "BW", reps: 5 },
                { weight: "BW", reps: "5+" },
              ],
            },
            {
              name: "Deadlift",
              sets: [{ weight: w.deadlift, reps: "5+" }],
            },
          ],
        },
      ];
    },
  },

  // ADVANCED PROGRAMS

  "531bbb": {
    name: "5/3/1 Boring But Big",
    level: "intermediate",
    daysPerWeek: 4,
    cycleLength: "4 weeks",
    hasWeeks: true,
    totalWeeks: 4,
    description:
      "Wendler's high-volume variant. Main 5/3/1 work followed by 5x10 at 50-60% for serious mass and strength gains.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: roundWeight(maxes.squat * 0.9),
        bench: roundWeight(maxes.bench * 0.9),
        deadlift: roundWeight(maxes.deadlift * 0.9),
        ohp: roundWeight(maxes.ohp * 0.9),
      };

      const schemes: Record<number, { pcts: number[]; reps: (number | string)[] }> = {
        1: { pcts: [0.65, 0.75, 0.85], reps: [5, 5, "5+"] },
        2: { pcts: [0.7, 0.8, 0.9], reps: [3, 3, "3+"] },
        3: { pcts: [0.75, 0.85, 0.95], reps: [5, 3, "1+"] },
        4: { pcts: [0.4, 0.5, 0.6], reps: [5, 5, 5] },
      };

      const s = schemes[week];
      const bbbPct = week === 4 ? 0.4 : 0.5;

      return [
        {
          day: "Day 1",
          focus: "Squat",
          exercises: [
            {
              name: "Squat",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.squat * p), reps: s.reps[i] })),
            },
            {
              name: "Squat (BBB)",
              sets: Array(5).fill({ weight: roundWeight(tm.squat * bbbPct), reps: 10 }),
            },
            { name: "Leg Curls", sets: "5x10" },
          ],
        },
        {
          day: "Day 2",
          focus: "Bench",
          exercises: [
            {
              name: "Bench Press",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.bench * p), reps: s.reps[i] })),
            },
            {
              name: "Bench Press (BBB)",
              sets: Array(5).fill({ weight: roundWeight(tm.bench * bbbPct), reps: 10 }),
            },
            { name: "Dumbbell Row", sets: "5x10" },
          ],
        },
        {
          day: "Day 3",
          focus: "Deadlift",
          exercises: [
            {
              name: "Deadlift",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.deadlift * p), reps: s.reps[i] })),
            },
            {
              name: "Deadlift (BBB)",
              sets: Array(5).fill({ weight: roundWeight(tm.deadlift * bbbPct), reps: 10 }),
            },
            { name: "Hanging Leg Raises", sets: "5x15" },
          ],
        },
        {
          day: "Day 4",
          focus: "OHP",
          exercises: [
            {
              name: "Overhead Press",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.ohp * p), reps: s.reps[i] })),
            },
            {
              name: "Overhead Press (BBB)",
              sets: Array(5).fill({ weight: roundWeight(tm.ohp * bbbPct), reps: 10 }),
            },
            { name: "Chin-ups", sets: "5x10" },
          ],
        },
      ];
    },
  },

  "531fsl": {
    name: "5/3/1 First Set Last",
    level: "intermediate",
    daysPerWeek: 4,
    cycleLength: "4 weeks",
    hasWeeks: true,
    totalWeeks: 4,
    description:
      "After main 5/3/1 sets, repeat the first working set for additional volume. Great for building work capacity.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: roundWeight(maxes.squat * 0.9),
        bench: roundWeight(maxes.bench * 0.9),
        deadlift: roundWeight(maxes.deadlift * 0.9),
        ohp: roundWeight(maxes.ohp * 0.9),
      };

      const schemes: Record<number, { pcts: number[]; reps: (number | string)[]; fslPct: number }> = {
        1: { pcts: [0.65, 0.75, 0.85], reps: [5, 5, "5+"], fslPct: 0.65 },
        2: { pcts: [0.7, 0.8, 0.9], reps: [3, 3, "3+"], fslPct: 0.7 },
        3: { pcts: [0.75, 0.85, 0.95], reps: [5, 3, "1+"], fslPct: 0.75 },
        4: { pcts: [0.4, 0.5, 0.6], reps: [5, 5, 5], fslPct: 0.4 },
      };

      const s = schemes[week];

      return [
        {
          day: "Day 1",
          focus: "Squat",
          exercises: [
            {
              name: "Squat",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.squat * p), reps: s.reps[i] })),
            },
            {
              name: "Squat (FSL)",
              sets: Array(5).fill({ weight: roundWeight(tm.squat * s.fslPct), reps: 5 }),
            },
            { name: "Leg Press", sets: "3x10" },
            { name: "Leg Curls", sets: "3x10" },
          ],
        },
        {
          day: "Day 2",
          focus: "Bench",
          exercises: [
            {
              name: "Bench Press",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.bench * p), reps: s.reps[i] })),
            },
            {
              name: "Bench Press (FSL)",
              sets: Array(5).fill({ weight: roundWeight(tm.bench * s.fslPct), reps: 5 }),
            },
            { name: "Dumbbell Row", sets: "5x10" },
            { name: "Tricep Pushdowns", sets: "3x15" },
          ],
        },
        {
          day: "Day 3",
          focus: "Deadlift",
          exercises: [
            {
              name: "Deadlift",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.deadlift * p), reps: s.reps[i] })),
            },
            {
              name: "Deadlift (FSL)",
              sets: Array(5).fill({ weight: roundWeight(tm.deadlift * s.fslPct), reps: 5 }),
            },
            { name: "Good Mornings", sets: "3x10" },
            { name: "Ab Wheel", sets: "3x15" },
          ],
        },
        {
          day: "Day 4",
          focus: "OHP",
          exercises: [
            {
              name: "Overhead Press",
              sets: s.pcts.map((p, i) => ({ weight: roundWeight(tm.ohp * p), reps: s.reps[i] })),
            },
            {
              name: "Overhead Press (FSL)",
              sets: Array(5).fill({ weight: roundWeight(tm.ohp * s.fslPct), reps: 5 }),
            },
            { name: "Chin-ups", sets: "5x5" },
            { name: "Face Pulls", sets: "3x20" },
          ],
        },
      ];
    },
  },

  smolovJr: {
    name: "Smolov Jr",
    level: "advanced",
    daysPerWeek: 4,
    cycleLength: "3 weeks",
    hasWeeks: true,
    totalWeeks: 3,
    description:
      "Intense 3-week peaking program. High frequency, high volume. Best used for bench or squat specialization.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      // Smolov Jr uses current max, adds weight each week
      const baseMax = maxes.bench; // Can be used for bench or squat
      const weeklyAdd = (week - 1) * 10; // Add 10lbs each week

      const day1Pct = 0.7;
      const day2Pct = 0.75;
      const day3Pct = 0.8;
      const day4Pct = 0.85;

      return [
        {
          day: "Day 1",
          focus: "6x6 @ 70%",
          exercises: [
            {
              name: "Bench Press",
              sets: Array(6).fill({ weight: roundWeight(baseMax * day1Pct) + weeklyAdd, reps: 6 }),
            },
            { name: "Dumbbell Row", sets: "4x8" },
            { name: "Face Pulls", sets: "3x15" },
          ],
        },
        {
          day: "Day 2",
          focus: "7x5 @ 75%",
          exercises: [
            {
              name: "Bench Press",
              sets: Array(7).fill({ weight: roundWeight(baseMax * day2Pct) + weeklyAdd, reps: 5 }),
            },
            { name: "Lat Pulldown", sets: "4x10" },
            { name: "Tricep Pushdowns", sets: "3x12" },
          ],
        },
        {
          day: "Day 3",
          focus: "8x4 @ 80%",
          exercises: [
            {
              name: "Bench Press",
              sets: Array(8).fill({ weight: roundWeight(baseMax * day3Pct) + weeklyAdd, reps: 4 }),
            },
            { name: "Seated Row", sets: "4x8" },
            { name: "Rear Delt Flyes", sets: "3x15" },
          ],
        },
        {
          day: "Day 4",
          focus: "10x3 @ 85%",
          exercises: [
            {
              name: "Bench Press",
              sets: Array(10).fill({ weight: roundWeight(baseMax * day4Pct) + weeklyAdd, reps: 3 }),
            },
            { name: "Pull-ups", sets: "4x max" },
            { name: "Bicep Curls", sets: "3x12" },
          ],
        },
      ];
    },
  },

  candito6week: {
    name: "Candito 6-Week",
    level: "advanced",
    daysPerWeek: 4,
    cycleLength: "6 weeks",
    hasWeeks: true,
    totalWeeks: 6,
    description:
      "Jonnie Candito's periodized program. Phases through hypertrophy, strength, and peaking for competition prep.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: maxes.squat,
        bench: maxes.bench,
        deadlift: maxes.deadlift,
      };

      // Week 1-2: Muscular Conditioning (hypertrophy)
      // Week 3-4: Strength
      // Week 5: Intensity
      // Week 6: Peaking

      if (week <= 2) {
        // Hypertrophy phase
        const pct = week === 1 ? 0.7 : 0.75;
        return [
          {
            day: "Day 1",
            focus: "Lower Hypertrophy",
            exercises: [
              { name: "Squat", sets: Array(6).fill({ weight: roundWeight(tm.squat * pct), reps: 8 }) },
              { name: "Romanian Deadlift", sets: "3x10" },
              { name: "Leg Press", sets: "3x12" },
              { name: "Leg Curls", sets: "3x12" },
            ],
          },
          {
            day: "Day 2",
            focus: "Upper Hypertrophy",
            exercises: [
              { name: "Bench Press", sets: Array(6).fill({ weight: roundWeight(tm.bench * pct), reps: 8 }) },
              { name: "Barbell Row", sets: "4x8" },
              { name: "Overhead Press", sets: "3x10" },
              { name: "Pull-ups", sets: "3x max" },
            ],
          },
          {
            day: "Day 3",
            focus: "Lower Power",
            exercises: [
              { name: "Squat", sets: Array(4).fill({ weight: roundWeight(tm.squat * (pct + 0.1)), reps: 6 }) },
              { name: "Deadlift", sets: Array(3).fill({ weight: roundWeight(tm.deadlift * pct), reps: 6 }) },
              { name: "Front Squat", sets: "3x8" },
            ],
          },
          {
            day: "Day 4",
            focus: "Upper Power",
            exercises: [
              { name: "Bench Press", sets: Array(4).fill({ weight: roundWeight(tm.bench * (pct + 0.1)), reps: 6 }) },
              { name: "Weighted Pull-ups", sets: "4x6" },
              { name: "Close Grip Bench", sets: "3x8" },
              { name: "Dumbbell Row", sets: "3x10" },
            ],
          },
        ];
      } else if (week <= 4) {
        // Strength phase
        const pct = week === 3 ? 0.8 : 0.85;
        return [
          {
            day: "Day 1",
            focus: "Lower Strength",
            exercises: [
              { name: "Squat", sets: Array(5).fill({ weight: roundWeight(tm.squat * pct), reps: 5 }) },
              { name: "Pause Squat", sets: "3x4" },
              { name: "Leg Curls", sets: "3x10" },
            ],
          },
          {
            day: "Day 2",
            focus: "Upper Strength",
            exercises: [
              { name: "Bench Press", sets: Array(5).fill({ weight: roundWeight(tm.bench * pct), reps: 5 }) },
              { name: "Barbell Row", sets: "5x5" },
              { name: "Close Grip Bench", sets: "3x6" },
            ],
          },
          {
            day: "Day 3",
            focus: "Deadlift Focus",
            exercises: [
              { name: "Deadlift", sets: Array(5).fill({ weight: roundWeight(tm.deadlift * pct), reps: 4 }) },
              { name: "Front Squat", sets: "3x5" },
              { name: "Good Mornings", sets: "3x8" },
            ],
          },
          {
            day: "Day 4",
            focus: "Upper Volume",
            exercises: [
              { name: "Bench Press", sets: Array(4).fill({ weight: roundWeight(tm.bench * (pct - 0.1)), reps: 6 }) },
              { name: "Weighted Pull-ups", sets: "5x5" },
              { name: "Overhead Press", sets: "3x8" },
            ],
          },
        ];
      } else if (week === 5) {
        // Intensity phase
        return [
          {
            day: "Day 1",
            focus: "Heavy Squat",
            exercises: [
              {
                name: "Squat",
                sets: [
                  { weight: roundWeight(tm.squat * 0.85), reps: 3 },
                  { weight: roundWeight(tm.squat * 0.9), reps: 2 },
                  { weight: roundWeight(tm.squat * 0.95), reps: 1 },
                ],
              },
              { name: "Pause Squat", sets: "2x3 @ 75%" },
            ],
          },
          {
            day: "Day 2",
            focus: "Heavy Bench",
            exercises: [
              {
                name: "Bench Press",
                sets: [
                  { weight: roundWeight(tm.bench * 0.85), reps: 3 },
                  { weight: roundWeight(tm.bench * 0.9), reps: 2 },
                  { weight: roundWeight(tm.bench * 0.95), reps: 1 },
                ],
              },
              { name: "Close Grip Bench", sets: "2x4 @ 75%" },
            ],
          },
          {
            day: "Day 3",
            focus: "Heavy Deadlift",
            exercises: [
              {
                name: "Deadlift",
                sets: [
                  { weight: roundWeight(tm.deadlift * 0.85), reps: 3 },
                  { weight: roundWeight(tm.deadlift * 0.9), reps: 2 },
                  { weight: roundWeight(tm.deadlift * 0.95), reps: 1 },
                ],
              },
              { name: "Front Squat", sets: "2x4 @ 70%" },
            ],
          },
          {
            day: "Day 4",
            focus: "Light Recovery",
            exercises: [
              { name: "Bench Press", sets: "3x5 @ 70%" },
              { name: "Barbell Row", sets: "3x8" },
              { name: "Face Pulls", sets: "3x15" },
            ],
          },
        ];
      } else {
        // Week 6: Peaking/Test
        return [
          {
            day: "Day 1",
            focus: "Squat Test",
            exercises: [
              {
                name: "Squat",
                sets: [
                  { weight: roundWeight(tm.squat * 0.7), reps: 3 },
                  { weight: roundWeight(tm.squat * 0.8), reps: 2 },
                  { weight: roundWeight(tm.squat * 0.9), reps: 1 },
                  { weight: roundWeight(tm.squat * 1.0), reps: "1" },
                  { weight: roundWeight(tm.squat * 1.025), reps: "1 PR" },
                ],
              },
            ],
          },
          {
            day: "Day 2",
            focus: "Bench Test",
            exercises: [
              {
                name: "Bench Press",
                sets: [
                  { weight: roundWeight(tm.bench * 0.7), reps: 3 },
                  { weight: roundWeight(tm.bench * 0.8), reps: 2 },
                  { weight: roundWeight(tm.bench * 0.9), reps: 1 },
                  { weight: roundWeight(tm.bench * 1.0), reps: "1" },
                  { weight: roundWeight(tm.bench * 1.025), reps: "1 PR" },
                ],
              },
            ],
          },
          {
            day: "Day 3",
            focus: "Deadlift Test",
            exercises: [
              {
                name: "Deadlift",
                sets: [
                  { weight: roundWeight(tm.deadlift * 0.7), reps: 3 },
                  { weight: roundWeight(tm.deadlift * 0.8), reps: 2 },
                  { weight: roundWeight(tm.deadlift * 0.9), reps: 1 },
                  { weight: roundWeight(tm.deadlift * 1.0), reps: "1" },
                  { weight: roundWeight(tm.deadlift * 1.025), reps: "1 PR" },
                ],
              },
            ],
          },
          {
            day: "Day 4",
            focus: "Deload",
            exercises: [
              { name: "Light Squat", sets: "3x5 @ 50%" },
              { name: "Light Bench", sets: "3x5 @ 50%" },
              { name: "Mobility Work", sets: "15 min" },
            ],
          },
        ];
      }
    },
  },

  juggernaut: {
    name: "Juggernaut Method",
    level: "advanced",
    daysPerWeek: 4,
    cycleLength: "16 weeks",
    hasWeeks: true,
    totalWeeks: 16,
    description:
      "Chad Wesley Smith's periodized system. Waves of 10s, 8s, 5s, and 3s with progressive overload. Built for athletes.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: maxes.squat,
        bench: maxes.bench,
        deadlift: maxes.deadlift,
        ohp: maxes.ohp,
      };

      // Determine which wave and which week within the wave
      // Weeks 1-4: 10s wave, 5-8: 8s wave, 9-12: 5s wave, 13-16: 3s wave
      let wave: { reps: number; pcts: number[] };
      let weekInWave: number;

      if (week <= 4) {
        wave = { reps: 10, pcts: [0.6, 0.65, 0.7, 0.75] };
        weekInWave = week;
      } else if (week <= 8) {
        wave = { reps: 8, pcts: [0.65, 0.7, 0.75, 0.8] };
        weekInWave = week - 4;
      } else if (week <= 12) {
        wave = { reps: 5, pcts: [0.7, 0.75, 0.8, 0.85] };
        weekInWave = week - 8;
      } else {
        wave = { reps: 3, pcts: [0.75, 0.8, 0.85, 0.9] };
        weekInWave = week - 12;
      }

      const pct = wave.pcts[weekInWave - 1];
      const isDeload = weekInWave === 4;
      const isAmrap = weekInWave === 3;

      const mainSets = isDeload
        ? [{ weight: roundWeight(tm.squat * (pct - 0.2)), reps: 5 }]
        : isAmrap
        ? [
            ...Array(2).fill({ weight: roundWeight(tm.squat * pct), reps: wave.reps }),
            { weight: roundWeight(tm.squat * pct), reps: `${wave.reps}+` },
          ]
        : Array(3).fill({ weight: roundWeight(tm.squat * pct), reps: wave.reps });

      return [
        {
          day: "Day 1",
          focus: "Squat",
          exercises: [
            {
              name: "Squat",
              sets: mainSets.map((s) => ({ ...s, weight: roundWeight(tm.squat * pct) })),
            },
            { name: "Leg Press", sets: isDeload ? "2x10" : "4x10" },
            { name: "Leg Curls", sets: isDeload ? "2x10" : "3x12" },
          ],
        },
        {
          day: "Day 2",
          focus: "Bench",
          exercises: [
            {
              name: "Bench Press",
              sets: mainSets.map((s) => ({ ...s, weight: roundWeight(tm.bench * pct) })),
            },
            { name: "Dumbbell Row", sets: isDeload ? "2x10" : "4x10" },
            { name: "Dips", sets: isDeload ? "2x10" : "3x12" },
          ],
        },
        {
          day: "Day 3",
          focus: "Deadlift",
          exercises: [
            {
              name: "Deadlift",
              sets: mainSets.map((s) => ({ ...s, weight: roundWeight(tm.deadlift * pct) })),
            },
            { name: "Front Squat", sets: isDeload ? "2x6" : "3x8" },
            { name: "Ab Wheel", sets: isDeload ? "2x10" : "3x15" },
          ],
        },
        {
          day: "Day 4",
          focus: "OHP",
          exercises: [
            {
              name: "Overhead Press",
              sets: mainSets.map((s) => ({ ...s, weight: roundWeight(tm.ohp * pct) })),
            },
            { name: "Pull-ups", sets: isDeload ? "2x max" : "4x max" },
            { name: "Lateral Raises", sets: isDeload ? "2x12" : "3x15" },
          ],
        },
      ];
    },
  },

  jt2: {
    name: "GZCL Jacked & Tan 2.0",
    level: "advanced",
    daysPerWeek: 4,
    cycleLength: "12 weeks",
    hasWeeks: true,
    totalWeeks: 12,
    description:
      "High volume GZCL variant focused on hypertrophy and strength. Rep max progressions with lots of back-off work.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: maxes.squat,
        bench: maxes.bench,
        deadlift: maxes.deadlift,
        ohp: maxes.ohp,
      };

      // J&T 2.0 uses rep maxes that decrease over 6-week blocks
      // Block 1 (weeks 1-6): 10RM -> 6RM
      // Block 2 (weeks 7-12): 8RM -> 2RM

      let targetRM: number;
      let pct: number;

      if (week <= 6) {
        // Block 1
        const rms = [10, 10, 8, 8, 6, 6];
        targetRM = rms[week - 1];
        pct = 0.65 + (week - 1) * 0.03;
      } else {
        // Block 2
        const rms = [8, 6, 4, 4, 2, 2];
        targetRM = rms[week - 7];
        pct = 0.75 + (week - 7) * 0.04;
      }

      const t1Sets = [
        { weight: roundWeight(tm.squat * (pct - 0.15)), reps: 4 },
        { weight: roundWeight(tm.squat * (pct - 0.1)), reps: 4 },
        { weight: roundWeight(tm.squat * (pct - 0.05)), reps: 2 },
        { weight: roundWeight(tm.squat * pct), reps: `${targetRM}RM` },
      ];

      return [
        {
          day: "Day 1",
          focus: "Squat/Bench",
          exercises: [
            {
              name: "Squat (T1)",
              sets: t1Sets.map((s) => ({ ...s, weight: roundWeight(tm.squat * pct) })),
            },
            {
              name: "Bench Press (T2a)",
              sets: Array(4).fill({ weight: roundWeight(tm.bench * (pct - 0.15)), reps: 8 }),
            },
            { name: "Dumbbell Row (T2b)", sets: "4x10" },
            { name: "Leg Press (T3)", sets: "3x15" },
            { name: "Face Pulls (T3)", sets: "3x20" },
          ],
        },
        {
          day: "Day 2",
          focus: "OHP/Deadlift",
          exercises: [
            {
              name: "Overhead Press (T1)",
              sets: t1Sets.map((s) => ({ ...s, weight: roundWeight(tm.ohp * pct * 0.65) })),
            },
            {
              name: "Deadlift (T2a)",
              sets: Array(4).fill({ weight: roundWeight(tm.deadlift * (pct - 0.15)), reps: 8 }),
            },
            { name: "Front Squat (T2b)", sets: "4x8" },
            { name: "Lat Pulldown (T3)", sets: "3x15" },
            { name: "Tricep Pushdowns (T3)", sets: "3x20" },
          ],
        },
        {
          day: "Day 3",
          focus: "Bench/Squat",
          exercises: [
            {
              name: "Bench Press (T1)",
              sets: t1Sets.map((s) => ({ ...s, weight: roundWeight(tm.bench * pct) })),
            },
            {
              name: "Squat (T2a)",
              sets: Array(4).fill({ weight: roundWeight(tm.squat * (pct - 0.15)), reps: 8 }),
            },
            { name: "Incline DB Press (T2b)", sets: "4x10" },
            { name: "Leg Curls (T3)", sets: "3x15" },
            { name: "Lateral Raises (T3)", sets: "3x20" },
          ],
        },
        {
          day: "Day 4",
          focus: "Deadlift/OHP",
          exercises: [
            {
              name: "Deadlift (T1)",
              sets: t1Sets.map((s) => ({ ...s, weight: roundWeight(tm.deadlift * pct) })),
            },
            {
              name: "Overhead Press (T2a)",
              sets: Array(4).fill({ weight: roundWeight(tm.ohp * (pct - 0.15)), reps: 8 }),
            },
            { name: "Barbell Row (T2b)", sets: "4x10" },
            { name: "Pull-ups (T3)", sets: "3x max" },
            { name: "Bicep Curls (T3)", sets: "3x15" },
          ],
        },
      ];
    },
  },

  calgaryBarbell: {
    name: "Calgary Barbell 16-Week",
    level: "advanced",
    daysPerWeek: 4,
    cycleLength: "16 weeks",
    hasWeeks: true,
    totalWeeks: 16,
    description:
      "Bryce Krawczyk's competition prep program. Progressive overload with strategic deloads. Designed for peaking.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: maxes.squat,
        bench: maxes.bench,
        deadlift: maxes.deadlift,
      };

      // Calgary Barbell phases:
      // Weeks 1-4: Volume (higher reps, moderate intensity)
      // Weeks 5-8: Strength (moderate reps, higher intensity)
      // Weeks 9-12: Peaking (lower reps, high intensity)
      // Weeks 13-15: Peak/Taper
      // Week 16: Competition/Test

      let phase: string;
      let reps: number;
      let basePct: number;
      let weekMod: number;

      if (week <= 4) {
        phase = "Volume";
        reps = 6;
        basePct = 0.7;
        weekMod = (week - 1) * 0.025;
      } else if (week <= 8) {
        phase = "Strength";
        reps = 4;
        basePct = 0.78;
        weekMod = (week - 5) * 0.025;
      } else if (week <= 12) {
        phase = "Intensity";
        reps = 3;
        basePct = 0.85;
        weekMod = (week - 9) * 0.025;
      } else if (week <= 15) {
        phase = "Peak";
        reps = 2;
        basePct = 0.9;
        weekMod = (week - 13) * 0.02;
      } else {
        phase = "Test";
        reps = 1;
        basePct = 1.0;
        weekMod = 0;
      }

      const pct = basePct + weekMod;
      const isDeload = week === 4 || week === 8 || week === 12;

      if (week === 16) {
        // Test week
        return [
          {
            day: "Day 1",
            focus: "Squat Opener",
            exercises: [
              {
                name: "Squat",
                sets: [
                  { weight: roundWeight(tm.squat * 0.5), reps: 5 },
                  { weight: roundWeight(tm.squat * 0.7), reps: 3 },
                  { weight: roundWeight(tm.squat * 0.85), reps: 1 },
                  { weight: roundWeight(tm.squat * 0.92), reps: "1 (opener)" },
                ],
              },
            ],
          },
          {
            day: "Day 2",
            focus: "Bench Opener",
            exercises: [
              {
                name: "Bench Press",
                sets: [
                  { weight: roundWeight(tm.bench * 0.5), reps: 5 },
                  { weight: roundWeight(tm.bench * 0.7), reps: 3 },
                  { weight: roundWeight(tm.bench * 0.85), reps: 1 },
                  { weight: roundWeight(tm.bench * 0.92), reps: "1 (opener)" },
                ],
              },
            ],
          },
          {
            day: "Day 3",
            focus: "Deadlift Opener",
            exercises: [
              {
                name: "Deadlift",
                sets: [
                  { weight: roundWeight(tm.deadlift * 0.5), reps: 3 },
                  { weight: roundWeight(tm.deadlift * 0.7), reps: 2 },
                  { weight: roundWeight(tm.deadlift * 0.85), reps: 1 },
                  { weight: roundWeight(tm.deadlift * 0.92), reps: "1 (opener)" },
                ],
              },
            ],
          },
          {
            day: "Day 4",
            focus: "Rest / Meet Day",
            exercises: [{ name: "Competition Day", sets: "Full meet simulation or rest" }],
          },
        ];
      }

      const sets = isDeload ? 3 : 5;
      const deloadPct = isDeload ? pct - 0.15 : pct;

      return [
        {
          day: "Day 1",
          focus: `Squat ${phase}`,
          exercises: [
            {
              name: "Squat",
              sets: Array(sets).fill({ weight: roundWeight(tm.squat * deloadPct), reps: isDeload ? 5 : reps }),
            },
            {
              name: "Pause Squat",
              sets: Array(3).fill({ weight: roundWeight(tm.squat * (deloadPct - 0.15)), reps: reps + 1 }),
            },
            { name: "Leg Press", sets: isDeload ? "2x12" : "3x10" },
          ],
        },
        {
          day: "Day 2",
          focus: `Bench ${phase}`,
          exercises: [
            {
              name: "Bench Press",
              sets: Array(sets).fill({ weight: roundWeight(tm.bench * deloadPct), reps: isDeload ? 5 : reps }),
            },
            {
              name: "Close Grip Bench",
              sets: Array(3).fill({ weight: roundWeight(tm.bench * (deloadPct - 0.15)), reps: reps + 2 }),
            },
            { name: "Dumbbell Row", sets: isDeload ? "2x12" : "4x10" },
          ],
        },
        {
          day: "Day 3",
          focus: `Deadlift ${phase}`,
          exercises: [
            {
              name: "Deadlift",
              sets: Array(sets - 1).fill({ weight: roundWeight(tm.deadlift * deloadPct), reps: isDeload ? 5 : reps }),
            },
            {
              name: "Deficit Deadlift",
              sets: Array(3).fill({ weight: roundWeight(tm.deadlift * (deloadPct - 0.2)), reps: reps + 1 }),
            },
            { name: "Good Mornings", sets: isDeload ? "2x10" : "3x8" },
          ],
        },
        {
          day: "Day 4",
          focus: "Accessory",
          exercises: [
            { name: "Front Squat", sets: Array(4).fill({ weight: roundWeight(tm.squat * 0.55), reps: 6 }) },
            { name: "Incline Bench", sets: Array(4).fill({ weight: roundWeight(tm.bench * 0.6), reps: 8 }) },
            { name: "Pull-ups", sets: isDeload ? "2x max" : "4x max" },
            { name: "Face Pulls", sets: "3x20" },
          ],
        },
      ];
    },
  },

  sheiko29: {
    name: "Sheiko #29",
    level: "advanced",
    daysPerWeek: 3,
    cycleLength: "4 weeks",
    hasWeeks: true,
    totalWeeks: 4,
    description:
      "Russian powerlifting prep program by Boris Sheiko. High frequency, submaximal weights. For experienced lifters only.",
    getWorkouts: (maxes: RepMaxes, week: number = 1): WorkoutDay[] => {
      const tm = {
        squat: maxes.squat,
        bench: maxes.bench,
        deadlift: maxes.deadlift,
      };

      // Sheiko uses very specific percentages and rep schemes
      // This is a simplified version of Program #29
      const weekSchemes: Record<number, { squatPcts: number[][]; benchPcts: number[][]; deadPcts: number[][] }> = {
        1: {
          squatPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.8, 2], [0.8, 2], [0.75, 4]],
          benchPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.8, 3], [0.8, 3], [0.75, 4]],
          deadPcts: [[0.5, 3], [0.6, 3], [0.7, 3], [0.75, 2], [0.8, 2]],
        },
        2: {
          squatPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.8, 3], [0.85, 2], [0.8, 3]],
          benchPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.8, 3], [0.85, 2], [0.8, 3]],
          deadPcts: [[0.5, 3], [0.6, 3], [0.7, 3], [0.8, 2], [0.85, 2]],
        },
        3: {
          squatPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.8, 3], [0.85, 2], [0.9, 1], [0.85, 2]],
          benchPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.8, 3], [0.85, 2], [0.9, 1], [0.85, 2]],
          deadPcts: [[0.5, 3], [0.6, 3], [0.7, 2], [0.8, 2], [0.85, 1], [0.9, 1]],
        },
        4: {
          squatPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.7, 4]],
          benchPcts: [[0.5, 5], [0.6, 4], [0.7, 3], [0.75, 3], [0.7, 4]],
          deadPcts: [[0.5, 3], [0.6, 3], [0.7, 2], [0.75, 2]],
        },
      };

      const scheme = weekSchemes[week];

      return [
        {
          day: "Day 1",
          focus: "Squat/Bench",
          exercises: [
            {
              name: "Squat",
              sets: scheme.squatPcts.map(([pct, reps]) => ({
                weight: roundWeight(tm.squat * pct),
                reps,
              })),
            },
            {
              name: "Bench Press",
              sets: scheme.benchPcts.slice(0, 5).map(([pct, reps]) => ({
                weight: roundWeight(tm.bench * pct),
                reps,
              })),
            },
            { name: "Dumbbell Flyes", sets: "4x8" },
            { name: "Good Mornings", sets: "3x6" },
          ],
        },
        {
          day: "Day 2",
          focus: "Deadlift/Bench",
          exercises: [
            {
              name: "Deadlift",
              sets: scheme.deadPcts.map(([pct, reps]) => ({
                weight: roundWeight(tm.deadlift * pct),
                reps,
              })),
            },
            {
              name: "Bench Press",
              sets: scheme.benchPcts.slice(0, 4).map(([pct, reps]) => ({
                weight: roundWeight(tm.bench * pct),
                reps,
              })),
            },
            { name: "Dumbbell Row", sets: "4x8" },
            { name: "Tricep Extensions", sets: "3x10" },
          ],
        },
        {
          day: "Day 3",
          focus: "Squat/Bench",
          exercises: [
            {
              name: "Squat",
              sets: scheme.squatPcts.slice(0, 5).map(([pct, reps]) => ({
                weight: roundWeight(tm.squat * pct),
                reps,
              })),
            },
            {
              name: "Bench Press",
              sets: scheme.benchPcts.map(([pct, reps]) => ({
                weight: roundWeight(tm.bench * pct),
                reps,
              })),
            },
            { name: "Close Grip Bench", sets: "3x6" },
            { name: "Ab Work", sets: "3x15" },
          ],
        },
      ];
    },
  },
};

export function getProgramByKey(key: string): Program | undefined {
  return programs[key];
}

export function getAllPrograms(): [string, Program][] {
  return Object.entries(programs);
}

export function getNextWorkoutDay(programKey: string, completedDays: string[] = []): string {
  const program = programs[programKey];
  if (!program) return "";

  const workouts = program.getWorkouts({ squat: 0, bench: 0, deadlift: 0, ohp: 0 });
  const nextDay = workouts.find((w) => !completedDays.includes(w.day));
  return nextDay?.day || workouts[0]?.day || "";
}
