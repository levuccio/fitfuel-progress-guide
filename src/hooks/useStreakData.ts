import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { WeekSummary, StreakState, WorkoutSession } from "@/types/workout";
import { getWeekId, prevWeekId, getWeekIdsBetween, getUserTimezone } from "@/lib/date-utils";
import { toast } from "sonner";
import { addWeeks } from "date-fns";

const WEEK_SUMMARY_KEY = "fittrack_week_summaries";
const STREAK_STATE_KEY = "fittrack_streak_state";
const SESSIONS_KEY = "fittrack_sessions";
const USER_ID = "default";

const STREAK_MIGRATION_KEY = "fittrack_streak_migration_version";
const STREAK_MIGRATION_VERSION = 5;


const MILESTONE_THRESHOLDS = [4, 8, 12, 16, 24, 36, 52];

function inferDidWeights(session: WorkoutSession) {
  return session.exercises.some((ex) => {
    const hasCompletedSets = ex.sets.some((s) => s.completed);
    if (!hasCompletedSets) return false;

    // Primary check: use category if available
    if (ex.exercise.category === "weights") return true;

    // Fallback for legacy sessions: if category is missing, check if any completed set has weight data
    if (!ex.exercise.category) {
      return ex.sets.some((s) => s.completed && s.weight > 0);
    }

    return false;
  });
}

function inferDidAbs(session: WorkoutSession) {
  return session.exercises.some((ex) => {
    const hasCompletedSets = ex.sets.some((s) => s.completed);
    if (!hasCompletedSets) return false;

    // Primary check
    if (ex.exercise.category === "abs") return true;

    // Fallback: check if exercise targets abs/core muscles
    if (!ex.exercise.category) {
      const absRelatedMuscles = ["Abs", "Core", "Obliques", "Lower Abs"];
      return ex.exercise.targetMuscles?.some((m) => absRelatedMuscles.includes(m)) || false;
    }

    return false;
  });
}

function getSessionCompletionTimestamp(session: WorkoutSession) {
  return session.completedAt ?? session.endTime ?? session.startTime;
}

function getSessionTimezone(session: WorkoutSession, tzFallback: string) {
  return session.tz ?? tzFallback;
}

