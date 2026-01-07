import { useStreakData } from "@/hooks/useStreakData";
import { Zap } from "lucide-react"; // Changed to Zap icon
import { cn } from "@/lib/utils";

export function CompactStreakChips() {
  const { streakState, currentWeekSummary, effectiveWeightsCountThisWeek, effectiveAbsCountThisWeek } = useStreakData();

  const provisionalWeight2Current = streakState.weight2Current + (effectiveWeightsCountThisWeek >= 2 ? 1 : 0);
  const provisionalWeight3Current = streakState.weight3Current + (effectiveWeightsCountThisWeek >= 3 ? 1 : 0);
  const provisionalAbsCurrent = streakState.absCurrent + (effectiveAbsCountThisWeek >= 1 ? 1 : 0);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 2 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{provisionalWeight2Current}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 3 ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{provisionalWeight3Current}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveAbsCountThisWeek >= 1 ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{provisionalAbsCurrent}w</span>
      </div>
    </div>
  );
}