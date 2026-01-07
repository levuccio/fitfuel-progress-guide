import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SetRow } from "@/components/workout/SetRow";
import { RestTimer } from "@/components/workout/RestTimer";
import { ExerciseProgressChart } from "@/components/workout/ExerciseProgressChart";
import { SetLog } from "@/types/workout";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Using sonner for toasts
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

export default function WorkoutSessionPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { templates, activeSession, startSession, updateActiveSession, completeSession, pauseSession, getLastSessionData } = useWorkoutData();

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isResting, setIsResting] = useState(false); // New state for global timer
  const [restDuration, setRestDuration] = useState(60); // New state for global timer duration
  const [restTimerKey, setRestTimerKey] = useState(0); // Key to force remount/reset of RestTimer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleteWorkoutDialogOpen, setIsCompleteWorkoutDialogOpen] = useState(false); // State for complete workout dialog

  const template = templates.find(t => t.id === templateId);
  const lastSessionData = templateId ? getLastSessionData(templateId) : null;

  useEffect(() => {
    if (!template) return;
    if (!activeSession || activeSession.templateId !== templateId) {
      startSession(template);
    }
  }, [template, templateId, activeSession, startSession]);

  useEffect(() => {
    if (!activeSession || activeSession.status !== "in_progress") return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!template || !activeSession) {
    return <div className="p-4">Loading...</div>;
  }

  const totalSets = activeSession.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = activeSession.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const handleSetUpdate = (exerciseId: string, updatedSet: SetLog) => {
    const currentExercise = activeSession.exercises.find(e => e.id === exerciseId);
    const currentSet = currentExercise?.sets.find(s => s.id === updatedSet.id);
    const wasJustCompleted = updatedSet.completed && !currentSet?.completed;
    
    const updatedExercises = activeSession.exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.map(s => s.id === updatedSet.id ? updatedSet : s) }
        : ex
    );
    updateActiveSession({ ...activeSession, exercises: updatedExercises });

    if (wasJustCompleted) {
      const exerciseRestSeconds = activeSession.exercises.find(ex => ex.id === exerciseId)?.restSeconds || 60;
      const isLastSetOfExercise = updatedSet.setNumber === (currentExercise?.sets.length || 0);

      // Start global timer
      setRestDuration(isLastSetOfExercise ? 60 : exerciseRestSeconds);
      setIsResting(true);
      setRestTimerKey(prev => prev + 1); // Force remount/reset
    }
  };

  const handleRestTimerComplete = () => {
    setIsResting(false);
  };

  const handleCompleteWorkout = () => {
    completeSession();
    toast.success("Workout Complete!", { description: `${completedSets}/${totalSets} sets in ${formatTime(elapsedTime)}` });
    navigate("/");
  };

  return (
    <div className="space-y-4 pb-24"> {/* Added pb-24 for fixed timer at bottom */}
      <div className="flex items-center gap-3 sticky top-0 bg-background z-10 py-2"> {/* Made header sticky */}
        <Button variant="ghost" size="icon" onClick={() => { pauseSession(); navigate("/"); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{activeSession.templateName}</h1>
          <p className="text-sm text-muted-foreground">{formatTime(elapsedTime)} elapsed</p>
        </div>
        <Button 
          onClick={() => setIsCompleteWorkoutDialogOpen(true)} 
          className="h-9 px-4" 
          disabled={completedSets === 0}
        >
          <Check className="h-4 w-4 mr-2" /> Complete
        </Button>
      </div>

      {/* Fixed Progress Bar */}
      <div className="sticky top-[70px] bg-background z-10 py-2 -mx-4 px-4 md:-mx-6 md:px-6 border-b border-border/50"> {/* Adjusted top and added negative margin/padding to span full width */}
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedSets}/{totalSets} sets ({progress.toFixed(0)}%)</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3 pt-4"> {/* Added pt-4 to account for fixed progress bar */}
        {activeSession.exercises.map((exercise) => {
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
                  {!isAbsExercise && <ExerciseProgressChart exerciseId={exercise.exerciseId} />}

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

      {/* Fixed Rest Timer at the bottom */}
      {isResting && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:pl-68 bg-background border-t border-border/50 safe-bottom z-50">
          <div className="max-w-4xl mx-auto">
            <RestTimer 
              key={restTimerKey} 
              initialSeconds={restDuration} 
              onComplete={handleRestTimerComplete}
              autoStart={true}
            />
          </div>
        </div>
      )}

      <AlertDialog open={isCompleteWorkoutDialogOpen} onOpenChange={setIsCompleteWorkoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this workout? You have completed {completedSets} out of {totalSets} sets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteWorkout}>
              Complete Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}