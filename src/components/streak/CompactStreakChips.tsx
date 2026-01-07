import { useStreakData } from "@/hooks/useStreakData";
import { Zap } from "lucide-react"; // Changed to Zap icon
import { cn } from "@/lib/utils";

export function CompactStreakChips() {
  const { streakState, effectiveWeightsCountThisWeek, effectiveAbsCountThisWeek } = useStreakData();

  // useStreakData already returns provisional current streaks
  const w2 = streakState.weight2Current;
  const w3 = streakState.weight3Current;
  const abs = streakState.absCurrent;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 2 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{w2}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveWeightsCountThisWeek >= 3 ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{w3}w</span>
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        effectiveAbsCountThisWeek >= 1 ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
      )}>
        <Zap className="h-3 w-3" />
        <span>{abs}w</span>
      </div>
    </div>
  );
}