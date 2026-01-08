import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { calculateE10RM, calculateSessionVolume } from "@/lib/strength-utils";
import { SetLog } from "@/types/workout";

interface StrengthChipBarProps {
  exerciseId: string;
  sets: SetLog[];
}

export function StrengthChipBar({ exerciseId, sets }: StrengthChipBarProps) {
  const { sessions } = useWorkoutData();

  const stats = useMemo(() => {
    const completedSets = sets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
    
    if (completedSets.length === 0) {
      return { currentBest10RM: 0, prev10RM: 0, currentVolume: 0, hasHistory: false };
    }

    const currentBest10RM = Math.max(...completedSets.map(s => calculateE10RM(s.weight, s.reps)));
    const currentVolume = calculateSessionVolume(completedSets);

    // Find previous sessions with this exercise
    const previousSessions = sessions
      .filter(s => s.status === "completed")
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(1); // Skip current session

    let prev10RM = 0;
    for (const session of previousSessions) {
      const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exercise) {
        const prevSets = exercise.sets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
        if (prevSets.length > 0) {
          prev10RM = Math.max(...prevSets.map(s => calculateE10RM(s.weight, s.reps)));
          break;
        }
      }
    }

    return { currentBest10RM, prev10RM, currentVolume, hasHistory: prev10RM > 0 };
  }, [exerciseId, sets, sessions]);

  const { currentBest10RM, prev10RM, currentVolume, hasHistory } = stats;

  const diffPercent = hasHistory && prev10RM > 0 
    ? ((currentBest10RM - prev10RM) / prev10RM) * 100 
    : 0;

  const comparison = diffPercent > 0.5 ? "improved" : diffPercent < -0.5 ? "decreased" : "same";

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {/* e10RM */}
      <Badge variant="outline" className="flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        <span>e10RM: {currentBest10RM > 0 ? currentBest10RM.toFixed(1) : (hasHistory ? prev10RM.toFixed(1) : "-")} kg</span>
      </Badge>

      {/* Trend */}
      {hasHistory && currentBest10RM > 0 && (
        <Badge 
          variant="outline"
          className={`flex items-center gap-1 border-0 ${
            comparison === "improved" ? "bg-green-500/10 text-green-600" :
            comparison === "decreased" ? "bg-red-500/10 text-red-600" :
            "bg-muted text-muted-foreground"
          }`}
        >
          {comparison === "improved" ? <TrendingUp className="h-3 w-3" /> : 
           comparison === "decreased" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          <span>
             {diffPercent > 0 ? "+" : ""}{diffPercent.toFixed(1)}% vs last
          </span>
        </Badge>
      )}

      {/* Volume */}
      <Badge variant="outline" className="flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        <span>Vol: {currentVolume} kg</span>
      </Badge>
    </div>
  );
}
