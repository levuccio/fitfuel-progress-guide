"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkoutTimerProps {
  sets: {
    id: string;
    name: string;
    duration: number;
  }[];
  onSetComplete: (setId: string) => void;
  onComplete: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ sets, onSetComplete, onComplete }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSet = sets[currentSetIndex];
  const totalSets = sets.length;

  useEffect(() => {
    if (isRunning && !isPaused) {
      if (timeLeft > 0) {
        intervalRef.current = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        // Set completed
        onSetComplete(currentSet.id);
        if (currentSetIndex < totalSets - 1) {
          // Move to next set
          setCurrentSetIndex(prev => prev + 1);
          // Use user-defined time for all sets except last one (which defaults to 1 minute)
          const nextSet = sets[currentSetIndex + 1];
          setTimeLeft(nextSet.duration > 0 ? nextSet.duration : 60);
        } else {
          // Workout completed
          onComplete();
          setIsRunning(false);
        }
      }
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, currentSetIndex, totalSets, sets, onSetComplete, onComplete, currentSet.id]);

  useEffect(() => {
    // Initialize timer with first set's time
    if (sets.length > 0) {
      const firstSet = sets[0];
      setTimeLeft(firstSet.duration > 0 ? firstSet.duration : 60);
    }
  }, [sets]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    } else {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSetIndex(0);
    if (sets.length > 0) {
      const firstSet = sets[0];
      setTimeLeft(firstSet.duration > 0 ? firstSet.duration : 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSet.duration > 0 
    ? ((currentSet.duration - timeLeft) / currentSet.duration) * 100 
    : ((60 - timeLeft) / 60) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium">
            {currentSet.name}
          </span>
          <span className="text-sm font-medium">
            Set {currentSetIndex + 1} of {totalSets}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="text-6xl font-bold mb-8 text-center">
        {formatTime(timeLeft)}
      </div>

      <div className="flex space-x-4">
        <Button 
          onClick={toggleTimer}
          className="flex items-center space-x-2"
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Start</span>
            </>
          )}
        </Button>
        <Button 
          onClick={resetTimer}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
};

export default WorkoutTimer;