import { useStreakData } from "@/hooks/useStreakData";
import { Dumbbell, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompactStreakChips() {
  const { streakState, currentWeekSummary, effectiveWeightsCountThisWeek } = useStreakData();

  const provisionalWeight2Current = streakState.weight2Current + (effectiveWeightsCountThisWeek >= 2 ? 1 : 0);
  const provisionalWeight3Current = streakState.weight3Current + (effectiveWeightsCountThisWeek >= 3 ? 1 : 0);
  const provisionalAbsCurrent = streakState.absCurrent + (currentWeekSummary.absCount >= 1 ? 1 : 0);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 2 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Dumbbell className="h-3 w-3" />
        <span>2x: {provisionalWeight2Current}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Dumbbell className="h-3 w-3" />
        <span>3x: {provisionalWeight3Current}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        currentWeekSummary.absCount >= 1 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <HeartPulse className="h-3 w-3" />
        <span>Abs: {provisionalAbsCurrent}w</span>
      </div>
    </div>
  );
}