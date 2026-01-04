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

  const addSquashGame = useCallback((game: SquashGame) => {
    setActivityData(prev => ({
      ...prev,
      squashGames: [...prev.squashGames, game],
    }));
  }, [setActivityData]);

  const restoreActivityFactorySettings = useCallback(() => {
    setActivityData({ activityLogs: [], squashGames: [] });
  }, [setActivityData]);

  return {
    activityLogs: activityData.activityLogs,
    squashGames: activityData.squashGames,
    addActivityLog,
    addSquashGame,
    restoreActivityFactorySettings,
  };
}