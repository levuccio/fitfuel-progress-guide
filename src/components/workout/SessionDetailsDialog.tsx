import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExerciseLog, SetLog, WorkoutSession } from "@/types/workout";
import { SetRow } from "@/components/workout/SetRow";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SessionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession;
  onSave: (updatedSession: WorkoutSession) => void;
  lastSessionData?: Record<string, { sets: { reps: number; weight: number }[]; date: string }> | null;
}

export function SessionDetailsDialog({
  isOpen,
  onClose,
  session,
  onSave,
  lastSessionData,
}: SessionDetailsDialogProps) {
  const [editableSession, setEditableSession] = useState<WorkoutSession>(session);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditableSession(session); // Reset editable session when dialog opens
      setExpandedExercise(null); // Collapse all exercises
    }
  }, [isOpen, session]);

  const handleSetUpdate = (exerciseId: string, updatedSet: SetLog) => {
    setEditableSession(prevSession => ({
      ...prevSession,
      exercises: prevSession.exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map(s => (s.id === updatedSet.id ? updatedSet : s)) }
          : ex
      ),
    }));
  };

  const handleSave = () => {
    onSave(editableSession);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{session.templateName}</DialogTitle>
          <DialogDescription>
            Review and edit this completed workout session from {format(new Date(session.startTime), "MMM d, yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4"> {/* Added negative margin to offset scrollbar */}
          <div className="space-y-3">
            {editableSession.exercises.map((exercise) => {
              const isExpanded = expandedExercise === exercise.id;
              const exerciseCompleted = exercise.sets.every(s => s.completed);
              const lastData = lastSessionData?.[exercise.exerciseId];
              const isAbsExercise = exercise.exercise.targetMuscles.some(
                (muscle) => ["Abs", "Core", "Obliques", "Lower Abs"].includes(muscle)
              );

              return (
                <Card key={exercise.id} className={cn("glass-card", exerciseCompleted && "border-success/50")}>
                  <CardHeader className="p-4 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{exercise.exercise.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{exercise.targetSets} × {exercise.targetReps}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exerciseCompleted && <Check className="h-5 w-5" />}
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="p-4 pt-0 space-y-2">
                      {lastData && !isAbsExercise && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Last: {lastData.sets.map(s => `${s.weight}kg×${s.reps}`).join(", ")}
                        </p>
                      )}
                      {exercise.sets.map((set, idx) => (
                        <SetRow
                          key={set.id}
                          set={set}
                          lastSetData={lastData?.sets[idx]}
                          onUpdate={(s) => handleSetUpdate(exercise.id, s)}
                          isAbsExercise={isAbsExercise}
                        />
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}