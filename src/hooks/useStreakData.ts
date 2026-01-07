import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { WeekSummary, StreakState, WorkoutSession } from "@/types/workout";
import { getWeekId, prevWeekId, getWeekIdsBetween, getUserTimezone } from "@/lib/date-utils";
import { toast } from "sonner";
import { addWeeks } from "date-fns";

const WEEK_SUMMARY_KEY = "fittrack_week_summaries";
const STREAK_STATE_KEY = "fittrack_streak_state";
const SESSIONS_KEY = "fittrack_sessions";
const USER_ID = "default";

// bump this when streak data schema changes
const STREAK_MIGRATION_KEY = "fittrack_streak_migration_version";
const STREAK_MIGRATION_VERSION = 2;

const MILESTONE_THRESHOLDS = [4, 8, 12, 16, 24, 36, 52];

function inferDidWeights(session: WorkoutSession) {
  return session.exercises.some(
    (ex) => ex.exercise.category === "weights" && ex.sets.some((s) => s.completed)
  );
}

function inferDidAbs(session: WorkoutSession) {
  return session.exercises.some(
    (ex) => ex.exercise.category === "abs" && ex.sets.some((s) => s.completed)
  );
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
    weightCarryoverCredits: 0,
    absCarryoverCredits: 0,
    weight2MilestoneAwarded: 0,
    weight3MilestoneAwarded: 0,
    absMilestoneAwarded: 0,
  });
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(SESSIONS_KEY, []);

  const userTimezone = useMemo(getUserTimezone, []);
  const currentWeekId = useMemo(() => getWeekId(new Date(), userTimezone), [userTimezone]);

  const getWeekSummary = useCallback(
    (weekId: string): WeekSummary | undefined => {
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

        const effectiveWeightsCount = summary.weightsCount + (summary.weightsCarryoverApplied || 0);
        const effectiveAbsCount = summary.absCount + (summary.absCarryoverApplied || 0);

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

  const applyCarryoverCredit = useCallback(
    (type: "weights" | "abs", target: "this" | "next") => {
      const targetWeekId = target === "this" ? currentWeekId : getNextWeekId(currentWeekId);

      setStreakState((prevStreakState) => {
        const hasCredit =
          type === "weights" ? prevStreakState.weightCarryoverCredits > 0 : prevStreakState.absCarryoverCredits > 0;

        if (!hasCredit) {
          toast.error(`No ${type} bonus tokens available.`);
          return prevStreakState;
        }

        const summary = getWeekSummary(targetWeekId) || initWeekSummary(targetWeekId);

        const nextSummary: WeekSummary = {
          ...summary,
          weightsCarryoverApplied:
            type === "weights" ? (summary.weightsCarryoverApplied || 0) + 1 : summary.weightsCarryoverApplied || 0,
          absCarryoverApplied:
            type === "abs" ? (summary.absCarryoverApplied || 0) + 1 : summary.absCarryoverApplied || 0,
          updatedAt: new Date().toISOString(),
        };

        updateWeekSummary(nextSummary);

        toast.success(`Applied 1 ${type} bonus token`, {
          description: target === "this" ? "Your current week progress was updated." : "Saved for next week.",
        });

        return {
          ...prevStreakState,
          weightCarryoverCredits:
            type === "weights" ? prevStreakState.weightCarryoverCredits - 1 : prevStreakState.weightCarryoverCredits,
          absCarryoverCredits:
            type === "abs" ? prevStreakState.absCarryoverCredits - 1 : prevStreakState.absCarryoverCredits,
        };
      });
    },
    [currentWeekId, getWeekSummary, initWeekSummary, updateWeekSummary, setStreakState]
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

  // Migration for schema changes + legacy sessions
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
      weightCarryoverCredits: (prev as any).weightCarryoverCredits ?? (prev as any).generalCarryoverCredits ?? 0,
      absCarryoverCredits: (prev as any).absCarryoverCredits ?? 0,
      weight2Current: 0,
      weight3Current: 0,
      absCurrent: 0,
      lastFinalizedWeekId: undefined,
    }));

    localStorage.setItem(STREAK_MIGRATION_KEY, String(STREAK_MIGRATION_VERSION));
  }, [setSessions, setStreakState]);

  // Derive week summaries from sessions + grant weekly bonus credits deterministically
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

    // 1) Update summaries (keep applied counts + granted counts)
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
          updatedAt: new Date().toISOString(),
          finalized: existing?.finalized ?? false,
          weightsCarryoverApplied: existing?.weightsCarryoverApplied ?? 0,
          absCarryoverApplied: existing?.absCarryoverApplied ?? 0,
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

      return next;
    });

    // 2) Grant credits into the bank based on deltas vs weekSummary.granted (so you can spend them immediately)
    setStreakState((prev) => {
      let nextState = { ...prev };

      // We'll compute "delta to add" using the CURRENT weekSummaries snapshot.
      // This effect runs again after weekSummaries update, so we keep it stable by relying on existing summary values.
      for (const [weekId, counts] of byWeek.entries()) {
        const existing = getWeekSummary(weekId);
        const existingGrantedWeights = existing?.weightCreditsGranted ?? 0;
        const existingGrantedAbs = existing?.absCreditsGranted ?? 0;

        const shouldHaveGrantedWeights = Math.max(0, counts.weights - 3);
        const shouldHaveGrantedAbs = Math.max(0, counts.abs - 1);

        const addWeights = Math.max(0, shouldHaveGrantedWeights - existingGrantedWeights);
        const addAbs = Math.max(0, shouldHaveGrantedAbs - existingGrantedAbs);

        if (addWeights > 0 || addAbs > 0) {
          const summary = existing ?? initWeekSummary(weekId);
          updateWeekSummary({
            ...summary,
            weightCreditsGranted: existingGrantedWeights + addWeights,
            absCreditsGranted: existingGrantedAbs + addAbs,
            updatedAt: new Date().toISOString(),
          });

          nextState = {
            ...nextState,
            weightCarryoverCredits: nextState.weightCarryoverCredits + addWeights,
            absCarryoverCredits: nextState.absCarryoverCredits + addAbs,
          };
        }
      }

      return nextState;
    });

    // 3) Rebuild streak finalization after edits/deletes
    setStreakState((prev) => ({
      ...prev,
      weight2Current: 0,
      weight3Current: 0,
      absCurrent: 0,
      lastFinalizedWeekId: undefined,
    }));
  }, [getWeekSummary, initWeekSummary, sessions, setStreakState, setWeekSummaries, updateWeekSummary]);

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
    recalculateStreaksFromDeletion: () => {},
  };
}