import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStreakData } from "@/hooks/useStreakData";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Zap, Trophy } from "lucide-react";
import { useMemo } from "react";
import { calculateSessionVolume } from "@/lib/strength-utils";
import { getWeekId, getUserTimezone } from "@/lib/date-utils";

export function StrengthStreakDashboard() {
  const { weightBonusBalance, absBonusBalance, applyCarryoverCredit, currentWeekSummary, effectiveWeightsCountThisWeek, effectiveAbsCountThisWeek } = useStreakData();
  const { sessions } = useWorkoutData();
  
  const currentWeekStats = useMemo(() => {
    const tz = getUserTimezone();
    const currentWeekId = getWeekId(new Date(), tz);
    
    // Filter sessions for this week
    const thisWeekSessions = sessions.filter(s => {
       const date = s.completedAt || s.startTime;
       return getWeekId(new Date(date), tz) === currentWeekId && s.status === "completed";
    });

    const totalVolume = thisWeekSessions.reduce((acc, session) => {
      const sessionVol = session.exercises.reduce((sAcc, ex) => {
         const exVol = calculateSessionVolume(ex.sets as any);
         return sAcc + exVol;
      }, 0);
      return acc + sessionVol;
    }, 0);

    return { totalVolume, count: thisWeekSessions.length };
  }, [sessions]);

  return (
    <div className="space-y-6 pt-6">
      {/* Weekly Strength Report */}
      <Card className="glass-card">
        <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Trophy className="h-5 w-5 text-primary" />
             Weekly Strength Report
           </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{currentWeekStats.totalVolume.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workouts</p>
                <p className="text-2xl font-bold">{currentWeekStats.count}</p>
              </div>
           </div>
           
           {/* Show effective counts with bonuses applied */}
           <div className="mt-4 pt-4 border-t border-border/50">
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-muted-foreground">Weight Sessions (with bonuses)</p>
                 <p className="font-semibold text-primary">
                   {currentWeekSummary.weightsCount}
                   {currentWeekSummary.weightsCarryoverApplied > 0 && (
                     <span className="text-green-600"> +{currentWeekSummary.weightsCarryoverApplied}</span>
                   )}
                   {" = "}{effectiveWeightsCountThisWeek}
                 </p>
               </div>
               <div>
                 <p className="text-muted-foreground">Abs Sessions (with bonuses)</p>
                 <p className="font-semibold text-primary">
                   {currentWeekSummary.absCount}
                   {currentWeekSummary.absCarryoverApplied > 0 && (
                     <span className="text-green-600"> +{currentWeekSummary.absCarryoverApplied}</span>
                   )}
                   {" = "}{effectiveAbsCountThisWeek}
                 </p>
               </div>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Bonus Tokens */}
      {(weightBonusBalance > 0 || absBonusBalance > 0) && (
        <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Bonus Tokens Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weightBonusBalance > 0 && (
              <div className="flex items-center justify-between">
                <div>
                   <p className="font-medium">Weight Bonus ({weightBonusBalance})</p>
                   <p className="text-xs text-muted-foreground">Apply to current week to keep streaks alive.</p>
                </div>
                <Button size="sm" onClick={() => applyCarryoverCredit("weights", "this")}>
                   Apply to This Week
                </Button>
              </div>
            )}
            {absBonusBalance > 0 && (
              <div className="flex items-center justify-between">
                <div>
                   <p className="font-medium">Abs Bonus ({absBonusBalance})</p>
                   <p className="text-xs text-muted-foreground">Apply to current week to keep streaks alive.</p>
                </div>
                <Button size="sm" onClick={() => applyCarryoverCredit("abs", "this")}>
                   Apply to This Week
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
