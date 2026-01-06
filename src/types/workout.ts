export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  equipment: string[];
  isCustom: boolean;
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
}

export interface LastSessionData {
  [exerciseId: string]: {
    sets: { reps: number; weight: number }[];
    date: string;
  };
}
