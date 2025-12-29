// Comprehensive list of strength training exercises organized by category

export interface Exercise {
  name: string;
  category: string;
}

export const exercises: Exercise[] = [
  // Barbell Compound Lifts
  { name: "Squat", category: "Legs" },
  { name: "Front Squat", category: "Legs" },
  { name: "High Bar Squat", category: "Legs" },
  { name: "Low Bar Squat", category: "Legs" },
  { name: "Pause Squat", category: "Legs" },
  { name: "Box Squat", category: "Legs" },
  { name: "Anderson Squat", category: "Legs" },
  { name: "Hatfield Squat", category: "Legs" },
  { name: "Tempo Squat", category: "Legs" },
  { name: "Zercher Squat", category: "Legs" },
  { name: "Safety Bar Squat", category: "Legs" },
  { name: "Bench Press", category: "Chest" },
  { name: "Wide Grip Bench Press", category: "Chest" },
  { name: "Close Grip Bench Press", category: "Chest" },
  { name: "Pause Bench Press", category: "Chest" },
  { name: "Incline Bench Press", category: "Chest" },
  { name: "Decline Bench Press", category: "Chest" },
  { name: "Floor Press", category: "Chest" },
  { name: "Board Press", category: "Chest" },
  { name: "Swiss Bar Bench Press", category: "Chest" },
  { name: "Spoto Press", category: "Chest" },
  { name: "Deadlift", category: "Back" },
  { name: "Sumo Deadlift", category: "Back" },
  { name: "Trap Bar Deadlift", category: "Back" },
  { name: "Romanian Deadlift", category: "Back" },
  { name: "Stiff Leg Deadlift", category: "Back" },
  { name: "Snatch Grip Deadlift", category: "Back" },
  { name: "Deficit Deadlift", category: "Back" },
  { name: "Block Pull", category: "Back" },
  { name: "Rack Pull", category: "Back" },
  { name: "Pause Deadlift", category: "Back" },
  { name: "Overhead Press", category: "Shoulders" },
  { name: "Seated Barbell Press", category: "Shoulders" },
  { name: "Push Press", category: "Shoulders" },
  { name: "Z Press", category: "Shoulders" },
  { name: "Pin Press", category: "Shoulders" },

  // Rows
  { name: "Barbell Row", category: "Back" },
  { name: "Pendlay Row", category: "Back" },
  { name: "Seal Row", category: "Back" },
  { name: "T-Bar Row", category: "Back" },
  { name: "Dumbbell Row", category: "Back" },
  { name: "Kroc Row", category: "Back" },
  { name: "Chest Supported Row", category: "Back" },
  { name: "Inverted Row", category: "Back" },
  { name: "Landmine Row", category: "Back" },
  { name: "One-Arm Cable Row", category: "Back" },
  { name: "Machine High Row", category: "Back" },
  { name: "Cable Row", category: "Back" },
  { name: "Machine Row", category: "Back" },
  { name: "Meadows Row", category: "Back" },

  // Pull-ups & Pulldowns
  { name: "Pull-up", category: "Back" },
  { name: "Neutral Grip Pull-up", category: "Back" },
  { name: "Assisted Pull-up", category: "Back" },
  { name: "Weighted Pull-up", category: "Back" },
  { name: "Chin-up", category: "Back" },
  { name: "Weighted Chin-up", category: "Back" },
  { name: "Lat Pulldown", category: "Back" },
  { name: "Close Grip Pulldown", category: "Back" },
  { name: "Wide Grip Pulldown", category: "Back" },
  { name: "Straight Arm Pulldown", category: "Back" },

  // Dumbbell Pressing
  { name: "Dumbbell Bench Press", category: "Chest" },
  { name: "Incline Dumbbell Press", category: "Chest" },
  { name: "Decline Dumbbell Press", category: "Chest" },
  { name: "Dumbbell Shoulder Press", category: "Shoulders" },
  { name: "Single-Arm Dumbbell Bench Press", category: "Chest" },
  { name: "Single-Arm Dumbbell Shoulder Press", category: "Shoulders" },
  { name: "Arnold Press", category: "Shoulders" },
  { name: "Dumbbell Floor Press", category: "Chest" },

  // Chest Accessories
  { name: "Dumbbell Fly", category: "Chest" },
  { name: "Incline Dumbbell Fly", category: "Chest" },
  { name: "Cable Fly", category: "Chest" },
  { name: "High Cable Fly", category: "Chest" },
  { name: "Low Cable Fly", category: "Chest" },
  { name: "Cable Crossover", category: "Chest" },
  { name: "Pec Deck", category: "Chest" },
  { name: "Machine Chest Press", category: "Chest" },
  { name: "Dip", category: "Chest" },
  { name: "Weighted Dip", category: "Chest" },
  { name: "Push-up", category: "Chest" },
  { name: "Incline Push-up", category: "Chest" },
  { name: "Decline Push-up", category: "Chest" },
  { name: "Diamond Push-up", category: "Chest" },
  { name: "Dumbbell Pullover", category: "Chest" },
  { name: "Svend Press", category: "Chest" },

  // Shoulder Accessories
  { name: "Lateral Raise", category: "Shoulders" },
  { name: "Cable Lateral Raise", category: "Shoulders" },
  { name: "Front Raise", category: "Shoulders" },
  { name: "Rear Delt Fly", category: "Shoulders" },
  { name: "Face Pull", category: "Shoulders" },
  { name: "Rear Delt Machine", category: "Shoulders" },
  { name: "Scaption Raise", category: "Shoulders" },
  { name: "Y Raise", category: "Shoulders" },
  { name: "Upright Row", category: "Shoulders" },
  { name: "Cuban Press", category: "Shoulders" },
  { name: "Landmine Press", category: "Shoulders" },
  { name: "Band Pull-Apart", category: "Shoulders" },
  { name: "Machine Shoulder Press", category: "Shoulders" },
  { name: "Cable Rear Delt Fly", category: "Shoulders" },
  { name: "Shrug", category: "Shoulders" },
  { name: "Dumbbell Shrug", category: "Shoulders" },
  { name: "Lu Raise", category: "Shoulders" },

  // Leg Accessories
  { name: "Leg Press", category: "Legs" },
  { name: "Hack Squat", category: "Legs" },
  { name: "Bulgarian Split Squat", category: "Legs" },
  { name: "Walking Lunge", category: "Legs" },
  { name: "Reverse Lunge", category: "Legs" },
  { name: "Step Up", category: "Legs" },
  { name: "Goblet Squat", category: "Legs" },
  { name: "Leg Extension", category: "Legs" },
  { name: "Leg Curl", category: "Legs" },
  { name: "Standing Leg Curl", category: "Legs" },
  { name: "Seated Leg Curl", category: "Legs" },
  { name: "Lying Leg Curl", category: "Legs" },
  { name: "Nordic Curl", category: "Legs" },
  { name: "Good Morning", category: "Legs" },
  { name: "Single-Leg Romanian Deadlift", category: "Legs" },
  { name: "Glute Bridge", category: "Legs" },
  { name: "Hip Thrust", category: "Legs" },
  { name: "Hip Abduction", category: "Legs" },
  { name: "Hip Adduction", category: "Legs" },
  { name: "Cable Hip Abduction", category: "Legs" },
  { name: "Glute Kickback", category: "Legs" },
  { name: "Cable Pull Through", category: "Legs" },
  { name: "Glute Ham Raise", category: "Legs" },
  { name: "Back Extension", category: "Legs" },
  { name: "Reverse Hyper", category: "Legs" },
  { name: "Hyperextension", category: "Legs" },
  { name: "Sissy Squat", category: "Legs" },
  { name: "Belt Squat", category: "Legs" },
  { name: "Pendulum Squat", category: "Legs" },
  { name: "Cossack Squat", category: "Legs" },
  { name: "Curtsy Lunge", category: "Legs" },
  { name: "Step-down", category: "Legs" },

  // Calves
  { name: "Standing Calf Raise", category: "Legs" },
  { name: "Seated Calf Raise", category: "Legs" },
  { name: "Leg Press Calf Raise", category: "Legs" },
  { name: "Donkey Calf Raise", category: "Legs" },
  { name: "Single-Leg Calf Raise", category: "Legs" },
  { name: "Smith Machine Calf Raise", category: "Legs" },

  // Triceps
  { name: "Tricep Pushdown", category: "Arms" },
  { name: "Rope Pushdown", category: "Arms" },
  { name: "Overhead Tricep Extension", category: "Arms" },
  { name: "Skull Crusher", category: "Arms" },
  { name: "EZ Bar Skull Crusher", category: "Arms" },
  { name: "French Press", category: "Arms" },
  { name: "JM Press", category: "Arms" },
  { name: "Tricep Dip", category: "Arms" },
  { name: "Close Grip Push-up", category: "Arms" },
  { name: "Cable Overhead Extension", category: "Arms" },
  { name: "Reverse Grip Pushdown", category: "Arms" },
  { name: "Bench Dip", category: "Arms" },
  { name: "Dumbbell Kickback", category: "Arms" },

  // Biceps
  { name: "Barbell Curl", category: "Arms" },
  { name: "EZ Bar Curl", category: "Arms" },
  { name: "Dumbbell Curl", category: "Arms" },
  { name: "Hammer Curl", category: "Arms" },
  { name: "Cross Body Hammer Curl", category: "Arms" },
  { name: "Incline Dumbbell Curl", category: "Arms" },
  { name: "Preacher Curl", category: "Arms" },
  { name: "Concentration Curl", category: "Arms" },
  { name: "Cable Curl", category: "Arms" },
  { name: "Spider Curl", category: "Arms" },
  { name: "Reverse Curl", category: "Arms" },
  { name: "Zottman Curl", category: "Arms" },
  { name: "Drag Curl", category: "Arms" },
  { name: "Cable Hammer Curl", category: "Arms" },
  { name: "Machine Curl", category: "Arms" },
  { name: "21s Curl", category: "Arms" },

  // Forearms
  { name: "Wrist Curl", category: "Arms" },
  { name: "Reverse Wrist Curl", category: "Arms" },
  { name: "Farmer Walk", category: "Arms" },
  { name: "Plate Pinch", category: "Arms" },
  { name: "Wrist Roller", category: "Arms" },
  { name: "Dead Hang", category: "Arms" },

  // Core
  { name: "Plank", category: "Core" },
  { name: "Ab Wheel Rollout", category: "Core" },
  { name: "Hanging Leg Raise", category: "Core" },
  { name: "Hanging Knee Raise", category: "Core" },
  { name: "Leg Raise", category: "Core" },
  { name: "Cable Crunch", category: "Core" },
  { name: "Cable Woodchopper", category: "Core" },
  { name: "Sit-up", category: "Core" },
  { name: "Decline Sit-up", category: "Core" },
  { name: "Crunch", category: "Core" },
  { name: "Reverse Crunch", category: "Core" },
  { name: "V-up", category: "Core" },
  { name: "Russian Twist", category: "Core" },
  { name: "Pallof Press", category: "Core" },
  { name: "Hollow Hold", category: "Core" },
  { name: "Hollow Rock", category: "Core" },
  { name: "Dead Bug", category: "Core" },
  { name: "Bird Dog", category: "Core" },
  { name: "Side Plank", category: "Core" },
  { name: "Dragon Flag", category: "Core" },
  { name: "L-Sit", category: "Core" },

  // Olympic Lifts
  { name: "Power Clean", category: "Olympic" },
  { name: "Hang Clean", category: "Olympic" },
  { name: "Hang Power Clean", category: "Olympic" },
  { name: "Clean", category: "Olympic" },
  { name: "Muscle Clean", category: "Olympic" },
  { name: "Clean and Jerk", category: "Olympic" },
  { name: "Snatch", category: "Olympic" },
  { name: "Power Snatch", category: "Olympic" },
  { name: "Hang Snatch", category: "Olympic" },
  { name: "Muscle Snatch", category: "Olympic" },
  { name: "Clean Pull", category: "Olympic" },
  { name: "Snatch Pull", category: "Olympic" },
  { name: "High Pull", category: "Olympic" },
  { name: "Push Jerk", category: "Olympic" },
  { name: "Split Jerk", category: "Olympic" },
  { name: "Power Jerk", category: "Olympic" },
  { name: "Split Clean", category: "Olympic" },
  { name: "Snatch Balance", category: "Olympic" },

  // Conditioning
  { name: "Kettlebell Swing", category: "Conditioning" },
  { name: "Kettlebell Clean", category: "Conditioning" },
  { name: "Kettlebell Snatch", category: "Conditioning" },
  { name: "Kettlebell Press", category: "Conditioning" },
  { name: "Kettlebell Clean and Press", category: "Conditioning" },
  { name: "Turkish Get Up", category: "Conditioning" },
  { name: "Sled Push", category: "Conditioning" },
  { name: "Sled Pull", category: "Conditioning" },
  { name: "Sled Drag", category: "Conditioning" },
  { name: "Battle Ropes", category: "Conditioning" },
  { name: "Rowing Machine", category: "Conditioning" },
  { name: "Assault Bike", category: "Conditioning" },
  { name: "Jump Rope", category: "Conditioning" },
  { name: "Box Jump", category: "Conditioning" },
  { name: "Burpee", category: "Conditioning" },
  { name: "Bear Crawl", category: "Conditioning" },
  { name: "Tire Flip", category: "Conditioning" },
  { name: "Sandbag Carry", category: "Conditioning" },
  { name: "Prowler Push", category: "Conditioning" },
  { name: "Ski Erg", category: "Conditioning" },
];

// Get unique exercise names for autocomplete
export const exerciseNames = exercises.map(e => e.name);

// Search exercises by name (case-insensitive, partial match)
export function searchExercises(query: string): Exercise[] {
  if (!query.trim()) return exercises.slice(0, 10);

  const lowerQuery = query.toLowerCase();

  // Exact matches first, then starts-with, then contains
  const exact: Exercise[] = [];
  const startsWith: Exercise[] = [];
  const contains: Exercise[] = [];

  for (const exercise of exercises) {
    const lowerName = exercise.name.toLowerCase();
    if (lowerName === lowerQuery) {
      exact.push(exercise);
    } else if (lowerName.startsWith(lowerQuery)) {
      startsWith.push(exercise);
    } else if (lowerName.includes(lowerQuery)) {
      contains.push(exercise);
    }
  }

  return [...exact, ...startsWith, ...contains].slice(0, 10);
}

// Get categories for filtering
export const categories = [...new Set(exercises.map(e => e.category))];
