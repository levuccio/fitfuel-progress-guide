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
    const historyMap: { [date: string]: number } = {}; // date (YYYY-MM-DD) -> maxWeight for that day

    sessions.filter(s => s.status === "completed").forEach(session => {
      const sessionDate = format(new Date(session.startTime), "yyyy-MM-dd");
      const exerciseLog = session.exercises.find(ex => ex.exerciseId === exerciseId);

      if (exerciseLog) {
        const maxWeightInSession = Math.max(
          ...exerciseLog.sets.filter(set => set.completed).map(set => set.weight),
          0
        );

        if (maxWeightInSession > 0) {
          if (!historyMap[sessionDate] || maxWeightInSession > historyMap[sessionDate]) {
            historyMap[sessionDate] = maxWeightInSession;
          }
        }
      }
    });

    return Object.entries(historyMap)
      .map(([date, maxWeight]) => ({ date, maxWeight }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
  };
}