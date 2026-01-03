"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Pause, Play, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SetRow } from "@/components/workout/SetRow";
import { RestTimer } from "@/components/workout/RestTimer"; // Re-using the existing RestTimer
import { ExerciseLog, SetLog } from "@/types/workout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function WorkoutSessionPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, activeSession, startSession, updateActiveSession, completeSession, pauseSession, getLastSessionData } = useWorkoutData();

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(180); // Default rest seconds
  const [elapsedTime, setElapsedTime] = useState(0);

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
  const progress = (completedSets / totalSets) * 100;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const handleSetUpdate = (exerciseId: string, updatedSet: SetLog) => {
    const currentExerciseLog = activeSession.exercises.find(e => e.id === exerciseId);
    if (!currentExerciseLog) return;

    const wasJustCompleted = updatedSet.completed && !currentExerciseLog.sets.find(s => s.id === updatedSet.id)?.completed;
    
    const updatedExercises = activeSession.exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.map(s => s.id === updatedSet.id ? updatedSet : s) }
        : ex
    );
    updateActiveSession({ ...activeSession, exercises: updatedExercises });

    if (wasJustCompleted) {
      // Check if this was the last set of the current exercise
      const isLastSetOfExercise = updatedSet.setNumber === currentExerciseLog.sets.length;
      
      if (isLastSetOfExercise) {
        setRestSeconds(60); // 1 minute rest after the last set of an exercise
      } else {
        setRestSeconds(currentExerciseLog.restSeconds); // User-defined rest for other sets
      }
      setShowRestTimer(true);
    }
  };

  const handleComplete = () => {
    completeSession();
    toast({ title: "Workout Complete!", description: `${completedSets}/${totalSets} sets in ${formatTime(elapsedTime)}` });
    navigate("/");
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { pauseSession(); navigate("/"); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{activeSession.templateName}</h1>
          <p className="text-sm text-muted-foreground">{formatTime(elapsedTime)} elapsed</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedSets}/{totalSets} sets</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {showRestTimer && (
        <RestTimer initialSeconds={restSeconds} onComplete={() => setShowRestTimer(false)} />
      )}

      <div className="space-y-3">
        {activeSession.exercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.id;
          const exerciseCompleted = exercise.sets.every(s => s.completed);
          const lastData = lastSessionData?.[exercise.exerciseId];

          return (
            <Card key={exercise.id} className={cn("glass-card", exerciseCompleted && "border-success/50")}>
              <CardHeader className="p-4 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{exercise.exercise.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{exercise.targetSets} × {exercise.targetReps}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {exerciseCompleted && <Check className="h-5 w-5 text-success" />}
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-4 pt-0 space-y-2">
                  {lastData && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Last: {lastData.sets.map(s => `${s.weight}kg×${s.reps}`).join(", ")}
                    </p>
                  )}
                  {exercise.sets.map((set, idx) => (
                    <SetRow key={set.id} set={set} lastSetData={lastData?.sets[idx]} onUpdate={(s) => handleSetUpdate(exercise.id, s)} />
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-20 md:bottom-4 left-0 right-0 p-4 md:pl-68">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleComplete} className="w-full h-12 text-lg" disabled={completedSets === 0}>
            <Check className="h-5 w-5 mr-2" /> Complete Workout
          </Button>
        </div>
      </div>
    </div>
  );
}