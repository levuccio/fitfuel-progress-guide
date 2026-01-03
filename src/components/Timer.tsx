"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  initialTime: number;
  onTimeUp?: () => void;
  isRunning?: boolean;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(isRunning || false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isTimerRunning) {
      const startTime = Date.now();
      const timeElapsed = initialTime - timeLeft;
      previousTimeRef.current = startTime - timeElapsed * 1000;
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const timePassed = (currentTime - previousTimeRef.current) / 1000;
        
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - timePassed);
          
          if (newTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          
          previousTimeRef.current = currentTime;
          return newTime;
        });
      }, 100); // Update every 100ms for smoother animation
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, initialTime, onTimeUp]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-6xl font-mono font-bold mb-6">
        {formatTime(timeLeft)}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
          aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
        >
          {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default Timer;