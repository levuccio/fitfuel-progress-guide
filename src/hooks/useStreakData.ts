import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { WeekSummary, StreakState, WorkoutSession } from "@/types/workout";
import { getWeekId, prevWeekId, getWeekIdsBetween, getUserTimezone } from "@/lib/date-utils";
import { format } from "date-fns";

const WEEK_SUMMARY_KEY = "fittrack_week_summaries";
const STREAK_STATE_KEY = "fittrack_streak_state";
const USER_ID = "default"; // Placeholder for single-user app

const MILESTONE_THRESHOLDS = [2, 4, 8, 12, 24];
const STREAK_SAVE_MILESTONE = 4; // Award +1 Keep Streak Save at 4 weeks Keep streak

export function useStreakData() {
  const [weekSummaries, setWeekSummaries] = useLocalStorage<WeekSummary[]>(WEEK_SUMMARY_KEY, []);
  const [streakState, setStreakState] = useLocalStorage<StreakState>(STREAK_STATE_KEY, {
    userId: USER_ID,
    keepCurrent: 0,
    keepBest: 0,
    perfectCurrent: 0,
    perfectBest: 0,
    keepStreakSaves: 0,
    keepMilestoneBestAwarded: 0,
    perfectMilestoneBestAwarded: 0,
  });

  const userTimezone = useMemo(getUserTimezone, []);
  const currentWeekId = useMemo(() => getWeekId(new Date(), userTimezone), [userTimezone]);

  // --- Helper Functions ---
  const getWeekSummary = useCallback((weekId: string): WeekSummary | undefined => {
    return weekSummaries.find(ws => ws.userId === USER_ID && ws.weekId === weekId);
  }, [weekSummaries]);

  const updateWeekSummary = useCallback((summary: WeekSummary) => {
    setWeekSummaries(prev => {
      const existingIndex = prev.findIndex(ws => ws.userId === summary.userId && ws.weekId === summary.weekId);
      if (existingIndex > -1) {
        const newSummaries = [...prev];
        newSummaries[existingIndex] = summary;
        return newSummaries;
      }
      return [...prev, summary];
    });
  }, [setWeekSummaries]);

  const initWeekSummary = useCallback((weekId: string): WeekSummary => ({
    userId: USER_ID,
    weekId,
    weightsCount: 0,
    absCount: 0,
    keepQualified: false,
    perfectQualified: false,
    keepSaved: false,
    finalized: false,
    updatedAt: new Date().toISOString(),
  }), []);

  // --- Core Logic ---

  const awardMilestonesIfNeeded = useCallback((currentState: StreakState) => {
    let updatedState = { ...currentState };

    for (const m of MILESTONE_THRESHOLDS) {
      // Keep Streak Milestones
      if (updatedState.keepBest >= m && updatedState.keepMilestoneBestAwarded < m) {
        updatedState.keepMilestoneBestAwarded = m;
        if (m === STREAK_SAVE_MILESTONE) {
          updatedState.keepStreakSaves += 1;
          // console.log(`Awarded +1 Keep Streak Save token for reaching ${m} Keep Best Streak!`);
          // TODO: Potentially show a toast notification for this reward
        }
        // console.log(`Awarded Keep Streak Milestone: ${m} weeks!`);
        // TODO: Enqueue badge/celebration event
      }

      // Perfect Streak Milestones
      if (updatedState.perfectBest >= m && updatedState.perfectMilestoneBestAwarded < m) {
        updatedState.perfectMilestoneBestAwarded = m;
        // console.log(`Awarded Perfect Streak Milestone: ${m} weeks!`);
        // TODO: Enqueue badge/celebration event
      }
    }
    return updatedState;
  }, []);

  const finalizeUpToCurrentWeek = useCallback(() => {
    setStreakState(prevStreakState => {
      let currentStreakState = { ...prevStreakState };
      const lastFinalized = currentStreakState.lastFinalizedWeekId;
      const weeksToFinalize = getWeekIdsBetween(lastFinalized, prevWeekId(currentWeekId));

      if (weeksToFinalize.length === 0 && lastFinalized === prevWeekId(currentWeekId)) {
        // Already finalized up to the previous week, nothing to do
        return prevStreakState;
      }

      for (const weekId of weeksToFinalize) {
        let summary = getWeekSummary(weekId) || initWeekSummary(weekId);

        if (summary.finalized) {
          // Skip if already finalized (e.g., due to manual edits or re-runs)
          currentStreakState.lastFinalizedWeekId = weekId;
          continue;
        }

        // KEEP STREAK FINALIZATION
        if (summary.keepQualified) {
          currentStreakState.keepCurrent += 1;
        } else if (currentStreakState.keepStreakSaves > 0) {
          currentStreakState.keepStreakSaves -= 1;
          summary.keepSaved = true;
          currentStreakState.keepCurrent += 1;
        } else {
          currentStreakState.keepCurrent = 0;
        }

        // PERFECT STREAK FINALIZATION
        if (summary.perfectQualified) {
          currentStreakState.perfectCurrent += 1;
        } else {
          currentStreakState.perfectCurrent = 0;
        }

        currentStreakState.keepBest = Math.max(currentStreakState.keepBest, currentStreakState.keepCurrent);
        currentStreakState.perfectBest = Math.max(currentStreakState.perfectBest, currentStreakState.perfectCurrent);

        summary.finalized = true;
        summary.updatedAt = new Date().toISOString();
        updateWeekSummary(summary);

        currentStreakState = awardMilestonesIfNeeded(currentStreakState); // Update state with awarded milestones

        currentStreakState.lastFinalizedWeekId = weekId;
      }
      return currentStreakState;
    });
  }, [currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, awardMilestonesIfNeeded]);

  const onWorkoutCompleted = useCallback((session: WorkoutSession) => {
    if (session.status !== "completed" || !session.completedAt || !session.tz) {
      console.warn("Workout not completed or missing data for streak tracking:", session);
      return;
    }

    const weekId = getWeekId(new Date(session.completedAt), session.tz);
    let summary = getWeekSummary(weekId) || initWeekSummary(weekId);

    // Only update if the week is not yet finalized
    if (summary.finalized) {
      console.warn(`Attempted to update finalized week ${weekId}. Skipping.`);
      return;
    }

    const wasKeepQualified = summary.keepQualified;
    const wasPerfectQualified = summary.perfectQualified;

    if (session.didWeights) {
      summary.weightsCount += 1;
    }
    if (session.didAbs) {
      summary.absCount += 1;
    }

    summary.keepQualified = summary.weightsCount >= 2;
    summary.perfectQualified = summary.weightsCount >= 3 && summary.absCount >= 1;
    summary.updatedAt = new Date().toISOString();

    updateWeekSummary(summary);

    const newlySecuredKeep = !wasKeepQualified && summary.keepQualified;
    const newlySecuredPerfect = !wasPerfectQualified && summary.perfectQualified;

    // TODO: Decide how to show the "earned streak" page.
    // This might involve returning a flag or using a global state/toast.
    if (newlySecuredKeep || newlySecuredPerfect) {
      // console.log("Streak newly secured!", { newlySecuredKeep, newlySecuredPerfect, summary });
      // This is where you'd trigger the post-workout "Streak Earned" page/dialog
    }
  }, [getWeekSummary, initWeekSummary, updateWeekSummary]);

  // --- Initial Load / Rollover Check ---
  useEffect(() => {
    // Run finalization on app launch
    finalizeUpToCurrentWeek();
  }, [finalizeUpToCurrentWeek]);

  // --- Data for UI ---
  const currentWeekSummary = useMemo(() => {
    return getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);
  }, [currentWeekId, getWeekSummary, initWeekSummary]);

  const provisionalKeepCurrent = streakState.keepCurrent + (currentWeekSummary.keepQualified ? 1 : 0);
  const provisionalPerfectCurrent = streakState.perfectCurrent + (currentWeekSummary.perfectQualified ? 1 : 0);

  const nextKeepMilestone = useMemo(() => {
    return MILESTONE_THRESHOLDS.find(m => m > streakState.keepBest) || MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.length - 1];
  }, [streakState.keepBest]);

  const nextPerfectMilestone = useMemo(() => {
    return MILESTONE_THRESHOLDS.find(m => m > streakState.perfectBest) || MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.length - 1];
  }, [streakState.perfectBest]);


  return {
    currentWeekSummary,
    streakState: {
      ...streakState,
      keepCurrent: provisionalKeepCurrent,
      perfectCurrent: provisionalPerfectCurrent,
    },
    onWorkoutCompleted,
    finalizeUpToCurrentWeek, // Expose for manual trigger if needed
    nextKeepMilestone,
    nextPerfectMilestone,
  };
}