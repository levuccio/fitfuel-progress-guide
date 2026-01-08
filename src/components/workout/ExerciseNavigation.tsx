
import { ExerciseLog } from "@/types/workout";
import { cn } from "@/lib/utils";

interface ExerciseNavigationProps {
    exercises: ExerciseLog[];
    activeExerciseId: string;
    onSelect: (id: string) => void;
}

export function ExerciseNavigation({ exercises, activeExerciseId, onSelect }: ExerciseNavigationProps) {
    return (
        <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 scrollbar-hide snap-x">
            {exercises.map((exercise) => {
                const isCompleted = exercise.sets.every((s) => s.completed);
                const isActive = activeExerciseId === exercise.id;

                return (
                    <button
                        key={exercise.id}
                        onClick={() => onSelect(exercise.id)}
                        className={cn(
                            "flex-shrink-0 snap-start px-4 py-3 rounded-xl border transition-all duration-200 min-w-[120px] text-left relative overflow-hidden",
                            isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                : "bg-card hover:bg-accent/50 border-border text-card-foreground",
                            !isActive && isCompleted && "border-success ring-1 ring-success/50" // Green rim for completed
                        )}
                    >
                        {/* Green Glow/Rim Effect if completed & not active (active already has strong color) */}
                        {!isActive && isCompleted && (
                            <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(34,197,94,0.5)]" />
                        )}

                        <div className="text-sm font-medium truncate w-full mb-1">
                            {exercise.exercise.name}
                        </div>
                        <div className={cn("text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} Sets
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
