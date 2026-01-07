import { useStreakData } from "@/hooks/useStreakData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Flame, Trophy, ShieldCheck, Zap, Dumbbell, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakDisplay() {
  const { currentWeekSummary, streakState, nextKeepMilestone, nextPerfectMilestone } = useStreakData();

  const keepProgress = Math.min(100, (currentWeekSummary.weightsCount / 2) * 100);
  const perfectProgress = Math.min(100, (currentWeekSummary.weightsCount / 3) * 100);
  const absProgress = Math.min(100, (currentWeekSummary.absCount / 1) * 100);

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
                  <Dumbbell className="h-4 w-4" /> Weights ({currentWeekSummary.weightsCount}/2)
                </span>
                <span className="font-medium">{keepProgress.toFixed(0)}%</span>
              </div>
              <Progress value={keepProgress} className="h-2" indicatorColor={currentWeekSummary.weightsCount >= 2 ? "bg-primary" : "bg-orange-500"} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <HeartPulse className="h-4 w-4" /> Abs ({currentWeekSummary.absCount}/1)
                </span>
                <span className="font-medium">{absProgress.toFixed(0)}%</span>
              </div>
              <Progress value={absProgress} className="h-2" indicatorColor={currentWeekSummary.absCount >= 1 ? "bg-primary" : "bg-orange-500"} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {currentWeekSummary.keepQualified ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={cn(currentWeekSummary.keepQualified ? "text-success" : "text-muted-foreground")}>
                Keep Streak Qualified
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentWeekSummary.perfectQualified ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={cn(currentWeekSummary.perfectQualified ? "text-success" : "text-muted-foreground")}>
                Perfect Streak Qualified
              </span>
            </div>
          </div>
        </div>

        {/* Streaks Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-blue-500" /> Keep Streak
            </h4>
            <div className="text-2xl font-bold text-foreground">{streakState.keepCurrent} <span className="text-base text-muted-foreground">weeks</span></div>
            <p className="text-xs text-muted-foreground">Best: {streakState.keepBest} weeks</p>
            {streakState.keepCurrent < nextKeepMilestone && (
              <p className="text-xs text-muted-foreground">Next milestone: {nextKeepMilestone} weeks</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" /> Perfect Streak
            </h4>
            <div className="text-2xl font-bold text-foreground">{streakState.perfectCurrent} <span className="text-base text-muted-foreground">weeks</span></div>
            <p className="text-xs text-muted-foreground">Best: {streakState.perfectBest} weeks</p>
            {streakState.perfectCurrent < nextPerfectMilestone && (
              <p className="text-xs text-muted-foreground">Next milestone: {nextPerfectMilestone} weeks</p>
            )}
          </div>
        </div>

        {/* Streak Saves */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-purple-500" />
          <span>{streakState.keepStreakSaves} Streak Save Tokens</span>
        </div>
      </CardContent>
    </Card>
  );
}