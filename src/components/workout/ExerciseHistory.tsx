
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { format } from "date-fns";

interface ExerciseHistoryProps {
    exerciseId: string;
}

export function ExerciseHistory({ exerciseId }: ExerciseHistoryProps) {
    const { getDetailedExerciseHistory } = useWorkoutData();
    const history = getDetailedExerciseHistory(exerciseId);

    if (history.length === 0) {
        return (
            <div className="text-sm text-muted-foreground text-center py-4 italic">
                No history available for this exercise yet.
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold px-1">Previous Performance</h3>
            <div className="space-y-3">
                {history.map((entry, idx) => (
                    <div key={`${entry.date}-${idx}`} className="bg-card/50 border border-border/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                            {format(new Date(entry.date), "EEE, d MMM yyyy")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {entry.sets.map((set, sIdx) => (
                                <div key={sIdx} className="bg-background border border-border/50 px-2 py-1 rounded text-sm">
                                    <span className="font-semibold">{set.weight}kg</span>
                                    <span className="text-muted-foreground mx-1">x</span>
                                    <span>{set.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
