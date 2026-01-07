import { useStreakData } from "@/hooks/useStreakData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Flame, Trophy, ShieldCheck, Zap, PlusCircle } from "lucide-react"; // Changed to Zap icon
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function StreakDisplay() {
  const { 
    currentWeekSummary, 
    streakState, 
    effectiveWeightsCountThisWeek, 
    effectiveAbsCountThisWeek, // New effective abs count
    applyCarryoverCredit, 
    getNextMilestone 
  } = useStreakData();

  const [selectedCarryoverType, setSelectedCarryoverType] = useState<"weights" | "abs">("weights");

  const provisionalWeight2Current = streakState.weight2Current + (effectiveWeightsCountThisWeek >= 2 ? 1 : 0);
  const provisionalWeight3Current = streakState.weight3Current + (effectiveWeightsCountThisWeek >= 3 ? 1 : 0);
  const provisionalAbsCurrent = streakState.absCurrent + (effectiveAbsCountThisWeek >= 1 ? 1 : 0);

  const weight2Progress = Math.min(100, (effectiveWeightsCountThisWeek / 2) * 100);
  const weight3Progress = Math.min(100, (effectiveWeightsCountThisWeek / 3) * 100);
  const absProgress = Math.min(100, (effectiveAbsCountThisWeek / 1) * 100); // Use effectiveAbsCountThisWeek

  const weight2Qualified = effectiveWeightsCountThisWeek >= 2;
  const weight3Qualified = effectiveWeightsCountThisWeek >= 3;
  const absQualified = effectiveAbsCountThisWeek >= 1; // Use effectiveAbsCountThisWeek

  const nextWeight2Milestone = getNextMilestone(streakState.weight2Best);
  const nextWeight3Milestone = getNextMilestone(streakState.weight3Best);
  const nextAbsMilestone = getNextMilestone(streakState.absBest);

  return (
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
                  <Zap className="h-4 w-4 text-yellow-500" /> Weights ({currentWeekSummary.weightsCount}{currentWeekSummary.weightsCarryoverApplied ? "+1" : ""}/3)
                </span>
                <span className="font-medium">{weight3Progress.toFixed(0)}%</span>
              </div>
              <Progress value={weight3Progress} className="h-2" indicatorColor={weight3Qualified ? "bg-primary" : "bg-orange-500"} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-4 w-4 text-green-500" /> Abs ({currentWeekSummary.absCount}{currentWeekSummary.absCarryoverApplied ? "+1" : ""}/1)
                </span>
                <span className="font-medium">{absProgress.toFixed(0)}%</span>
              </div>
              <Progress value={absProgress} className="h-2" indicatorColor={absQualified ? "bg-primary" : "bg-orange-500"} />
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
            <div className="text-2xl font-bold text-foreground">{provisionalWeight2Current} <span className="text-base text-muted-foreground">weeks</span></div>
            <p className="text-xs text-muted-foreground">Best: {streakState.weight2Best} weeks</p>
            {provisionalWeight2Current < nextWeight2Milestone && (
              <p className="text-xs text-muted-foreground">Next milestone: {nextWeight2Milestone} weeks</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" /> 3x Weights Streak
            </h4>
            <div className="text-2xl font-bold text-foreground">{provisionalWeight3Current} <span className="text-base text-muted-foreground">weeks</span></div>
            <p className="text-xs text-muted-foreground">Best: {streakState.weight3Best} weeks</p>
            {provisionalWeight3Current < nextWeight3Milestone && (
              <p className="text-xs text-muted-foreground">Next milestone: {nextWeight3Milestone} weeks</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-500" /> Abs Streak
            </h4>
            <div className="text-2xl font-bold text-foreground">{provisionalAbsCurrent} <span className="text-base text-muted-foreground">weeks</span></div>
            <p className="text-xs text-muted-foreground">Best: {streakState.absBest} weeks</p>
            {provisionalAbsCurrent < nextAbsMilestone && (
              <p className="text-xs text-muted-foreground">Next milestone: {nextAbsMilestone} weeks</p>
            )}
          </div>
        </div>

        {/* Streak Saves */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" /> Streak Save Tokens
          </h3>
          <p className="text-sm text-muted-foreground">
            Streak Save Tokens let you protect a streak for one missed week. Tokens are earned every 4 successful weeks and can only be used for that same streak.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-red-500" />
              <span>2x: {streakState.weight2SaveTokens}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>3x: {streakState.weight3SaveTokens}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Abs: {streakState.absSaveTokens}</span>
            </div>
          </div>
        </div>

        {/* Carryover Credits */}
        {currentWeekSummary.carryoverEarnedThisWeek && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <PlusCircle className="h-4 w-4" />
            <span>You earned 1 carryover credit this week!</span>
          </div>
        )}
        {streakState.generalCarryoverCredits > 0 && (!currentWeekSummary.weightsCarryoverApplied || !currentWeekSummary.absCarryoverApplied) && (
          <Card className="glass-card border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <PlusCircle className="h-5 w-5" />
                <span>You have {streakState.generalCarryoverCredits} carryover credit{streakState.generalCarryoverCredits > 1 ? "s" : ""}. Apply it to count as +1 session for:</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedCarryoverType} onValueChange={(value: "weights" | "abs") => setSelectedCarryoverType(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {!currentWeekSummary.weightsCarryoverApplied && <SelectItem value="weights">Weights</SelectItem>}
                    {!currentWeekSummary.absCarryoverApplied && <SelectItem value="abs">Abs</SelectItem>}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => applyCarryoverCredit(selectedCarryoverType)} 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
                  disabled={
                    (selectedCarryoverType === "weights" && currentWeekSummary.weightsCarryoverApplied) ||
                    (selectedCarryoverType === "abs" && currentWeekSummary.absCarryoverApplied)
                  }
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}