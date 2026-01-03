"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to initialize/reset timer when initialSeconds changes
  useEffect(() => {
    setSeconds(initialSeconds);
    setIsRunning(autoStart); // Restart timer with new initialSeconds
    setIsComplete(false);
    // Clear any existing interval to prevent multiple intervals running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialSeconds, autoStart]);

  // Effect for the countdown logic
  useEffect(() => {
    if (!isRunning || isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
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
  }, [isRunning, isComplete, onComplete]);

  const adjustTime = (delta: number) => {
    setSeconds(prev => Math.max(0, prev + delta));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progress = (seconds / initialSeconds) * 100;

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
            {formatTime(seconds)}
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
            disabled={seconds <= 0}
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

          <Button variant="outline" size="icon" onClick={() => {
            setSeconds(initialSeconds);
            setIsRunning(true);
            setIsComplete(false);
          }}>
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
            onClick={() => {
              setIsComplete(true);
              setIsRunning(false);
              setSeconds(0);
              onComplete?.();
            }}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}