import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Save, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SetRow } from "@/components/workout/SetRow";
import { ExerciseProgressChart } from "@/components/workout/ExerciseProgressChart";
import { ExerciseLog, SetLog, WorkoutSession } from "@/types/workout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PastWorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, updateActiveSession, getLastSessionData, updateSession } = useWorkoutData();

  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId && s.status === "completed");
      if (session) {
        setSessionToEdit(session);
      } else {
        toast.error("Session not found", { description: "The workout session you tried to edit does not exist or is not completed." });
        navigate("/history");
      }
    }
  }, [sessionId, sessions, navigate]);

  const lastSessionData = sessionToEdit ? getLastSessionData(sessionToEdit.templateId) : null;

  if (!sessionToEdit) {
    return <div className="p-4">Loading session...</div>;
  }

  const totalSets = sessionToEdit.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = sessionToEdit.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
  const progress = (completedSets / totalSets) * 100;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
    timeString += `${seconds}s`;
    return timeString.trim();
  };

  const handleSetUpdate = useCallback((exerciseId: string, updatedSet: SetLog) => {
    setSessionToEdit(prevSession => {
      if (!prevSession) return null;
      const updatedExercises = prevSession.exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: ex.sets.map(s => s.id === updatedSet.id ? updatedSet : s) }
          : ex
      );
      return { ...prevSession, exercises: updatedExercises };
    });
  }, []);

  const handleSaveChanges = () => {
    if (!sessionToEdit) return;
    updateSession(sessionToEdit);
    toast.success("Session updated!", { description: `Changes to "${sessionToEdit.templateName}" saved.` });
    navigate("/history");
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/history")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{sessionToEdit.templateName}</h1>
          <p className="text-sm text-muted-foreground">
            {sessionToEdit.startTime && format(new Date(sessionToEdit.startTime), "MMM d, yyyy 'at' h:mm a")}
            {sessionToEdit.totalDuration && ` • ${formatTime(sessionToEdit.totalDuration)}`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedSets}/{totalSets} sets</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3">
        {sessionToEdit.exercises.map((exercise) => {
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

      <div className="fixed bottom-20 md:bottom-4 left-0 right-0 p-4 md:pl-68">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleSaveChanges} className="w-full h-12 text-lg">
            <Save className="h-5 w-5 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}