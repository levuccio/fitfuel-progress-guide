import { WorkoutTemplate } from "@/types/workout";

export const defaultTemplates: WorkoutTemplate[] = [
  {
    id: "monday-upper",
    name: "Upper Body",
    dayOfWeek: "Monday",
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: "m1", exerciseId: "db-press-15", sets: 3, reps: "6-8", restSeconds: 180, order: 1 },
      { id: "m2", exerciseId: "neutral-grip-pulldown", sets: 3, reps: "6-8", restSeconds: 180, order: 2 },
      { id: "m3", exerciseId: "chest-press-pin", sets: 2, reps: "8-10", restSeconds: 180, order: 3 },
      { id: "m4", exerciseId: "chest-supported-row-pin", sets: 2, reps: "8-10", restSeconds: 180, order: 4 },
      { id: "m5", exerciseId: "tricep-pushdown-bar", sets: 3, reps: "8-10", restSeconds: 60, order: 5 },
      { id: "m6", exerciseId: "cable-curls", sets: 3, reps: "8-10", restSeconds: 120, order: 6 },
    ],
  },

  {
    id: "wednesday-lower",
    name: "Lower Body",
    dayOfWeek: "Wednesday",
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: "w1", exerciseId: "leg-press", sets: 2, reps: "6-8", restSeconds: 180, order: 1 },
      { id: "w2", exerciseId: "seated-hamstring-curl", sets: 3, reps: "8-10", restSeconds: 180, order: 2 },
      { id: "w3", exerciseId: "bulgarian-split-squat", sets: 2, reps: "6-10", restSeconds: 120, order: 3 },
      { id: "w4", exerciseId: "seated-db-laterals", sets: 3, reps: "8-10", restSeconds: 180, order: 4 },
      { id: "w5", exerciseId: "high-cable-laterals", sets: 2, reps: "8-10", restSeconds: 180, order: 5 },
      { id: "w6", exerciseId: "oh-cable-tricep-extension", sets: 3, reps: "6-10", restSeconds: 180, order: 6 },
    ],
  },

  {
    id: "friday-full",
    name: "Full Body",
    dayOfWeek: "Friday",
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: "f1", exerciseId: "db-press-45", sets: 2, reps: "6-8", restSeconds: 180, order: 1 },
      { id: "f2", exerciseId: "wide-grip-lat-pulldown", sets: 3, reps: "6-8", restSeconds: 180, order: 2 },
      { id: "f3", exerciseId: "pec-deck", sets: 3, reps: "8-10", restSeconds: 180, order: 3 },
      { id: "f4", exerciseId: "leg-extensions", sets: 2, reps: "8-10", restSeconds: 180, order: 4 },
      { id: "f5", exerciseId: "db-preacher-curl", sets: 2, reps: "6-10", restSeconds: 180, order: 5 },
      { id: "f6", exerciseId: "no-cheat-curls", sets: 3, reps: "6-10", restSeconds: 180, order: 6 },
    ],
  },

  {
    id: "weekend-abs",
    name: "Abs",
    dayOfWeek: "Weekend",
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: "a1", exerciseId: "reverse-ab-crunch", sets: 3, reps: "8-15", restSeconds: 120, order: 1 },
      { id: "a2", exerciseId: "bicycle-twisting", sets: 3, reps: "8-15", restSeconds: 120, order: 2 },
      { id: "a3", exerciseId: "ab-crunch", sets: 3, reps: "8-15", restSeconds: 120, order: 3 },
    ],
  },
];
