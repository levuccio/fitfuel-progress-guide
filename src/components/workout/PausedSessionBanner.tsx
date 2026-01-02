import { WorkoutSession } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, X, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PausedSessionBannerProps {
  session: WorkoutSession;
  onContinue: () => void;
  onDiscard: () => void;
}

export function PausedSessionBanner({ session, onContinue, onDiscard }: PausedSessionBannerProps) {
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
          <Button onClick={onDiscard} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
