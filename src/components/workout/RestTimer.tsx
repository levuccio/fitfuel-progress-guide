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
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialSecondsPropRef = useRef(initialSeconds); // To keep track of the original initialSeconds prop

  // Update initialSecondsPropRef when the prop changes
  useEffect(() => {
    initialSecondsPropRef.current = initialSeconds;
  }, [initialSeconds]);

  // Effect to reset timer when initialSeconds prop changes
  useEffect(() => {
    setRemainingSeconds(initialSeconds);
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
    if (!isRunning || isComplete || remainingSeconds <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (remainingSeconds <= 0 && !isComplete) {
        setIsComplete(true);
        setIsRunning(false);
        onComplete?.();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
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
  }, [isRunning, isComplete, remainingSeconds, onComplete]);

  const adjustTime = useCallback((delta: number) => {
    setRemainingSeconds(prev => Math.max(0, prev + delta));
    setIsRunning(true); // Start timer if adjusting time
    setIsComplete(false); // Not complete if adjusting time
  }, []);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(initialSecondsPropRef.current); // Reset to the original initialSeconds prop
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const skipTimer = useCallback(() => {
    setIsComplete(true);
    setIsRunning(false);
    setRemainingSeconds(0);
    onComplete?.();
  }, [onComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const progress = initialSecondsPropRef.current > 0 ? (remainingSeconds / initialSecondsPropRef.current) * 100 : 0;

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
            {formatTime(remainingSeconds)}
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
            disabled={remainingSeconds <= 0}
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