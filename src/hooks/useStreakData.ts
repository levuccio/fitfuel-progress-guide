import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { WeekSummary, StreakState, WorkoutSession } from "@/types/workout";
import { getWeekId, prevWeekId, getWeekIdsBetween, getUserTimezone } from "@/lib/date-utils";
import { toast } from "sonner";

const WEEK_SUMMARY_KEY = "fittrack_week_summaries";
const STREAK_STATE_KEY = "fittrack_streak_state";
const USER_ID = "default"; // Placeholder for single-user app

const MILESTONE_THRESHOLDS = [4, 8, 12, 16, 24, 36, 52]; // Award tokens/milestones at these weeks

export function useStreakData() {
  const [weekSummaries, setWeekSummaries] = useLocalStorage<WeekSummary[]>(WEEK_SUMMARY_KEY, []);
  const [streakState, setStreakState] = useLocalStorage<StreakState>(STREAK_STATE_KEY, {
    userId: USER_ID,
    weight2Current: 0,
    weight2Best: 0,
    weight3Current: 0,
    weight3Best: 0,
    absCurrent: 0,
    absBest: 0,
    weight2SaveTokens: 0,
    weight3SaveTokens: 0,
    absSaveTokens: 0,
    weightCarryoverCredits: 0,
    weight2MilestoneAwarded: 0,
    weight3MilestoneAwarded: 0,
    absMilestoneAwarded: 0,
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
    carryoverApplied: false,
    carryoverEarnedThisWeek: false,
    finalized: false,
    updatedAt: new Date().toISOString(),
  }), []);

  // --- Core Logic ---

  const awardMilestonesAndTokensIfNeeded = useCallback((currentState: StreakState) => {
    let updatedState = { ...currentState };

    const checkAndAward = (
      streakType: "weight2" | "weight3" | "abs",
      bestStreak: number,
      milestoneAwarded: number,
      saveTokens: number
    ) => {
      let newMilestoneAwarded = milestoneAwarded;
      let newSaveTokens = saveTokens;
      let awardedMilestone: number | undefined;

      for (const m of MILESTONE_THRESHOLDS) {
        if (bestStreak >= m && milestoneAwarded < m) {
          newMilestoneAwarded = m;
          newSaveTokens += 1;
          awardedMilestone = m;
          toast.success(`You earned a Streak Save Token!`, {
            description: `Awarded for reaching a ${m}-week ${streakType.replace('weight2', '2x Weights').replace('weight3', '3x Weights').replace('abs', 'Abs')} streak!`,
          });
          // console.log(`Awarded +1 ${streakType} Streak Save token for reaching ${m} Best Streak!`);
        }
      }
      return { newMilestoneAwarded, newSaveTokens, awardedMilestone };
    };

    const { newMilestoneAwarded: w2ma, newSaveTokens: w2st, awardedMilestone: w2am } = checkAndAward(
      "weight2", updatedState.weight2Best, updatedState.weight2MilestoneAwarded, updatedState.weight2SaveTokens
    );
    updatedState.weight2MilestoneAwarded = w2ma;
    updatedState.weight2SaveTokens = w2st;

    const { newMilestoneAwarded: w3ma, newSaveTokens: w3st, awardedMilestone: w3am } = checkAndAward(
      "weight3", updatedState.weight3Best, updatedState.weight3MilestoneAwarded, updatedState.weight3SaveTokens
    );
    updatedState.weight3MilestoneAwarded = w3ma;
    updatedState.weight3SaveTokens = w3st;

    const { newMilestoneAwarded: ama, newSaveTokens: ast, awardedMilestone: aam } = checkAndAward(
      "abs", updatedState.absBest, updatedState.absMilestoneAwarded, updatedState.absSaveTokens
    );
    updatedState.absMilestoneAwarded = ama;
    updatedState.absSaveTokens = ast;

    return { updatedState, awardedMilestones: { weight2: w2am, weight3: w3am, abs: aam } };
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
          currentStreakState.lastFinalizedWeekId = weekId;
          continue;
        }

        const effectiveWeightsCount = summary.weightsCount + (summary.carryoverApplied ? 1 : 0);
        const qualifiedWeight2 = effectiveWeightsCount >= 2;
        const qualifiedWeight3 = effectiveWeightsCount >= 3;
        const qualifiedAbs = summary.absCount >= 1;

        // WEIGHT 2x STREAK FINALIZATION
        if (qualifiedWeight2) {
          currentStreakState.weight2Current += 1;
        } else if (currentStreakState.weight2SaveTokens > 0) {
          currentStreakState.weight2SaveTokens -= 1;
          currentStreakState.weight2Current += 1;
          // toast.info(`1 Weight 2x Streak Save Token used for week ${weekId}.`);
        } else {
          currentStreakState.weight2Current = 0;
        }

        // WEIGHT 3x STREAK FINALIZATION
        if (qualifiedWeight3) {
          currentStreakState.weight3Current += 1;
        } else if (currentStreakState.weight3SaveTokens > 0) {
          currentStreakState.weight3SaveTokens -= 1;
          currentStreakState.weight3Current += 1;
          // toast.info(`1 Weight 3x Streak Save Token used for week ${weekId}.`);
        } else {
          currentStreakState.weight3Current = 0;
        }

        // ABS STREAK FINALIZATION
        if (qualifiedAbs) {
          currentStreakState.absCurrent += 1;
        } else if (currentStreakState.absSaveTokens > 0) {
          currentStreakState.absSaveTokens -= 1;
          currentStreakState.absCurrent += 1;
          // toast.info(`1 Abs Streak Save Token used for week ${weekId}.`);
        } else {
          currentStreakState.absCurrent = 0;
        }

        // Update best streaks
        currentStreakState.weight2Best = Math.max(currentStreakState.weight2Best, currentStreakState.weight2Current);
        currentStreakState.weight3Best = Math.max(currentStreakState.weight3Best, currentStreakState.weight3Current);
        currentStreakState.absBest = Math.max(currentStreakState.absBest, currentStreakState.absCurrent);

        // Handle carryover credits earned in this finalized week
        if (summary.carryoverEarnedThisWeek) {
          currentStreakState.weightCarryoverCredits += 1;
          // toast.success("Carryover Credit Earned!", {
          //   description: `You completed 4+ weight sessions in week ${weekId} and earned a carryover credit!`,
          // });
        }

        summary.finalized = true;
        summary.updatedAt = new Date().toISOString();
        updateWeekSummary(summary);

        const { updatedState: stateAfterMilestones } = awardMilestonesAndTokensIfNeeded(currentStreakState);
        currentStreakState = stateAfterMilestones;

        currentStreakState.lastFinalizedWeekId = weekId;
      }
      return currentStreakState;
    });
  }, [currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, awardMilestonesAndTokensIfNeeded]);

  const onWorkoutCompleted = useCallback((session: WorkoutSession) => {
    if (session.status !== "completed" || !session.completedAt || !session.tz) {
      console.warn("Workout not completed or missing data for streak tracking:", session);
      return;
    }

    const weekId = getWeekId(new Date(session.completedAt), session.tz);
    let summary = getWeekSummary(weekId) || initWeekSummary(weekId);

    if (summary.finalized) {
      console.warn(`Attempted to update finalized week ${weekId}. Skipping.`);
      return;
    }

    const prevWeightsCount = summary.weightsCount;
    const prevAbsCount = summary.absCount;

    if (session.didWeights) {
      summary.weightsCount += 1;
    }
    if (session.didAbs) {
      summary.absCount += 1;
    }

    // Check for carryover earned this week
    if (summary.weightsCount >= 4 && !summary.carryoverEarnedThisWeek) {
      summary.carryoverEarnedThisWeek = true;
      // This will be processed during finalization
    }

    summary.updatedAt = new Date().toISOString();
    updateWeekSummary(summary);

    // Return flags for the post-workout dialog
    const effectiveWeightsCount = summary.weightsCount + (summary.carryoverApplied ? 1 : 0);
    const prevEffectiveWeightsCount = prevWeightsCount + (summary.carryoverApplied ? 1 : 0);

    const newlySecuredWeight2 = (prevEffectiveWeightsCount < 2 && effectiveWeightsCount >= 2);
    const newlySecuredWeight3 = (prevEffectiveWeightsCount < 3 && effectiveWeightsCount >= 3);
    const newlySecuredAbs = (prevAbsCount < 1 && summary.absCount >= 1);

    return { newlySecuredWeight2, newlySecuredWeight3, newlySecuredAbs };

  }, [getWeekSummary, initWeekSummary, updateWeekSummary]);

  const applyCarryoverCredit = useCallback(() => {
    setStreakState(prevStreakState => {
      if (prevStreakState.weightCarryoverCredits <= 0) {
        toast.error("No carryover credits available.");
        return prevStreakState;
      }

      let currentSummary = getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);

      if (currentSummary.carryoverApplied) {
        toast.info("Carryover credit already applied for this week.");
        return prevStreakState;
      }

      currentSummary.carryoverApplied = true;
      currentSummary.updatedAt = new Date().toISOString();
      updateWeekSummary(currentSummary);

      toast.success("Carryover credit applied!", {
        description: "This week will count as +1 weight session for streak qualification.",
      });

      return {
        ...prevStreakState,
        weightCarryoverCredits: prevStreakState.weightCarryoverCredits - 1,
      };
    });
  }, [currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, setStreakState]);

  // --- Initial Load / Rollover Check ---
  useEffect(() => {
    finalizeUpToCurrentWeek();
  }, [finalizeUpToCurrentWeek]);

  // --- Data for UI ---
  const currentWeekSummary = useMemo(() => {
    return getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);
  }, [currentWeekId, getWeekSummary, initWeekSummary]);

  const effectiveWeightsCountThisWeek = currentWeekSummary.weightsCount + (currentWeekSummary.carryoverApplied ? 1 : 0);

  const provisionalWeight2Current = streakState.weight2Current + (effectiveWeightsCountThisWeek >= 2 ? 1 : 0);
  const provisionalWeight3Current = streakState.weight3Current + (effectiveWeightsCountThisWeek >= 3 ? 1 : 0);
  const provisionalAbsCurrent = streakState.absCurrent + (currentWeekSummary.absCount >= 1 ? 1 : 0);

  const getNextMilestone = useCallback((bestStreak: number) => {
    return MILESTONE_THRESHOLDS.find(m => m > bestStreak) || MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.length - 1];
  }, []);

  return {
    currentWeekSummary,
    streakState: {
      ...streakState,
      weight2Current: provisionalWeight2Current,
      weight3Current: provisionalWeight3Current,
      absCurrent: provisionalAbsCurrent,
    },
    onWorkoutCompleted,
    finalizeUpToCurrentWeek,
    applyCarryoverCredit,
    effectiveWeightsCountThisWeek,
    getNextMilestone,
  };
}