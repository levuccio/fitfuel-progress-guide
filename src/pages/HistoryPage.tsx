import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, CheckCircle, XCircle, Dumbbell, Pencil } from "lucide-react";
import { formatDurationShort } from "@/lib/utils"; // Import the new utility
import { useState } from "react";
import { toast } from "sonner"; // Using sonner for toasts

export default function HistoryPage() {
  const { sessions, updateSessionDuration } = useWorkoutData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newDurationMinutes, setNewDurationMinutes] = useState<number>(0);
  
  const completedSessions = sessions.filter(s => s.status === "completed");

  const getCompletedSets = (session: typeof sessions[0]) => {
    return session.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
      0
    );
  };

  const getTotalSets = (session: typeof sessions[0]) => {
    return session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const handleEditDuration = (sessionId: string, currentDurationSeconds: number | undefined) => {
    setEditingSessionId(sessionId);
    setNewDurationMinutes(Math.round((currentDurationSeconds || 0) / 60));
    setIsEditDialogOpen(true);
  };

  const handleSaveDuration = () => {
    if (editingSessionId) {
      const newDurationSeconds = newDurationMinutes * 60;
      updateSessionDuration(editingSessionId, newDurationSeconds);
      toast.success("Workout duration updated!");
      setIsEditDialogOpen(false);
      setEditingSessionId(null);
      setNewDurationMinutes(0);
    }
  };

  if (completedSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">Your past workout sessions</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No workouts yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Complete your first workout and it will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-muted-foreground">{completedSessions.length} workouts completed</p>
      </div>

      <div className="space-y-3">
        {completedSessions.map((session) => {
          const completedSets = getCompletedSets(session);
          const totalSets = getTotalSets(session);
          const completionRate = Math.round((completedSets / totalSets) * 100);

          return (
            <Card key={session.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{session.templateName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.startTime), "EEEE, MMM d 'at' h:mm a")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{session.totalDuration ? formatDurationShort(session.totalDuration) : "—"}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleEditDuration(session.id, session.totalDuration)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {completionRate === 100 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className={completionRate === 100 ? "text-success" : "text-warning"}>
                      {completedSets}/{totalSets} sets ({completionRate}%)
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {session.exercises.slice(0, 4).map((ex) => (
                    <span
                      key={ex.id}
                      className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                    >
                      {ex.exercise.name}
                    </span>
                  ))}
                  {session.exercises.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                      +{session.exercises.length - 4} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workout Duration</DialogTitle>
            <DialogDescription>
              Adjust the total duration for this workout session in minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={newDurationMinutes}
                onChange={(e) => setNewDurationMinutes(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
              <span className="col-span-1 text-muted-foreground">minutes</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveDuration}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}