import { useLocalStorage } from "./useLocalStorage";
import { WorkoutSession } from "@/types/workout";
import { calculateE10RM, calculateSessionVolume } from "@/lib/strength-utils";
import { useMemo } from "react";

export interface ExerciseStrengthStats {
  current10RM: number;
  best10RM: number;
  trend: "up" | "down" | "stable";
  lastSessionVolume: number;
  lastSessionDate: string;
  volumeHistory: { date: string; volume: number }[];
  rm10History: { date: string; rm10: number }[];
}

export function useStrengthAnalytics() {
  const [sessions] = useLocalStorage<Record<string, WorkoutSession>>("fittrack_sessions", {});

  const getExerciseStats = (exerciseId: string): ExerciseStrengthStats | null => {
    if (!sessions) return null;

    const sessionList = Object.values(sessions).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const history: { date: string; rm10: number; volume: number }[] = [];

    sessionList.forEach(session => {
       const exerciseData = session.exercises.find(e => e.exerciseId === exerciseId);
       if (!exerciseData) return;

       const sets = exerciseData.sets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
       if (sets.length === 0) return;

       // Calculate Best 10RM for this session
       const max10RM = Math.max(...sets.map(s => calculateE10RM(s.weight, s.reps)));
       const vol = calculateSessionVolume(sets);

       history.push({
         date: session.date,
         rm10: max10RM,
         volume: vol
       });
    });

    if (history.length === 0) return null;

    const current = history[history.length - 1];
    const best10RM = Math.max(...history.map(h => h.rm10));
    
    // Simple trend from last 3 sessions
    let trend: "up" | "down" | "stable" = "stable";
    if (history.length >= 2) {
      const prev = history[history.length - 2];
      if (current.rm10 > prev.rm10 * 1.02) trend = "up";
      else if (current.rm10 < prev.rm10 * 0.98) trend = "down";
    }

    return {
      current10RM: current.rm10,
      best10RM,
      trend,
      lastSessionVolume: current.volume,
      lastSessionDate: current.date,
      volumeHistory: history.map(h => ({ date: h.date, volume: h.volume })),
      rm10History: history.map(h => ({ date: h.date, rm10: h.rm10 }))
    };
  };

  return { getExerciseStats };
}
