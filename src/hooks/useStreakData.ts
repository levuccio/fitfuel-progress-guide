import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { WeekSummary, StreakState, WorkoutSession } from "@/types/workout";
import { getWeekId, prevWeekId, getWeekIdsBetween, getUserTimezone } from "@/lib/date-utils";
import { toast } from "sonner";

const WEEK_SUMMARY_KEY = "fittrack_week_summaries";
const STREAK_STATE_KEY = "fittrack_streak_state";
const SESSIONS_KEY = "fittrack_sessions";
const USER_ID = "default";

const MILESTONE_THRESHOLDS = [4, 8, 12, 16, 24, 36, 52];

function inferDidWeights(session: WorkoutSession) {
  // If any completed set belongs to a weights-category exercise, count as weights workout
  return session.exercises.some(
    (ex) => ex.exercise.category === "weights" && ex.sets.some((s) => s.completed)
  );
}

function inferDidAbs(session: WorkoutSession) {
  // If any completed set belongs to an abs-category exercise, count as abs workout
  return session.exercises.some(
    (ex) => ex.exercise.category === "abs" && ex.sets.some((s) => s.completed)
  );
}

function getSessionCompletionTimestamp(session: WorkoutSession) {
  // Prefer completedAt; otherwise prefer endTime (cross-midnight safety); fall back to startTime
  return session.completedAt ?? session.endTime ?? session.startTime;
}

