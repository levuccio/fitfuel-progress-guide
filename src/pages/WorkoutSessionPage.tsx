import { useState, useEffect, useRef } from "react"; // add useRef
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
import { StreakEarnedDialog } from "@/components/streak/StreakEarnedDialog"; // Import StreakEarnedDialog
import { useStreakData } from "@/hooks/useStreakData"; // Import useStreakData
import { CompactStreakChips } from "@/components/streak/CompactStreakChips"; // Import CompactStreakChips
import { StreakState, WeekSummary } from "@/types/workout"; // Import StreakState and WeekSummary for local storage read
import { getWeekId, getUserTimezone } from "@/lib/date-utils"; // Import date utilities

export default function WorkoutSessionPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { templates, activeSession, startSession, updateActiveSession, completeSession, pauseSession, getLastSessionData } = useWorkoutData();
  const { getNextMilestone } = useStreakData(); // Use useStreakData

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isResting, setIsResting] = useState(false); // New state for global timer
  const [restDuration, setRestDuration] = useState(60); // New state for global timer duration
  const [restTimerKey, setRestTimerKey] = useState(0); // Key to force remount/reset of RestTimer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleteWorkoutDialogOpen, setIsCompleteWorkoutDialogOpen] = useState(false); // State for complete workout dialog

  // Streak dialog states
  const [isStreakEarnedDialogOpen, setIsStreakEarnedDialogOpen] = useState(false);
  const [streakDialogProps, setStreakDialogProps] = useState({
    newlySecuredWeight2: false,
    newlySecuredWeight3: false,
    newlySecuredAbs: false,
    weight2Current: 0,
    weight3Current: 0,
    absCurrent: 0,
    weight2MilestoneReached: undefined as number | undefined,
    weight3MilestoneReached: undefined as number | undefined,
    absMilestoneReached: undefined as number | undefined,
    weight2SaveTokensEarned: 0,
    weight3SaveTokensEarned: 0,
    absSaveTokensEarned: 0,
  });

  const template = templates.find(t => t.id === templateId);
  const lastSessionData = templateId ? getLastSessionData(templateId) : null;

  const didAutoStartRef = useRef(false); // Add useRef for auto-start guard

  useEffect(() => {
    if (!template) return;

    // If we already auto-started once, never auto-start again on this mount
    if (didAutoStartRef.current) return;

    // If there is no active session OR it's for another template, start exactly once
    if (!activeSession || activeSession.templateId !== templateId) {
      didAutoStartRef.current = true;
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
    // Capture current streak state before completing the workout
    const prevStreakState: StreakState = JSON.parse(localStorage.getItem("fittrack_streak_state") || "{}");

    const { completedSession, streakQualification } = completeSession(); // This also calls onWorkoutCompleted internally

    // After session is completed and streak data is updated, read fresh data from localStorage
    const newStreakState: StreakState = JSON.parse(localStorage.getItem("fittrack_streak_state") || "{}");
    const newWeekSummaries: WeekSummary[] = JSON.parse(localStorage.getItem("fittrack_week_summaries") || "[]");

    const currentWeekId = getWeekId(new Date(completedSession.completedAt!), completedSession.tz!);
    const currentWeekSummary = newWeekSummaries.find(ws => ws.weekId === currentWeekId);

    const effectiveWeightsCountThisWeek = (currentWeekSummary?.weightsCount || 0) + (currentWeekSummary?.weightsCarryoverApplied ? 1 : 0);
    const effectiveAbsCountThisWeek = (currentWeekSummary?.absCount || 0) + (currentWeekSummary?.absCarryoverApplied ? 1 : 0);

    const newlySecuredWeight2 = streakQualification?.newlySecuredWeight2 || false;
    const newlySecuredWeight3 = streakQualification?.newlySecuredWeight3 || false;
    const newlySecuredAbs = streakQualification?.newlySecuredAbs || false;

    const weight2MilestoneReached = newStreakState.weight2Best > (prevStreakState.weight2Best || 0) ? newStreakState.weight2Best : undefined;
    const weight3MilestoneReached = newStreakState.weight3Best > (prevStreakState.weight3Best || 0) ? newStreakState.weight3Best : undefined;
    const absMilestoneReached = newStreakState.absBest > (prevStreakState.absBest || 0) ? newStreakState.absBest : undefined;

    const weight2SaveTokensEarned = newStreakState.weight2SaveTokens - (prevStreakState.weight2SaveTokens || 0);
    const weight3SaveTokensEarned = newStreakState.weight3SaveTokens - (prevStreakState.weight3SaveTokens || 0);
    const absSaveTokensEarned = newStreakState.absSaveTokens - (prevStreakState.absSaveTokens || 0);

    if (newlySecuredWeight2 || newlySecuredWeight3 || newlySecuredAbs ||
        weight2MilestoneReached || weight3MilestoneReached || absMilestoneReached ||
        weight2SaveTokensEarned > 0 || weight3SaveTokensEarned > 0 || absSaveTokensEarned > 0) {
      setStreakDialogProps({
        newlySecuredWeight2,
        newlySecuredWeight3,
        newlySecuredAbs,
        weight2Current: newStreakState.weight2Current,
        weight3Current: newStreakState.weight3Current,
        absCurrent: newStreakState.absCurrent,
        weight2MilestoneReached,
        weight3MilestoneReached,
        absMilestoneReached,
        weight2SaveTokensEarned,
        weight3SaveTokensEarned,
        absSaveTokensEarned,
      });
      setIsStreakEarnedDialogOpen(true);
    } else {
      toast.success("Workout Complete!", { description: `${completedSets}/${totalSets} sets in ${formatTime(elapsedTime)}` });
      navigate("/");
    }
  };

  const handleCloseStreakDialog = () => {
    setIsStreakEarnedDialogOpen(false);
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

      {/* Compact Streak Chips */}
      <div className="sticky top-[70px] bg-background z-10 py-2 -mx-4 px-4 md:-mx-6 md:px-6 border-b border-border/50">
        <CompactStreakChips />
      </div>

      {/* Fixed Progress Bar */}
      <div className="sticky top-[120px] bg-background z-10 py-2 -mx-4 px-4 md:-mx-6 md:px-6 border-b border-border/50"> {/* Adjusted top and added negative margin/padding to span full width */}
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

      <StreakEarnedDialog
        isOpen={isStreakEarnedDialogOpen}
        onClose={handleCloseStreakDialog}
        {...streakDialogProps}
      />
    </div>
  );
}