"use client";

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
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to reset timer when initialSeconds prop changes
  useEffect(() => {
    setSecondsRemaining(initialSeconds);
    setIsRunning(autoStart);
    setIsComplete(false);
    // Clear any existing interval to ensure a clean restart
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialSeconds, autoStart]);

  // Effect for the countdown logic
  useEffect(() => {
    if (!isRunning || isComplete || secondsRemaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (secondsRemaining <= 0 && !isComplete) {
        setIsComplete(true);
        setIsRunning(false);
        onComplete?.();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // This is the last second, so the timer will complete
          setIsComplete(true);
          setIsRunning(false);
          onComplete?.();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isComplete, secondsRemaining, onComplete]);

  const adjustTime = useCallback((delta: number) => {
    setSecondsRemaining(prev => Math.max(0, prev + delta));
    setIsRunning(true); // Start timer if adjusting time
    setIsComplete(false); // Not complete if adjusting time
  }, []);

  const resetTimer = useCallback(() => {
    setSecondsRemaining(initialSeconds); // Reset to the current initialSeconds prop
    setIsRunning(true);
    setIsComplete(false);
  }, [initialSeconds]);

  const skipTimer = useCallback(() => {
    setIsComplete(true);
    setIsRunning(false);
    setSecondsRemaining(0);
    onComplete?.();
  }, [onComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const progress = initialSeconds > 0 ? (secondsRemaining / initialSeconds) * 100 : 0;

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
            {formatTime(secondsRemaining)}
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
            disabled={secondsRemaining <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
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