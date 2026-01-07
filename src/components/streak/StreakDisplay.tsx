import { useStreakData } from "@/hooks/useStreakData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Flame, Zap, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmApplyType = "weights" | "abs";
type ConfirmApplyTarget = "this" | "next";

export function StreakDisplay() {
  const {
    currentWeekSummary,
    streakState,
    effectiveWeightsCountThisWeek,
    effectiveAbsCountThisWeek,
    applyCarryoverCredit,
    getNextMilestone,
  } = useStreakData();

  const [applyTarget, setApplyTarget] = useState<"this" | "next">("this");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmApplyType>("weights");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmApplyTarget>("this");

  const provisionalWeight2Current = streakState.weight2Current;
  const provisionalWeight3Current = streakState.weight3Current;
  const provisionalAbsCurrent = streakState.absCurrent;

  const weight2Progress = Math.min(100, (effectiveWeightsCountThisWeek / 2) * 100);
  const weight3Progress = Math.min(100, (effectiveWeightsCountThisWeek / 3) * 100);
  const absProgress = Math.min(100, (effectiveAbsCountThisWeek / 1) * 100);

  const weight2Qualified = effectiveWeightsCountThisWeek >= 2;
  const weight3Qualified = effectiveWeightsCountThisWeek >= 3;
  const absQualified = effectiveAbsCountThisWeek >= 1;

  const nextWeight2Milestone = getNextMilestone(streakState.weight2Best);
  const nextWeight3Milestone = getNextMilestone(streakState.weight3Best);
  const nextAbsMilestone = getNextMilestone(streakState.absBest);

  const bonusWeightsEarnedThisWeek = Math.max(0, currentWeekSummary.weightsCount - 3);
  const bonusAbsEarnedThisWeek = Math.max(0, currentWeekSummary.absCount - 1);

  const canApplyWeightsNow = useMemo(() => {
    return streakState.weightCarryoverCredits > 0 || bonusWeightsEarnedThisWeek > 0;
  }, [bonusWeightsEarnedThisWeek, streakState.weightCarryoverCredits]);

  const canApplyAbsNow = useMemo(() => {
    return streakState.absCarryoverCredits > 0 || bonusAbsEarnedThisWeek > 0;
  }, [bonusAbsEarnedThisWeek, streakState.absCarryoverCredits]);

  const requestApply = (type: ConfirmApplyType, target: ConfirmApplyTarget) => {
    setConfirmType(type);
    setConfirmTarget(target);
    setConfirmOpen(true);
  };

  const confirmApply = () => {
    applyCarryoverCredit(confirmType, confirmTarget);
    setConfirmOpen(false);
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Streaks
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Week Progress */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Current Week Progress</h3>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" /> Weights (
                    {currentWeekSummary.weightsCount}
                    {currentWeekSummary.weightsCarryoverApplied ? `+${currentWeekSummary.weightsCarryoverApplied}` : ""}/3)
                  </span>
                  <span className="font-medium">{weight3Progress.toFixed(0)}%</span>
                </div>
                <Progress
                  value={weight3Progress}
                  className="h-2"
                  indicatorColor={weight3Qualified ? "bg-primary" : "bg-orange-500"}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-4 w-4 text-green-500" /> Abs (
                    {currentWeekSummary.absCount}
                    {currentWeekSummary.absCarryoverApplied ? `+${currentWeekSummary.absCarryoverApplied}` : ""}/1)
                  </span>
                  <span className="font-medium">{absProgress.toFixed(0)}%</span>
                </div>
                <Progress
                  value={absProgress}
                  className="h-2"
                  indicatorColor={absQualified ? "bg-primary" : "bg-orange-500"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {weight2Qualified ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(weight2Qualified ? "text-success" : "text-muted-foreground")}>
                  ✅ 2x Weights secured
                </span>
              </div>
              <div className="flex items-center gap-2">
                {weight3Qualified ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(weight3Qualified ? "text-success" : "text-muted-foreground")}>
                  ⭐ 3x Weights secured
                </span>
              </div>
              <div className="flex items-center gap-2">
                {absQualified ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(absQualified ? "text-success" : "text-muted-foreground")}>
                  🧱 Abs secured
                </span>
              </div>
            </div>
          </div>

          {/* Streaks Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4 text-red-500" /> 2x Weights Streak
              </h4>
              <div className="text-2xl font-bold text-foreground">
                {provisionalWeight2Current} <span className="text-base text-muted-foreground">weeks</span>
              </div>
              <p className="text-xs text-muted-foreground">Best: {streakState.weight2Best} weeks</p>
              {provisionalWeight2Current < nextWeight2Milestone && (
                <p className="text-xs text-muted-foreground">Next milestone: {nextWeight2Milestone} weeks</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" /> 3x Weights Streak
              </h4>
              <div className="text-2xl font-bold text-foreground">
                {provisionalWeight3Current} <span className="text-base text-muted-foreground">weeks</span>
              </div>
              <p className="text-xs text-muted-foreground">Best: {streakState.weight3Best} weeks</p>
              {provisionalWeight3Current < nextWeight3Milestone && (
                <p className="text-xs text-muted-foreground">Next milestone: {nextWeight3Milestone} weeks</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500" /> Abs Streak
              </h4>
              <div className="text-2xl font-bold text-foreground">
                {provisionalAbsCurrent} <span className="text-base text-muted-foreground">weeks</span>
              </div>
              <p className="text-xs text-muted-foreground">Best: {streakState.absBest} weeks</p>
              {provisionalAbsCurrent < nextAbsMilestone && (
                <p className="text-xs text-muted-foreground">Next milestone: {nextAbsMilestone} weeks</p>
              )}
            </div>
          </div>

          {/* Bonus tokens earned this week + inline apply buttons */}
          {(bonusWeightsEarnedThisWeek > 0 || bonusAbsEarnedThisWeek > 0) && (
            <div className="space-y-2 text-sm text-primary">
              {bonusWeightsEarnedThisWeek > 0 && (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>
                      You earned {bonusWeightsEarnedThisWeek} weights bonus token
                      {bonusWeightsEarnedThisWeek > 1 ? "s" : ""} this week!
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={() => requestApply("weights", "this")}
                    disabled={!canApplyWeightsNow}
                  >
                    Apply weight bonus (this week)
                  </Button>
                </div>
              )}

              {bonusAbsEarnedThisWeek > 0 && (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>
                      You earned {bonusAbsEarnedThisWeek} abs bonus token
                      {bonusAbsEarnedThisWeek > 1 ? "s" : ""} this week!
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={() => requestApply("abs", "this")}
                    disabled={!canApplyAbsNow}
                  >
                    Apply abs bonus (this week)
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Apply bonus tokens (full control) */}
          {(streakState.weightCarryoverCredits > 0 || streakState.absCarryoverCredits > 0) && (
            <Card className="glass-card border-blue-500/50 bg-blue-500/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-blue-500">
                    <PlusCircle className="h-5 w-5" />
                    <span>
                      Bonus tokens: Weights {streakState.weightCarryoverCredits} • Abs{" "}
                      {streakState.absCarryoverCredits}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={applyTarget} onValueChange={(v) => setApplyTarget(v as "this" | "next")}>
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue placeholder="Apply to" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this">This week</SelectItem>
                        <SelectItem value="next">Next week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => requestApply("weights", applyTarget)}
                    variant="outline"
                    className="text-blue-500 border-blue-500 hover:bg-blue-500/10 flex-1"
                    disabled={streakState.weightCarryoverCredits <= 0}
                  >
                    Apply 1 weights token to {applyTarget === "this" ? "this week" : "next week"}
                  </Button>
                  <Button
                    onClick={() => requestApply("abs", applyTarget)}
                    variant="outline"
                    className="text-blue-500 border-blue-500 hover:bg-blue-500/10 flex-1"
                    disabled={streakState.absCarryoverCredits <= 0}
                  >
                    Apply 1 abs token to {applyTarget === "this" ? "this week" : "next week"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply bonus token?</AlertDialogTitle>
            <AlertDialogDescription>
              This will apply <span className="font-medium">1 {confirmType}</span> bonus token to{" "}
              <span className="font-medium">{confirmTarget === "this" ? "this week" : "next week"}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApply}>Yes, apply it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}