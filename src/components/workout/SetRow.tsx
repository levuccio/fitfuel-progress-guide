import { useState } from "react";
import { SetLog } from "@/types/workout";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SetRowProps {
  set: SetLog;
  lastSetData?: { reps: number; weight: number };
  onUpdate: (set: SetLog) => void;
  isAbsExercise?: boolean; // New prop to indicate if it's an abs exercise
}

export function SetRow({ set, lastSetData, onUpdate, isAbsExercise = false }: SetRowProps) {
  const handleRepsChange = (value: string) => {
    const reps = parseInt(value) || 0;
    onUpdate({ ...set, reps });
  };

  const handleWeightChange = (value: string) => {
    const weight = parseFloat(value) || 0;
    onUpdate({ ...set, weight });
  };

  const handleCompletedChange = (completed: boolean) => {
    onUpdate({ ...set, completed });
  };

  const getComparison = () => {
    if (isAbsExercise || !lastSetData || !set.completed) return null; // Skip comparison for abs exercises
    
    const weightDiff = set.weight - lastSetData.weight;
    const repsDiff = set.reps - lastSetData.reps;
    
    if (weightDiff > 0 || (weightDiff === 0 && repsDiff > 0)) {
      return "improved";
    } else if (weightDiff < 0 || (weightDiff === 0 && repsDiff < 0)) {
      return "decreased";
    }
    return "same";
  };

  const comparison = getComparison();

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-colors",
      set.completed ? "bg-primary/10" : "bg-secondary/50"
    )}>
      <span className="w-8 text-sm font-medium text-muted-foreground text-center">
        {set.setNumber}
      </span>
      
      <div className={cn("flex-1 grid gap-2", isAbsExercise ? "grid-cols-1" : "grid-cols-2")}>
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Reps"
            value={set.reps || ""}
            onChange={(e) => handleRepsChange(e.target.value)}
            className="h-10 text-center pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            reps
          </span>
        </div>
        {!isAbsExercise && ( // Conditionally render weight input
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Weight"
              value={set.weight || ""}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="h-10 text-center pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              kg
            </span>
          </div>
        )}
      </div>

      {comparison && !isAbsExercise && ( // Conditionally render comparison icon
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

      <Checkbox
        checked={set.completed}
        onCheckedChange={handleCompletedChange}
        className="h-6 w-6"
      />
    </div>
  );
}