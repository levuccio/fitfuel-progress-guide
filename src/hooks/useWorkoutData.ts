import { useLocalStorage } from "./useLocalStorage";
import { WorkoutTemplate, WorkoutSession, Exercise } from "@/types/workout";
import { defaultTemplates } from "@/data/templates";
import { defaultExercises } from "@/data/exercises";
import { defaultRecipes } from "@/data/recipes";
import { useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Supabase table names
const TEMPLATES_TABLE = "workout_templates";
const EXERCISES_TABLE = "exercises";
const SESSIONS_TABLE = "workout_sessions"; // Still local for now
const ACTIVE_SESSION_LOCAL_KEY = "fittrack_active_session"; // Still local for now
const RECIPES_LOCAL_KEY = "fittrack_recipes"; // Still local for now

export function useWorkoutData() {
  const { user, loading: authLoading } = useAuth();

  // State for data fetched from Supabase
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [dataLoading, setDataLoading] = useState(true); // New loading state for data

  // Keep sessions and activeSession in local storage for now
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(SESSIONS_TABLE, []);
  const [activeSession, setActiveSession] = useLocalStorage<WorkoutSession | null>(ACTIVE_SESSION_LOCAL_KEY, null);
  const [, setRecipes] = useLocalStorage(RECIPES_LOCAL_KEY, defaultRecipes); // Recipes also still local

  const allExercises = [...defaultExercises, ...customExercises];

  // --- Data Fetching from Supabase ---
  useEffect(() => {
    if (authLoading) {
      // Still loading auth, don't try to fetch user-specific data yet
      return;
    }

    if (!user) {
      // No user logged in, use default data and clear custom data
      setTemplates(defaultTemplates);
      setCustomExercises([]);
      setDataLoading(false);
      return;
    }

    const fetchWorkoutData = async () => {
      setDataLoading(true);
      
      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from(TEMPLATES_TABLE)
        .select('*')
        .eq('user_id', user.id);

      // Fetch custom exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from(EXERCISES_TABLE)
        .select('*')
        .eq('user_id', user.id);

      if (templatesError) {
        console.error("Error fetching templates:", templatesError);
        toast.error("Failed to load templates", { description: templatesError.message });
        setTemplates(defaultTemplates); // Fallback to default if cloud fetch fails
      } else {
        setTemplates(templatesData || defaultTemplates); // Use fetched or default
      }

      if (exercisesError) {
        console.error("Error fetching custom exercises:", exercisesError);
        toast.error("Failed to load custom exercises", { description: exercisesError.message });
        setCustomExercises([]); // No fallback for custom exercises, they are user-specific
      } else {
        setCustomExercises(exercisesData || []);
      }
      setDataLoading(false);
    };

    fetchWorkoutData();
  }, [user, authLoading]);

  // --- Template Management (Supabase) ---
  const addTemplate = useCallback(async (template: WorkoutTemplate) => {
    if (!user) {
      toast.error("Please log in to add templates.");
      return;
    }
    const { data, error } = await supabase
      .from(TEMPLATES_TABLE)
      .insert({ ...template, user_id: user.id })
      .select();

    if (error) {
      console.error("Error adding template:", error);
      toast.error("Failed to add template", { description: error.message });
    } else if (data) {
      setTemplates(prev => [...prev, data[0]]);
      toast.success("Template added!");
    }
  }, [user]);

  const updateTemplate = useCallback(async (template: WorkoutTemplate) => {
    if (!user) {
      toast.error("Please log in to update templates.");
      return;
    }
    const { data, error } = await supabase
      .from(TEMPLATES_TABLE)
      .update({ ...template, user_id: user.id })
      .eq('id', template.id)
      .eq('user_id', user.id) // Ensure only owner can update
      .select();

    if (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template", { description: error.message });
    } else if (data) {
      setTemplates(prev => prev.map(t => t.id === template.id ? data[0] : t));
      toast.success("Template updated!");
    }
  }, [user]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!user) {
      toast.error("Please log in to delete templates.");
      return;
    }
    const { error } = await supabase
      .from(TEMPLATES_TABLE)
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id); // Ensure only owner can delete

    if (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template", { description: error.message });
    } else {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success("Template deleted!");
    }
  }, [user]);

  const updateTemplateOrder = useCallback(async (newOrder: WorkoutTemplate[]) => {
    // This is more complex with Supabase. For now, we'll update locally and log a message.
    // A proper implementation would involve updating an 'order' column in Supabase for each template.
    setTemplates(newOrder);
    if (user) {
      // In a real app, you'd update the 'order' field for each template in Supabase
      // For simplicity, we'll just update locally for now.
      console.warn("Template order updated locally. Supabase sync for order is not yet implemented.");
    }
  }, [user]);

  const getTemplateById = useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  // --- Exercise Management (Supabase for custom exercises) ---
  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!user) {
      toast.error("Please log in to add custom exercises.");
      return;
    }
    const { data, error } = await supabase
      .from(EXERCISES_TABLE)
      .insert({ ...exercise, user_id: user.id })
      .select();

    if (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise", { description: error.message });
    } else if (data) {
      setCustomExercises(prev => [...prev, data[0]]);
      toast.success("Custom exercise added!");
    }
  }, [user]);

  // --- Session Management (Still Local Storage) ---
  // These functions will remain using local storage for now.
  // They will be migrated in a subsequent step.

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

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  }, [setSessions]);

  // --- Restore Factory Settings (Supabase & Local) ---
  const restoreFactorySettings = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to restore factory settings for your account.");
      return;
    }

    // Delete user-specific data from Supabase
    const { error: templatesDeleteError } = await supabase
      .from(TEMPLATES_TABLE)
      .delete()
      .eq('user_id', user.id);

    const { error: exercisesDeleteError } = await supabase
      .from(EXERCISES_TABLE)
      .delete()
      .eq('user_id', user.id);

    if (templatesDeleteError || exercisesDeleteError) {
      console.error("Error deleting user data from Supabase:", templatesDeleteError || exercisesDeleteError);
      toast.error("Failed to clear user data from cloud.", { description: (templatesDeleteError || exercisesDeleteError)?.message });
      return;
    }

    // Reset local storage items (sessions, active session, recipes)
    localStorage.removeItem(SESSIONS_TABLE);
    localStorage.removeItem(ACTIVE_SESSION_LOCAL_KEY);
    localStorage.removeItem(RECIPES_LOCAL_KEY);

    // Reset states
    setTemplates(defaultTemplates);
    setSessions([]);
    setCustomExercises([]);
    setRecipes(defaultRecipes);
    setActiveSession(null);

    toast.success("Factory settings restored!", { description: "Your cloud and local data has been reset to default." });
  }, [user, setSessions, setCustomExercises, setRecipes, setActiveSession]);

  return {
    templates,
    sessions, // Still local
    customExercises,
    allExercises,
    activeSession, // Still local
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addExercise,
    startSession, // Still local
    updateActiveSession, // Still local
    completeSession, // Still local
    discardSession, // Still local
    pauseSession, // Still local
    resumeSession, // Still local
    getLastSessionData, // Still local
    updateTemplateOrder,
    getTemplateById,
    restoreFactorySettings,
    getExerciseHistoryData, // Still local
    updateSessionDuration, // Still local
    deleteSession, // Still local
    dataLoading, // New loading state
  };
}