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
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(defaultSeconds);
  }, [defaultSeconds]);

  useEffect(() => {
    if (triggerKey === 0) return;
    setSecondsLeft(defaultSeconds);
    setIsRunning(true);
  }, [triggerKey, defaultSeconds]);

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
      setSecondsLeft(defaultSeconds);
      setIsRunning(true);
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setSecondsLeft(defaultSeconds);
    setIsRunning(false);
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
      <Button size="sm" variant="outline" onClick={handleToggle}>
        {isRunning ? "Pause" : secondsLeft <= 0 ? "Restart" : "Start"}
      </Button>
      <Button size="sm" variant="ghost" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
}
