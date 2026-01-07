import { WorkoutSession } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, X, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react"; // Import useState
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

interface PausedSessionBannerProps {
  session: WorkoutSession;
  onContinue: () => void;
  onDiscard: () => void;
}

export function PausedSessionBanner({ session, onContinue, onDiscard }: PausedSessionBannerProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false); // New state for discard dialog

  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <Card className="glass-card border-warning/50 bg-warning/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Paused Workout</h3>
            <p className="text-sm text-muted-foreground">
              {session.templateName} • {completedSets}/{totalSets} sets • Started{" "}
              {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={onContinue} className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Continue
          </Button>
          <Button onClick={() => setIsDiscardDialogOpen(true)} variant="outline" size="icon"> {/* Open dialog on click */}
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard this paused workout? All progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { onDiscard(); setIsDiscardDialogOpen(false); }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}