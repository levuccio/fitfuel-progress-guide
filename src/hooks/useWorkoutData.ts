import { useLocalStorage } from "./useLocalStorage";
import { WorkoutTemplate, WorkoutSession, Exercise } from "@/types/workout";
import { defaultTemplates } from "@/data/templates";
import { defaultExercises } from "@/data/exercises";
import { defaultRecipes } from "@/data/recipes";
import { useCallback } from "react";
import { format } from "date-fns";

const TEMPLATES_KEY = "fittrack_templates";
const SESSIONS_KEY = "fittrack_sessions";
const EXERCISES_KEY = "fittrack_exercises";
const ACTIVE_SESSION_KEY = "fittrack_active_session";
const RECIPES_KEY = "fittrack_recipes";

export function useWorkoutData() {
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>(
    TEMPLATES_KEY,
    defaultTemplates
  );
  
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(
    SESSIONS_KEY,
    []
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

  const allExercises = [...defaultExercises, ...customExercises];

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
    };
    setActiveSession(session);
    return session;
  }, [setActiveSession, allExercises, getLastSessionData]);

  const updateActiveSession = useCallback((session: WorkoutSession) => {
    setActiveSession(session);
  }, [setActiveSession]);

  const completeSession = useCallback(() => {
    if (!activeSession) return;
    
    const completedSession: WorkoutSession = {
      ...activeSession,
      status: "completed",
      endTime: new Date().toISOString(),
      totalDuration: Math.floor(
        (new Date().getTime() - new Date(activeSession.startTime).getTime()) / 1000
      ),
    };
    
    setSessions(prev => [completedSession, ...prev]);
    setActiveSession(null);
    
    return completedSession;
  }, [activeSession, setSessions, setActiveSession]);

  const discardSession = useCallback(() => {
    setActiveSession(null);
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

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  }, [setSessions]);

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
    updateSessionDuration,
    updateSession, // Export the new updateSession function
    deleteSession,
  };
}