function getSessionTimezone(session: WorkoutSession, tzFallback: string) {
  return session.tz ?? tzFallback;
}

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
    generalCarryoverCredits: 0,
    weight2MilestoneAwarded: 0,
    weight3MilestoneAwarded: 0,
    absMilestoneAwarded: 0,
  });
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(SESSIONS_KEY, []);

  const userTimezone = useMemo(getUserTimezone, []);
  const currentWeekId = useMemo(() => getWeekId(new Date(), userTimezone), [userTimezone]);

  const getWeekSummary = useCallback((weekId: string): WeekSummary | undefined => {
    return weekSummaries.find((ws) => ws.userId === USER_ID && ws.weekId === weekId);
  }, [weekSummaries]);

  const updateWeekSummary = useCallback((summary: WeekSummary) => {
    setWeekSummaries((prev) => {
      const existingIndex = prev.findIndex((ws) => ws.userId === summary.userId && ws.weekId === summary.weekId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = summary;
        return next;
      }
      return [...prev, summary];
    });
  }, [setWeekSummaries]);

  const initWeekSummary = useCallback((weekId: string): WeekSummary => ({
    userId: USER_ID,
    weekId,
    weightsCount: 0,
    absCount: 0,
    weightsCarryoverApplied: false,
    absCarryoverApplied: false,
    carryoverEarnedThisWeek: false,
    carryoverCreditsGranted: 0,
    finalized: false,
    updatedAt: new Date().toISOString(),
  }), []);

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

      for (const m of MILESTONE_THRESHOLDS) {
        if (bestStreak >= m && milestoneAwarded < m) {
          newMilestoneAwarded = m;
          newSaveTokens += 1;
          toast.success("You earned a Streak Save Token!", {
            description: `Awarded for reaching a ${m}-week ${streakType
              .replace("weight2", "2x Weights")
              .replace("weight3", "3x Weights")
              .replace("abs", "Abs")} streak!`,
          });
        }
      }

      return { newMilestoneAwarded, newSaveTokens };
    };

    const w2 = checkAndAward("weight2", updatedState.weight2Best, updatedState.weight2MilestoneAwarded, updatedState.weight2SaveTokens);
    updatedState.weight2MilestoneAwarded = w2.newMilestoneAwarded;
    updatedState.weight2SaveTokens = w2.newSaveTokens;

    const w3 = checkAndAward("weight3", updatedState.weight3Best, updatedState.weight3MilestoneAwarded, updatedState.weight3SaveTokens);
    updatedState.weight3MilestoneAwarded = w3.newMilestoneAwarded;
    updatedState.weight3SaveTokens = w3.newSaveTokens;

    const a = checkAndAward("abs", updatedState.absBest, updatedState.absMilestoneAwarded, updatedState.absSaveTokens);
    updatedState.absMilestoneAwarded = a.newMilestoneAwarded;
    updatedState.absSaveTokens = a.newSaveTokens;

    return updatedState;
  }, []);

  const finalizeUpToCurrentWeek = useCallback(() => {
    setStreakState((prevStreakState) => {
      let current = { ...prevStreakState };
      const lastFinalized = current.lastFinalizedWeekId;
      const weeksToFinalize = getWeekIdsBetween(lastFinalized, prevWeekId(currentWeekId));

      if (weeksToFinalize.length === 0 && lastFinalized === prevWeekId(currentWeekId)) {
        return prevStreakState;
      }

      for (const weekId of weeksToFinalize) {
        let summary = getWeekSummary(weekId) || initWeekSummary(weekId);

        if (summary.finalized) {
          current.lastFinalizedWeekId = weekId;
          continue;
        }

        const effectiveWeightsCount = summary.weightsCount + (summary.weightsCarryoverApplied ? 1 : 0);
        const effectiveAbsCount = summary.absCount + (summary.absCarryoverApplied ? 1 : 0);

        const qualifiedWeight2 = effectiveWeightsCount >= 2;
        const qualifiedWeight3 = effectiveWeightsCount >= 3;
        const qualifiedAbs = effectiveAbsCount >= 1;

        if (qualifiedWeight2) {
          current.weight2Current += 1;
        } else if (current.weight2SaveTokens > 0) {
          current.weight2SaveTokens -= 1;
          current.weight2Current += 1;
          toast.info(`1 Weight 2x Streak Save Token used for week ${weekId}.`);
        } else {
          current.weight2Current = 0;
        }

        if (qualifiedWeight3) {
          current.weight3Current += 1;
        } else if (current.weight3SaveTokens > 0) {
          current.weight3SaveTokens -= 1;
          current.weight3Current += 1;
          toast.info(`1 Weight 3x Streak Save Token used for week ${weekId}.`);
        } else {
          current.weight3Current = 0;
        }

        if (qualifiedAbs) {
          current.absCurrent += 1;
        } else if (current.absSaveTokens > 0) {
          current.absSaveTokens -= 1;
          current.absCurrent += 1;
          toast.info(`1 Abs Streak Save Token used for week ${weekId}.`);
        } else {
          current.absCurrent = 0;
        }

        current.weight2Best = Math.max(current.weight2Best, current.weight2Current);
        current.weight3Best = Math.max(current.weight3Best, current.weight3Current);
        current.absBest = Math.max(current.absBest, current.absCurrent);

        summary.finalized = true;
        summary.updatedAt = new Date().toISOString();
        updateWeekSummary(summary);

        current = awardMilestonesAndTokensIfNeeded(current);
        current.lastFinalizedWeekId = weekId;
      }

      return current;
    });
  }, [awardMilestonesAndTokensIfNeeded, currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, setStreakState]);

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

    if (session.didWeights) summary.weightsCount += 1;
    if (session.didAbs) summary.absCount += 1;

    // Grant carryover credits immediately (delta-based)
    const earnedCreditsThisWeek = Math.max(0, summary.weightsCount - 3);
    const newCreditsToGrant = earnedCreditsThisWeek - summary.carryoverCreditsGranted;

    if (newCreditsToGrant > 0) {
      setStreakState((prev) => ({
        ...prev,
        generalCarryoverCredits: prev.generalCarryoverCredits + newCreditsToGrant,
      }));
      summary.carryoverCreditsGranted += newCreditsToGrant;
      toast.success(`You earned ${newCreditsToGrant} carryover credit(s)!`, {
        description: `Awarded for completing ${summary.weightsCount} weight sessions this week.`,
      });
    }

    summary.carryoverEarnedThisWeek = earnedCreditsThisWeek > 0;
    summary.updatedAt = new Date().toISOString();
    updateWeekSummary(summary);

    const effectiveWeightsCount = summary.weightsCount + (summary.weightsCarryoverApplied ? 1 : 0);
    const prevEffectiveWeightsCount = prevWeightsCount + (summary.weightsCarryoverApplied ? 1 : 0);
    const effectiveAbsCount = summary.absCount + (summary.absCarryoverApplied ? 1 : 0);
    const prevEffectiveAbsCount = prevAbsCount + (summary.absCarryoverApplied ? 1 : 0);

    const newlySecuredWeight2 = prevEffectiveWeightsCount < 2 && effectiveWeightsCount >= 2;
    const newlySecuredWeight3 = prevEffectiveWeightsCount < 3 && effectiveWeightsCount >= 3;
    const newlySecuredAbs = prevEffectiveAbsCount < 1 && effectiveAbsCount >= 1;

    return { newlySecuredWeight2, newlySecuredWeight3, newlySecuredAbs };
  }, [getWeekSummary, initWeekSummary, setStreakState, updateWeekSummary]);

  const applyCarryoverCredit = useCallback((streakType: "weights" | "abs") => {
    setStreakState((prevStreakState) => {
      if (prevStreakState.generalCarryoverCredits <= 0) {
        toast.error("No carryover credits available.");
        return prevStreakState;
      }

      const summary = getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);

      if (streakType === "weights" && summary.weightsCarryoverApplied) {
        toast.info("Carryover credit already applied to weights for this week.");
        return prevStreakState;
      }
      if (streakType === "abs" && summary.absCarryoverApplied) {
        toast.info("Carryover credit already applied to abs for this week.");
        return prevStreakState;
      }

      const nextSummary: WeekSummary = {
        ...summary,
        weightsCarryoverApplied: streakType === "weights" ? true : summary.weightsCarryoverApplied,
        absCarryoverApplied: streakType === "abs" ? true : summary.absCarryoverApplied,
        updatedAt: new Date().toISOString(),
      };

      updateWeekSummary(nextSummary);

      toast.success(`Carryover credit applied to ${streakType}!`, {
        description: `This week will count as +1 ${streakType} session for streak qualification.`,
      });

      return {
        ...prevStreakState,
        generalCarryoverCredits: prevStreakState.generalCarryoverCredits - 1,
      };
    });
  }, [currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, setStreakState]);

  // A) Normalize legacy sessions ONCE so both desktop + phone count history consistently.
  // - fill didWeights/didAbs if missing
  // - fill completedAt if missing
  // - fill tz if missing
  useEffect(() => {
    const tzFallback = getUserTimezone();

    const needsFix = sessions.some((s) => {
      if (s.status !== "completed") return false;
      const needsCompletedAt = !s.completedAt;
      const needsTz = !s.tz;
      const needsDidWeights = typeof s.didWeights !== "boolean";
      const needsDidAbs = typeof s.didAbs !== "boolean";
      return needsCompletedAt || needsTz || needsDidWeights || needsDidAbs;
    });

    if (!needsFix) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.status !== "completed") return s;

        const next: WorkoutSession = { ...s };

        if (!next.completedAt) next.completedAt = getSessionCompletionTimestamp(next);
        if (!next.tz) next.tz = tzFallback;

        // Some old installs may have didWeights/didAbs missing or always false.
        // Recompute from actual completed sets to match History.
        next.didWeights = inferDidWeights(next);
        next.didAbs = inferDidAbs(next);

        return next;
      })
    );
  }, [sessions, setSessions]);

  // B) ALWAYS derive week summaries from sessions (History is source of truth).
  // This ensures deletions/edits reflect in streaks on every device.
  useEffect(() => {
    const completed = sessions.filter((s) => s.status === "completed");
    const tzFallback = getUserTimezone();
    const byWeek = new Map<string, { weights: number; abs: number }>();

    for (const s of completed) {
      const ts = getSessionCompletionTimestamp(s);
      const tz = getSessionTimezone(s, tzFallback);
      const weekId = getWeekId(new Date(ts), tz);

      const cur = byWeek.get(weekId) ?? { weights: 0, abs: 0 };
      if (s.didWeights) cur.weights += 1;
      if (s.didAbs) cur.abs += 1;
      byWeek.set(weekId, cur);
    }

    setWeekSummaries((prev) => {
      const prevMap = new Map(prev.map((p) => [p.weekId, p]));
      const next: WeekSummary[] = [];

      for (const [weekId, counts] of byWeek.entries()) {
        const existing = prevMap.get(weekId);
        next.push({
          ...(existing ?? initWeekSummary(weekId)),
          weekId,
          weightsCount: counts.weights,
          absCount: counts.abs,
          carryoverEarnedThisWeek: Math.max(0, counts.weights - 3) > 0,
          weightsCarryoverApplied: existing?.weightsCarryoverApplied ?? false,
          absCarryoverApplied: existing?.absCarryoverApplied ?? false,
          carryoverCreditsGranted: existing?.carryoverCreditsGranted ?? 0,
          updatedAt: new Date().toISOString(),
          finalized: existing?.finalized ?? false,
        });
        prevMap.delete(weekId);
      }

      // keep old weeks but zero them out if their sessions are gone
      for (const leftover of prevMap.values()) {
        next.push({
          ...leftover,
          weightsCount: 0,
          absCount: 0,
          carryoverEarnedThisWeek: false,
          updatedAt: new Date().toISOString(),
        });
      }

      return next;
    });

    // Force re-finalization from scratch so streak numbers update after deletes/edits
    setStreakState((prev) => ({
      ...prev,
      weight2Current: 0,
      weight3Current: 0,
      absCurrent: 0,
      lastFinalizedWeekId: undefined,
    }));
  }, [initWeekSummary, sessions, setStreakState, setWeekSummaries]);

  useEffect(() => {
    finalizeUpToCurrentWeek();
  }, [finalizeUpToCurrentWeek]);

  const currentWeekSummary = useMemo(() => {
    return getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);
  }, [currentWeekId, getWeekSummary, initWeekSummary]);

  const effectiveWeightsCountThisWeek =
    currentWeekSummary.weightsCount + (currentWeekSummary.weightsCarryoverApplied ? 1 : 0);
  const effectiveAbsCountThisWeek =
    currentWeekSummary.absCount + (currentWeekSummary.absCarryoverApplied ? 1 : 0);

  // Provisional display streaks (ONE place)
  const qualifiedWeight2ThisWeek = effectiveWeightsCountThisWeek >= 2;
  const qualifiedWeight3ThisWeek = effectiveWeightsCountThisWeek >= 3;
  const qualifiedAbsThisWeek = effectiveAbsCountThisWeek >= 1;

  const currentWeekAlreadyFinalized = streakState.lastFinalizedWeekId === currentWeekId;

  const displayWeight2Current =
    streakState.weight2Current + (!currentWeekAlreadyFinalized && qualifiedWeight2ThisWeek ? 1 : 0);
  const displayWeight3Current =
    streakState.weight3Current + (!currentWeekAlreadyFinalized && qualifiedWeight3ThisWeek ? 1 : 0);
  const displayAbsCurrent =
    streakState.absCurrent + (!currentWeekAlreadyFinalized && qualifiedAbsThisWeek ? 1 : 0);

  const getNextMilestone = useCallback((bestStreak: number) => {
    return (
      MILESTONE_THRESHOLDS.find((m) => m > bestStreak) ??
      MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.length - 1]
    );
  }, []);

  return {
    currentWeekSummary,
    streakState: {
      ...streakState,
      weight2Current: displayWeight2Current,
      weight3Current: displayWeight3Current,
      absCurrent: displayAbsCurrent,
    },
    onWorkoutCompleted,
    finalizeUpToCurrentWeek,
    applyCarryoverCredit,
    effectiveWeightsCountThisWeek,
    effectiveAbsCountThisWeek,
    getNextMilestone,
    recalculateStreaksFromDeletion: () => {},
  };
}