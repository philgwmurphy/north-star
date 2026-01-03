"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface RestTimerProps {
  defaultSeconds: number;
  triggerKey: number;
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function RestTimer({ defaultSeconds, triggerKey }: RestTimerProps) {
  const minSeconds = 15;
  const maxSeconds = 900;
  const adjustStep = 15;
  const clampBaseSeconds = (value: number) => Math.min(maxSeconds, Math.max(minSeconds, value));
  const clampLeftSeconds = (value: number) => Math.min(maxSeconds, Math.max(0, value));

  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [restSeconds, setRestSeconds] = useState(defaultSeconds);

  useEffect(() => {
    setSecondsLeft(defaultSeconds);
    setRestSeconds(defaultSeconds);
  }, [defaultSeconds]);

  useEffect(() => {
    if (triggerKey === 0) return;
    setSecondsLeft(restSeconds);
    setIsRunning(true);
  }, [triggerKey, restSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleToggle = () => {
    if (secondsLeft <= 0) {
      setSecondsLeft(restSeconds);
      setIsRunning(true);
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setSecondsLeft(restSeconds);
    setIsRunning(false);
  };

  const handleAdjust = (delta: number) => {
    setRestSeconds((prev) => {
      const next = clampBaseSeconds(prev + delta);
      if (isRunning) {
        setSecondsLeft((current) => clampLeftSeconds(current + delta));
      } else {
        setSecondsLeft(next);
      }
      return next;
    });
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Rest Timer</span>
      </div>
      <div className="font-[family-name:var(--font-geist-mono)] text-lg">
        {formatSeconds(secondsLeft)}
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span>Interval</span>
        <span className="font-[family-name:var(--font-geist-mono)] text-white">
          {formatSeconds(restSeconds)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => handleAdjust(-adjustStep)}>
          -15s
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleAdjust(adjustStep)}>
          +15s
        </Button>
      </div>
      <Button size="sm" variant="outline" onClick={handleToggle}>
        {isRunning ? "Pause" : secondsLeft <= 0 ? "Restart" : "Start"}
      </Button>
      <Button size="sm" variant="ghost" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
}
