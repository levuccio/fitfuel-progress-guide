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
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    if (!isRunning || isComplete) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunnning(false);
          setIsComplete(true);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isComplete]);

  const togglePause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsComplete(false);
    setIsRunning(true);
  }, [initialSeconds]);

  const skipTimer = useCallback(() => {
    setSecondsLeft(0);
    setIsRunning(false);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, []);

  const adjustTime = useCallback((delta: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + delta));
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progress = initialSeconds > 0 ? (secondsLeft / initialSeconds) * 100 : 0;

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