import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { ActivityData, ActivityLog, SquashGame } from "@/types/activity";

const ACTIVITY_DATA_KEY = "fittrack_activity_data";

export function useActivityData() {
  const [activityData, setActivityData] = useLocalStorage<ActivityData>(
    ACTIVITY_DATA_KEY,
    { activityLogs: [], squashGames: [] }
  );

  const addActivityLog = useCallback((log: ActivityLog) => {
    setActivityData(prev => ({
      ...prev,
      activityLogs: [...prev.activityLogs, log],
    }));
  }, [setActivityData]);

  const updateActivityLogDuration = useCallback((logId: string, newDurationMinutes: number) => {
    setActivityData(prev => ({
      ...prev,
      activityLogs: prev.activityLogs.map(log =>
        log.id === logId ? { ...log, durationMinutes: newDurationMinutes } : log
      ),
    }));
  }, [setActivityData]);

  const deleteActivityLog = useCallback((logId: string) => {
    setActivityData(prev => ({
      ...prev,
      activityLogs: prev.activityLogs.filter(log => log.id !== logId),
    }));
  }, [setActivityData]);

  const addSquashGame = useCallback((game: SquashGame) => {
    setActivityData(prev => ({
      ...prev,
      squashGames: [...prev.squashGames, game],
    }));
  }, [setActivityData]);

  const updateSquashGameDuration = useCallback((gameId: string, newDurationMinutes: number) => {
    setActivityData(prev => ({
      ...prev,
      squashGames: prev.squashGames.map(game =>
        game.id === gameId ? { ...game, durationMinutes: newDurationMinutes } : game
      ),
    }));
  }, [setActivityData]);

  const deleteSquashGame = useCallback((gameId: string) => {
    setActivityData(prev => ({
      ...prev,
      squashGames: prev.squashGames.filter(game => game.id !== gameId),
    }));
  }, [setActivityData]);

  const restoreActivityFactorySettings = useCallback(() => {
    setActivityData({ activityLogs: [], squashGames: [] });
  }, [setActivityData]);

  return {
    activityLogs: activityData.activityLogs,
    squashGames: activityData.squashGames,
    addActivityLog,
    updateActivityLogDuration,
    deleteActivityLog,
    addSquashGame,
    updateSquashGameDuration,
    deleteSquashGame,
    restoreActivityFactorySettings,
  };
}