import { useState, useMemo } from "react";
import { SetLog } from "@/types/workout";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { calculateE10RM } from "@/lib/strength-utils";
import { useStrengthAnalytics } from "@/hooks/useStrengthAnalytics";

interface SetRowProps {
  set: SetLog;
  lastSetData?: { reps: number; weight: number };
  onUpdate: (set: SetLog) => void;
  isAbsExercise?: boolean;
  exerciseId?: string;
}

export function SetRow({ set, lastSetData, onUpdate, isAbsExercise = false, exerciseId }: SetRowProps) {
  const [localWeight, setLocalWeight] = useState(set.weight?.toString() || "");
  const [localReps, setLocalReps] = useState(set.reps?.toString() || "");
  
  const { getExerciseStats } = useStrengthAnalytics();

  // Calculate live e10RM preview
  const livePreview = useMemo(() => {
    if (isAbsExercise || !exerciseId || set.completed) return null;
    
    const weight = parseFloat(localWeight) || 0;
    const reps = parseInt(localReps) || 0;
    
    if (weight <= 0 || reps <= 0) return null;
    
    const projectedE10RM = calculateE10RM(weight, reps);
    const stats = getExerciseStats(exerciseId);
    const currentBest = stats?.best10RM || 0;
    
    if (currentBest === 0) {
      return {
        projected: projectedE10RM,
        diff: 0,
        status: "new" as const,
      };
    }
    
    const diff = projectedE10RM - currentBest;
    const status = diff > 0.5 ? "improved" : diff < -0.5 ? "decreased" : "same";
    
    return {
      projected: projectedE10RM,
      diff,
      status,
    };
  }, [localWeight, localReps, isAbsExercise, exerciseId, set.completed, getExerciseStats]);

  const handleWeightChange = (value: string) => {
    setLocalWeight(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdate({ ...set, weight: numValue });
    }
  };

  const handleRepsChange = (value: string) => {
    setLocalReps(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      onUpdate({ ...set, reps: numValue });
    }
  };

  const handleCompletedChange = (checked: boolean) => {
    onUpdate({ ...set, completed: checked });
  };

  // Comparison with last session
  let comparison: "improved" | "decreased" | "same" | null = null;
  if (!isAbsExercise && lastSetData && set.completed) {
    const weightDiff = set.weight - lastSetData.weight;
    const repsDiff = set.reps - lastSetData.reps;

    if (weightDiff > 0 || (weightDiff === 0 && repsDiff > 0)) {
      comparison = "improved";
    } else if (weightDiff < 0 || (weightDiff === 0 && repsDiff < 0)) {
      comparison = "decreased";
    } else {
      comparison = "same";
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors",
          set.completed ? "bg-primary/10" : "bg-secondary/50"
        )}
      >
        {comparison && !isAbsExercise && (
          <div className="w-6">
            {comparison === "improved" && (
              <TrendingUp className="h-4 w-4 text-success" />
            )}
            {comparison === "decreased" && (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            {comparison === "same" && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}

        <span className="w-8 text-sm font-medium text-muted-foreground text-center">
          {set.setNumber}
        </span>

        <div className={cn("flex-1 grid gap-2", isAbsExercise ? "grid-cols-1" : "grid-cols-2")}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Reps"
            value={localReps}
            onChange={(e) => handleRepsChange(e.target.value)}
            disabled={set.completed}
            className="h-9 text-center"
          />
          {!isAbsExercise && (
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Weight (kg)"
              value={localWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              disabled={set.completed}
              className="h-9 text-center"
              step="0.5"
            />
          )}
        </div>

        <Checkbox
          checked={set.completed}
          onCheckedChange={handleCompletedChange}
          className="h-6 w-6"
          aria-label="Mark set as complete"
        />
      </div>

      {/* Live e10RM Preview */}
      {livePreview && !set.completed && (
        <div className="pl-10">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 text-xs",
              livePreview.status === "improved" && "bg-green-500/10 text-green-700 border-green-500/20",
              livePreview.status === "decreased" && "bg-red-500/10 text-red-700 border-red-500/20",
              livePreview.status === "same" && "bg-muted text-muted-foreground",
              livePreview.status === "new" && "bg-blue-500/10 text-blue-700 border-blue-500/20"
            )}
          >
            <Target className="h-3 w-3" />
            <span className="font-medium">
              Projected e10RM: {livePreview.projected.toFixed(1)}kg
            </span>
            {livePreview.status !== "new" && (
              <span className="text-xs">
                ({livePreview.diff > 0 ? "+" : ""}{livePreview.diff.toFixed(1)}kg)
              </span>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}
