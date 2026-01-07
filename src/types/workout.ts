export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  equipment: string[];
  isCustom: boolean;
  category: "weights" | "abs" | "cardio" | "other"; // Added category for streak tracking
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string; // Can be "8-12" or "10"
  restSeconds: number;
  order: number;
  supersetGroup?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  dayOfWeek?: string; // Optional day assignment
  exercises: TemplateExercise[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  templateName: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'paused' | 'discarded';
  exercises: ExerciseLog[];
  totalDuration?: number; // in seconds
  didWeights: boolean; // Added for streak tracking
  didAbs: boolean;     // Added for streak tracking
  completedAt?: string; // ISO timestamp, for streak tracking
  tz?: string;          // timezone used at completion time, for streak tracking
}

export interface LastSessionData {
  [exerciseId: string]: {
    sets: { reps: number; weight: number }[];
    date: string;
  };
}

// New types for Streak Tracking
export interface WeekSummary {
  userId: string; // Placeholder for future multi-user, currently 'default'
  weekId: string; // YYYY-Www
  weightsCount: number;
  absCount: number;
  keepQualified: boolean;
  perfectQualified: boolean;
  keepSaved: boolean;       // true if a streak-save token was consumed for this week
  finalized: boolean;       // once the week is rolled over
  updatedAt: string;
}

export interface StreakState {
  userId: string; // Placeholder for future multi-user, currently 'default'

  keepCurrent: number;
  keepBest: number;

  perfectCurrent: number;
  perfectBest: number;

  lastFinalizedWeekId?: string; // latest week that has been finalized

  // “Streak Save” tokens apply ONLY to Keep streak
  keepStreakSaves: number;

  // milestone tracking
  keepMilestoneBestAwarded: number;   // e.g. 0,2,4,8,12,24...
  perfectMilestoneBestAwarded: number;
}