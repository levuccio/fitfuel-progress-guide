import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function RestTimer({ initialSeconds, onComplete, autoStart = true }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(0);

  // Effect to initialize/reset timer when initialSeconds changes
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(autoStart);
    setIsComplete(false);
    endTimeRef.current = Date.now() + initialSeconds * 1000; // Set initial end time
  }, [initialSeconds, autoStart]);

  // Effect for the countdown logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // If resuming, ensure endTimeRef is updated based on current secondsLeft
    if (endTimeRef.current === 0 || endTimeRef.current < Date.now()) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        setIsComplete(true);
        onComplete?.();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 250); // Update every 250ms for smoother UI and accuracy

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onComplete, secondsLeft]); // secondsLeft is here for initial endTimeRef update on resume

  const togglePause = useCallback(() => {
    if (isRunning) {
      // Pausing: calculate remaining time
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      setIsRunning(false);
    } else {
      // Resuming
      endTimeRef.current = Date.now() + secondsLeft * 1000;
      setIsRunning(true);
    }
  }, [isRunning, secondsLeft]);

  const resetTimer = useCallback(() => {
    setSecondsLeft(initialSeconds);
    endTimeRef.current = Date.now() + initialSeconds * 1000;
    setIsComplete(false);
    setIsRunning(true);
  }, [initialSeconds]);

  const skipTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(0);
    setIsRunning(false);
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progress = (secondsLeft / initialSeconds) * 100;

  return (
    <Card className={cn(
      "glass-card transition-all",
      isComplete && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">
            {isComplete ? "Rest Complete!" : "Rest Timer"}
          </p>
          <div className="text-4xl font-bold text-foreground tabular-nums">
            {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isComplete ? "bg-primary" : "bg-primary/50"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustTime(-30)}
            disabled={secondsLeft <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={togglePause}
            disabled={isComplete}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustTime(30)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant={isComplete ? "default" : "outline"}
            size="icon"
            onClick={skipTimer}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}