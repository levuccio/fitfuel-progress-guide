import { useLocalStorage } from "./useLocalStorage";
import { WorkoutTemplate, WorkoutSession, Exercise } from "@/types/workout";
import { defaultTemplates } from "@/data/templates";
import { defaultExercises } from "@/data/exercises";
import { defaultRecipes } from "@/data/recipes";
import { useCallback, useEffect } from "react"; // Import useEffect
import { format } from "date-fns";
import { useStreakData } from "./useStreakData"; // Import the new streak hook
import { getUserTimezone } from "@/lib/date-utils"; // Import timezone utility

const TEMPLATES_KEY = "fittrack_templates";
const SESSIONS_KEY = "fittrack_sessions";
const EXERCISES_KEY = "fittrack_exercises";
const ACTIVE_SESSION_KEY = "fittrack_active_session";
const RECIPES_KEY = "fittrack_recipes";

import { INITIAL_USER_DATA } from "@/data/initial-user-data";

export function useWorkoutData() {
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>(
    TEMPLATES_KEY,
    defaultTemplates
  );

  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(
    SESSIONS_KEY,
    (INITIAL_USER_DATA.sessions as unknown) as WorkoutSession[]
  );

  const [customExercises, setCustomExercises] = useLocalStorage<Exercise[]>(
    EXERCISES_KEY,
    []
  );

  const [activeSession, setActiveSession] = useLocalStorage<WorkoutSession | null>(
    ACTIVE_SESSION_KEY,
    null
  );

  const [, setRecipes] = useLocalStorage(RECIPES_KEY, defaultRecipes);
  const { onWorkoutCompleted, recalculateStreaksFromDeletion } = useStreakData(); // Use the streak data hook

  const allExercises = [...defaultExercises, ...customExercises];

  // Migration: Ensure all custom exercises have a category
  useEffect(() => {
    let hasChanges = false;
    const migrated = customExercises.map(ex => {
      if (!ex.category) {
        hasChanges = true;
        return { ...ex, category: "weights" as const };
      }
      return ex;
    });

    if (hasChanges) {
      console.log("Migrated custom exercises to include default category 'weights'");
      setCustomExercises(migrated);
    }
  }, [customExercises, setCustomExercises]);

  // Auto-clear activeSession if it's in a completed or discarded state
  useEffect(() => {
    if (!activeSession) return;
    if (activeSession.status === "completed" || activeSession.status === "discarded") {
      setActiveSession(null);
    }
  }, [activeSession, setActiveSession]);

  // Force migration based on version to handle mobile caching issues
  useEffect(() => {
    const DATA_VERSION_KEY = "fittrack_data_v1";
    const hasMigrated = window.localStorage.getItem(DATA_VERSION_KEY);

    if (!hasMigrated && INITIAL_USER_DATA.sessions && INITIAL_USER_DATA.sessions.length > 0) {
      console.log("Forcing migration to v1...");
      // Force overwrite sessions regardless of current state
      setSessions(INITIAL_USER_DATA.sessions as unknown as WorkoutSession[]);
      window.localStorage.setItem(DATA_VERSION_KEY, "true");
    } else if (sessions.length === 0 && INITIAL_USER_DATA.sessions && INITIAL_USER_DATA.sessions.length > 0) {
      // Fallback: If sessions are empty but migration was supposedly done (or key missing), try again
      console.log("Sessions empty, re-applying initial data...");
      setSessions(INITIAL_USER_DATA.sessions as unknown as WorkoutSession[]);
    }
  }, [sessions.length, setSessions]);

  const addTemplate = useCallback((template: WorkoutTemplate) => {
    setTemplates(prev => [...prev, template]);
  }, [setTemplates]);

  const updateTemplate = useCallback((template: WorkoutTemplate) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
  }, [setTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [setTemplates]);

  const updateTemplateOrder = useCallback((newOrder: WorkoutTemplate[]) => {
    setTemplates(newOrder);
  }, [setTemplates]);

  const getTemplateById = useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  const addExercise = useCallback((exercise: Exercise) => {
    setCustomExercises(prev => [...prev, exercise]);
  }, [setCustomExercises]);

  const getLastSessionData = useCallback((templateId: string) => {
    const lastSession = sessions.find(
      s => s.templateId === templateId && s.status === "completed"
    );

    if (!lastSession) return null;

    const data: Record<string, { sets: { reps: number; weight: number }[]; date: string }> = {};

    lastSession.exercises.forEach(ex => {
      data[ex.exerciseId] = {
        sets: ex.sets.filter(s => s.completed).map(s => ({
          reps: s.reps,
          weight: s.weight,
        })),
        date: lastSession.endTime || lastSession.startTime,
      };
    });

    return data;
  }, [sessions]);

  const getExerciseHistoryData = useCallback((exerciseId: string) => {
    const historyData: { date: string; maxWeight: number; estimatedRM10?: number }[] = [];

    sessions.filter(s => s.status === "completed").forEach(session => {
      const exerciseLog = session.exercises.find(ex => ex.exerciseId === exerciseId);

      if (exerciseLog) {
        const completedSets = exerciseLog.sets.filter(set => set.completed);
        if (completedSets.length > 0) {
          const maxWeightInSession = Math.max(...completedSets.map(set => set.weight));
          let maxEstimatedRM10InSession = 0;

          completedSets.forEach(set => {
            if (set.weight > 0 && set.reps > 0) {
              // Epley formula for 1RM: 1RM = weight * (1 + reps / 30)
              const estimated1RM = set.weight * (1 + set.reps / 30);
              // RM10 is approximately 75% of 1RM
              const estimatedRM10 = estimated1RM * 0.75;
              if (estimatedRM10 > maxEstimatedRM10InSession) {
                maxEstimatedRM10InSession = estimatedRM10;
              }
            }
          });

          if (maxWeightInSession > 0 || maxEstimatedRM10InSession > 0) {
            historyData.push({
              date: session.startTime, // Use session.startTime for unique data points
              maxWeight: maxWeightInSession,
              estimatedRM10: maxEstimatedRM10InSession > 0 ? maxEstimatedRM10InSession : undefined,
            });
          }
        }
      }
    });

    // Sort by start time to ensure chronological order
    return historyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions]);

  const getDetailedExerciseHistory = useCallback((exerciseId: string) => {
    const history: { date: string; sets: { reps: number; weight: number }[] }[] = [];

    sessions.filter(s => s.status === "completed").forEach(session => {
      const exerciseLog = session.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exerciseLog) {
        const validSets = exerciseLog.sets.filter(s => s.completed && s.weight > 0);
        if (validSets.length > 0) {
          history.push({
            date: session.startTime,
            sets: validSets.map(s => ({ reps: s.reps, weight: s.weight }))
          });
        }
      }
    });

    // Sort descending by date (newest first)
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions]);

  const startSession = useCallback((template: WorkoutTemplate): WorkoutSession => {
    const lastData = getLastSessionData(template.id);

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      templateId: template.id,
      templateName: template.name,
      startTime: new Date().toISOString(),
      status: "in_progress",
      exercises: template.exercises.map(te => {
        const exercise = allExercises.find(e => e.id === te.exerciseId);

        if (!exercise) {
          throw new Error(`Exercise not found: ${te.exerciseId}`);
        }

        const lastExerciseData = lastData?.[te.exerciseId];

        return {
          id: crypto.randomUUID(),
          exerciseId: te.exerciseId,
          exercise,
          targetSets: te.sets,
          targetReps: te.reps,
          restSeconds: te.restSeconds,
          sets: Array.from({ length: te.sets }, (_, i) => ({
            id: crypto.randomUUID(),
            setNumber: i + 1,
            reps: lastExerciseData?.sets[i]?.reps || 0,
            weight: lastExerciseData?.sets[i]?.weight || 0,
            completed: false,
          })),
        };
      }),
      didWeights: false, // Will be calculated on completion
      didAbs: false,     // Will be calculated on completion
    };
    setActiveSession(session);
    return session;
  }, [setActiveSession, allExercises, getLastSessionData]);

  const updateActiveSession = useCallback((session: WorkoutSession) => {
    setActiveSession(session);
  }, [setActiveSession]);

  const completeSession = useCallback(() => {
    if (!activeSession) return;

    // Determine didWeights and didAbs based on completed sets in the session
    let didWeights = false;
    let didAbs = false;

    activeSession.exercises.forEach(exLog => {
      const completedSets = exLog.sets.filter(s => s.completed);
      if (completedSets.length > 0) {
        if (exLog.exercise.category === "weights") {
          didWeights = true;
        }
        if (exLog.exercise.category === "abs") {
          didAbs = true;
        }
      }
    });

    const completedSession: WorkoutSession = {
      ...activeSession,
      status: "completed",
      endTime: new Date().toISOString(),
      totalDuration: Math.floor(
        (new Date().getTime() - new Date(activeSession.startTime).getTime()) / 1000
      ),
      didWeights, // Set calculated flags
      didAbs,     // Set calculated flags
      completedAt: new Date().toISOString(), // Set completion timestamp
      tz: getUserTimezone(), // Store timezone at completion
    };

    setSessions(prev => [completedSession, ...prev]);
    setActiveSession(null); // Ensure active session is cleared

    // Trigger streak update and return its result for the dialog
    const streakQualification = onWorkoutCompleted(completedSession);

    return { completedSession, streakQualification };
  }, [activeSession, setSessions, setActiveSession, onWorkoutCompleted]);

  const discardSession = useCallback(() => {
    setActiveSession(null); // Ensure active session is cleared
  }, [setActiveSession]);

  const pauseSession = useCallback(() => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, status: "paused" });
  }, [activeSession, setActiveSession]);

  const resumeSession = useCallback(() => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, status: "in_progress" });
  }, [activeSession, setActiveSession]);

  const updateSessionDuration = useCallback((sessionId: string, newDurationSeconds: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, totalDuration: newDurationSeconds }
          : session
      )
    );
  }, [setSessions]);

  const updateSession = useCallback((updatedSession: WorkoutSession) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  }, [setSessions]);

  const deleteSession = useCallback((sessionToDelete: WorkoutSession) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionToDelete.id));
    // Trigger streak recalculation after deletion
    recalculateStreaksFromDeletion(sessionToDelete);
  }, [setSessions, recalculateStreaksFromDeletion]);

  const restoreFactorySettings = useCallback(() => {
    setTemplates(defaultTemplates);
    setSessions([]);
    setCustomExercises([]);
    setRecipes(defaultRecipes);
    setActiveSession(null);
  }, [setTemplates, setSessions, setCustomExercises, setRecipes, setActiveSession]);

  return {
    templates,
    sessions,
    customExercises,
    allExercises,
    activeSession,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addExercise,
    startSession,
    updateActiveSession,
    completeSession,
    discardSession,
    pauseSession,
    resumeSession,
    getLastSessionData,
    updateTemplateOrder,
    getTemplateById,
    restoreFactorySettings,
    getExerciseHistoryData,
    getDetailedExerciseHistory,
    updateSessionDuration,
    updateSession, // Export the new updateSession function
    deleteSession,
  };
}