function getNextWeekId(currentWeekId: string) {
  const tz = getUserTimezone();
  const thisWeek = getWeekId(new Date(), tz);
  if (thisWeek !== currentWeekId) return prevWeekId(currentWeekId);
  return getWeekId(addWeeks(new Date(), 1), tz);
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
    // carryover credits are no longer the source of truth; keep them for backward compat but ignore for balance
    weightCarryoverCredits: 0,
    absCarryoverCredits: 0,
    weight2MilestoneAwarded: 0,
    weight3MilestoneAwarded: 0,
    absMilestoneAwarded: 0,
  });
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(SESSIONS_KEY, []);

  // Ref to track latest weekSummaries without triggering effects
  const weekSummariesRef = useRef(weekSummaries);
  useEffect(() => {
    weekSummariesRef.current = weekSummaries;
  }, [weekSummaries]);

  const userTimezone = useMemo(getUserTimezone, []);
  const currentWeekId = useMemo(() => getWeekId(new Date(), userTimezone), [userTimezone]);

  const getWeekSummary = useCallback(
    (weekId: string): WeekSummary | undefined => {
      // Use ref for reading inside callbacks if needed, but here we can use state directly since this 
      // is usually used in event handlers or render path. 
      // However, to be safe and consistent with the "source of truth" problem, let's use the state.
      return weekSummaries.find((ws) => ws.userId === USER_ID && ws.weekId === weekId);
    },
    [weekSummaries]
  );

  const updateWeekSummary = useCallback(
    (summary: WeekSummary) => {
      setWeekSummaries((prev) => {
        const existingIndex = prev.findIndex(
          (ws) => ws.userId === summary.userId && ws.weekId === summary.weekId
        );
        if (existingIndex > -1) {
          const next = [...prev];
          next[existingIndex] = summary;
          return next;
        }
        return [...prev, summary];
      });
    },
    [setWeekSummaries]
  );

  const initWeekSummary = useCallback(
    (weekId: string): WeekSummary => ({
      userId: USER_ID,
      weekId,
      weightsCount: 0,
      absCount: 0,
      weightsCarryoverApplied: 0,
      absCarryoverApplied: 0,
      // these fields are now legacy; we keep them for type compatibility but don't rely on them
      weightCreditsGranted: 0,
      absCreditsGranted: 0,
      finalized: false,
      updatedAt: new Date().toISOString(),
    }),
    []
  );

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

    const w2 = checkAndAward(
      "weight2",
      updatedState.weight2Best,
      updatedState.weight2MilestoneAwarded,
      updatedState.weight2SaveTokens
    );
    updatedState.weight2MilestoneAwarded = w2.newMilestoneAwarded;
    updatedState.weight2SaveTokens = w2.newSaveTokens;

    const w3 = checkAndAward(
      "weight3",
      updatedState.weight3Best,
      updatedState.weight3MilestoneAwarded,
      updatedState.weight3SaveTokens
    );
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
      let weeksToFinalize: string[] = [];

      if (!lastFinalized) {
        const allWeeks = weekSummaries.map((ws) => ws.weekId).sort();
        // If we have history, start from before the first week to ensure it's processed
        if (allWeeks.length > 0) {
          const firstWeek = allWeeks[0];
          // getWeekIdsBetween is safe to call with undefined start, but to be explicit:
          // We want weeksToFinalize to include firstWeek. 
          // getWeekIdsBetween(A, B) returns (A, B].
          // So if we pass prevWeekId(firstWeek), it returns [firstWeek ... B].
          // However, we must ensure consistency with date-utils.
          // Let's assume date-utils handles undefined start by going back enough? 
          // Actually, getWeekIdsBetween(undefined, end) returns [end]. That's the bug.

          // Fix: manually construct the range or rely on a known start.
          // Let's use prevWeekId(firstWeek) as start.
          weeksToFinalize = getWeekIdsBetween(prevWeekId(firstWeek), prevWeekId(currentWeekId));
        }
      } else {
        weeksToFinalize = getWeekIdsBetween(lastFinalized, prevWeekId(currentWeekId));
      }

      if (
        weeksToFinalize.length === 0 &&
        lastFinalized === prevWeekId(currentWeekId)
      ) {
        return prevStreakState;
      }

      for (const weekId of weeksToFinalize) {
        let summary = getWeekSummary(weekId) || initWeekSummary(weekId);

        // If explicitly marking as ignored for rescue, or already finalized, skip
        if (summary.finalized) {
          current.lastFinalizedWeekId = weekId;
          continue;
        }

        const effectiveWeightsCount = summary.weightsCount + (summary.weightsCarryoverApplied || 0);
        const effectiveAbsCount = summary.absCount + (summary.absCarryoverApplied || 0);

        const qualifiedWeight2 = effectiveWeightsCount >= 2;
        const qualifiedWeight3 = effectiveWeightsCount >= 3;
        const qualifiedAbs = effectiveAbsCount >= 1;

        // CHECK FOR RESCUE OPPORTUNITIES
        // Check Weights Rescue
        if (!qualifiedWeight2) {
          // Can we save this?
          // 1. Do we have an Auto-Save token?
          if (current.weight2SaveTokens > 0) {
            current.weight2SaveTokens -= 1;
            current.weight2Current += 1;
            toast.info(`1 Weight 2x Streak Save Token used for week ${weekId}.`);
            // Proceed to finalize as "saved"
          } else {
            // 2. Do we have a Manual Bonus Token (Carryover Credit) available?
            // We need to check the BALANCE. We can't access derived 'weightBonusBalance' easily inside the reducer.
            // However, strictly speaking, if we are here, we are about to RESET the streak.
            // We should PAUSE finalization and return a "Rescue Pending" state.

            // BUT: We need to know if we even HAVE credits.
            // LIMITATION: 'weightBonusBalance' is derived from weekSummaries. 
            // Accessing it inside setStreakState is tricky.
            // WORKAROUND: We will pause and let the EFFECT outside handle the check.
            // OR: We store 'rescuePending' in the state, and the UI decides if it's actionable.

            // Let's check if we've already asked the user about this week
            if (!current.rescueIgnoredWeeks?.includes(weekId)) {
              const missing = Math.max(1, 2 - effectiveWeightsCount);
              // Pause everything!
              return {
                ...current,
                rescueInProgress: {
                  weekId,
                  type: "weights",
                  cost: missing
                }
              };
            }

            // If we are here, rescue was ignored or not possible. Reset streak.
            current.weight2Current = 0;
          }
        } else {
          current.weight2Current += 1;
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

        // Update Bests
        current.weight2Best = Math.max(current.weight2Best, current.weight2Current);
        current.weight3Best = Math.max(current.weight3Best, current.weight3Current);
        current.absBest = Math.max(current.absBest, current.absCurrent);

        summary.finalized = true;
        summary.updatedAt = new Date().toISOString();
        updateWeekSummary(summary);

        current = awardMilestonesAndTokensIfNeeded(current);
        current.lastFinalizedWeekId = weekId;
        // clear rescue state if we successfully moved past
        current.rescueInProgress = undefined;
      }

      return current;
    });
  }, [awardMilestonesAndTokensIfNeeded, currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, setStreakState]);

  // DERIVED BONUS BALANCES (source of truth)
  const weightBonusBalance = useMemo(() => {
    const earned = weekSummaries.reduce(
      (sum, ws) => sum + Math.max(0, ws.weightsCount - 3),
      0
    );
    const applied = weekSummaries.reduce(
      (sum, ws) => sum + (ws.weightsCarryoverApplied || 0),
      0
    );
    return Math.max(0, earned - applied);
  }, [weekSummaries]);

  const absBonusBalance = useMemo(() => {
    const earned = weekSummaries.reduce(
      (sum, ws) => sum + Math.max(0, ws.absCount - 1),
      0
    );
    const applied = weekSummaries.reduce(
      (sum, ws) => sum + (ws.absCarryoverApplied || 0),
      0
    );
    return Math.max(0, earned - applied);
  }, [weekSummaries]);

  const applyCarryoverCredit = useCallback(
    (type: "weights" | "abs", target: "this" | "next") => {
      const targetWeekId = target === "this" ? currentWeekId : getNextWeekId(currentWeekId);

      const hasCredit = type === "weights" ? weightBonusBalance > 0 : absBonusBalance > 0;

      if (!hasCredit) {
        toast.error(`No ${type} bonus tokens available.`);
        return;
      }

      const existing = weekSummaries.find((ws) => ws.weekId === targetWeekId) || initWeekSummary(targetWeekId);

      const nextSummary: WeekSummary = {
        ...existing,
        weightsCarryoverApplied:
          type === "weights"
            ? (existing.weightsCarryoverApplied || 0) + 1
            : existing.weightsCarryoverApplied || 0,
        absCarryoverApplied:
          type === "abs"
            ? (existing.absCarryoverApplied || 0) + 1
            : existing.absCarryoverApplied || 0,
        updatedAt: new Date().toISOString(),
      };

      updateWeekSummary(nextSummary);

      toast.success(`Applied 1 ${type} bonus token`, {
        description: target === "this" ? "Your current week progress was updated." : "Saved for next week.",
      });
    },
    [absBonusBalance, currentWeekId, initWeekSummary, updateWeekSummary, weightBonusBalance, weekSummaries]
  );

  const onWorkoutCompleted = useCallback(
    (completedSession: WorkoutSession) => {
      const tzFallback = getUserTimezone();

      const normalizedNewSession: WorkoutSession = {
        ...completedSession,
        completedAt: completedSession.completedAt ?? getSessionCompletionTimestamp(completedSession),
        tz: completedSession.tz ?? tzFallback,
        didWeights: inferDidWeights(completedSession),
        didAbs: inferDidAbs(completedSession),
      };

      const weekId = getWeekId(new Date(normalizedNewSession.completedAt!), normalizedNewSession.tz!);

      const prevSummary = getWeekSummary(weekId) || initWeekSummary(weekId);

      const prevEffectiveWeights = prevSummary.weightsCount + (prevSummary.weightsCarryoverApplied || 0);
      const prevEffectiveAbs = prevSummary.absCount + (prevSummary.absCarryoverApplied || 0);

      const nextWeightsCount = prevSummary.weightsCount + (normalizedNewSession.didWeights ? 1 : 0);
      const nextAbsCount = prevSummary.absCount + (normalizedNewSession.didAbs ? 1 : 0);

      const nextEffectiveWeights = nextWeightsCount + (prevSummary.weightsCarryoverApplied || 0);
      const nextEffectiveAbs = nextAbsCount + (prevSummary.absCarryoverApplied || 0);

      return {
        newlySecuredWeight2: prevEffectiveWeights < 2 && nextEffectiveWeights >= 2,
        newlySecuredWeight3: prevEffectiveWeights < 3 && nextEffectiveWeights >= 3,
        newlySecuredAbs: prevEffectiveAbs < 1 && nextEffectiveAbs >= 1,
      };
    },
    [getWeekSummary, initWeekSummary]
  );

  // Migration
  useEffect(() => {
    const raw = localStorage.getItem(STREAK_MIGRATION_KEY);
    const current = raw ? Number(raw) : 0;
    if (current >= STREAK_MIGRATION_VERSION) return;

    const tzFallback = getUserTimezone();

    setSessions((prev) =>
      prev.map((s) => {
        if (s.status !== "completed") return s;
        const next: WorkoutSession = { ...s };
        next.completedAt = getSessionCompletionTimestamp(next);
        next.tz = getSessionTimezone(next, tzFallback);
        next.didWeights = inferDidWeights(next);
        next.didAbs = inferDidAbs(next);
        return next;
      })
    );

    setStreakState((prev) => ({
      ...prev,
      weight2Current: 0,
      weight3Current: 0,
      absCurrent: 0,
      lastFinalizedWeekId: undefined,
    }));

    localStorage.setItem(STREAK_MIGRATION_KEY, String(STREAK_MIGRATION_VERSION));
  }, [setSessions, setStreakState]);

  // Rebuild week summaries from sessions (no more manual granting; balances are derived)
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

    // Use REF here to get latest summaries without infinite loop
    const prev = weekSummariesRef.current;

    const prevMap = new Map(prev.map((p) => [p.weekId, p]));
    const next: WeekSummary[] = [];

    for (const [weekId, counts] of byWeek.entries()) {
      const existing = prevMap.get(weekId);
      next.push({
        ...(existing ?? initWeekSummary(weekId)),
        weekId,
        weightsCount: counts.weights,
        absCount: counts.abs,
        updatedAt: new Date().toISOString(),
        finalized: existing?.finalized ?? false,
        weightsCarryoverApplied: existing?.weightsCarryoverApplied ?? 0,
        absCarryoverApplied: existing?.absCarryoverApplied ?? 0,
        // keep any legacy granted fields, but they no longer affect balances
        weightCreditsGranted: existing?.weightCreditsGranted ?? 0,
        absCreditsGranted: existing?.absCreditsGranted ?? 0,
      });
      prevMap.delete(weekId);
    }

    for (const leftover of prevMap.values()) {
      next.push({
        ...leftover,
        weightsCount: 0,
        absCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // Deep compare to avoid unnecessary updates if nothing changed
    // JSON stringify is crude but effective for small objects
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      setWeekSummaries(next);
    }

    // Reset current streaks so finalizeUpToCurrentWeek can rebuild them
    setStreakState((prevState) => ({
      ...prevState,
      weight2Current: 0,
      weight3Current: 0,
      absCurrent: 0,
      lastFinalizedWeekId: undefined,
    }));
  }, [initWeekSummary, sessions, setStreakState, setWeekSummaries]); // weekSummaries intentionally omitted

  useEffect(() => {
    finalizeUpToCurrentWeek();
  }, [finalizeUpToCurrentWeek]);

  const currentWeekSummary = useMemo(() => {
    return getWeekSummary(currentWeekId) || initWeekSummary(currentWeekId);
  }, [currentWeekId, getWeekSummary, initWeekSummary]);

  const effectiveWeightsCountThisWeek =
    currentWeekSummary.weightsCount + (currentWeekSummary.weightsCarryoverApplied || 0);
  const effectiveAbsCountThisWeek =
    currentWeekSummary.absCount + (currentWeekSummary.absCarryoverApplied || 0);

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
    finalizeUpToCurrentWeek,
    applyCarryoverCredit,
    effectiveWeightsCountThisWeek,
    effectiveAbsCountThisWeek,
    getNextMilestone,
    onWorkoutCompleted,
    // NEW: expose derived balances
    weightBonusBalance,
    absBonusBalance,
    recalculateStreaksFromDeletion: () => { },

    // Rescue Helpers
    rescueInProgress: streakState.rescueInProgress,
    performRescue: (weekId: string, type: "weights" | "abs") => {
      // Apply a bonus token safely
      // 1. Apply credit
      // Reuse applyCarryoverCredit logic but with forced weekId

      const existing = weekSummaries.find((ws) => ws.weekId === weekId) || initWeekSummary(weekId);

      const currentWeights = existing.weightsCount + (existing.weightsCarryoverApplied || 0);
      const currentAbs = existing.absCount + (existing.absCarryoverApplied || 0);

      const addWeights = type === "weights" ? Math.max(1, 2 - currentWeights) : 0;
      const addAbs = type === "abs" ? Math.max(1, 1 - currentAbs) : 0;

      const nextSummary: WeekSummary = {
        ...existing,
        weightsCarryoverApplied: (existing.weightsCarryoverApplied || 0) + addWeights,
        absCarryoverApplied: (existing.absCarryoverApplied || 0) + addAbs,
        updatedAt: new Date().toISOString(),
        // Ensure it's NOT finalized so the loop re-processes it
        finalized: false
      };
      updateWeekSummary(nextSummary);

      // Clear rescue state so loop runs again
      setStreakState(prev => ({
        ...prev,
        rescueInProgress: undefined
      }));
      toast.success("Streak Rescued!", { description: "Bonus token applied successfully." });
    },
    ignoreRescue: (weekId: string) => {
      setStreakState(prev => ({
        ...prev,
        rescueInProgress: undefined,
        rescueIgnoredWeeks: [...(prev.rescueIgnoredWeeks || []), weekId]
      }));
    }
  };
}
