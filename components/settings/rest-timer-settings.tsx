"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RestTimerSettingsProps {
  defaultSeconds: number;
}

export function RestTimerSettings({ defaultSeconds }: RestTimerSettingsProps) {
  const [seconds, setSeconds] = useState(String(defaultSeconds));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = Number(seconds);
    if (!Number.isFinite(parsed)) return;

    const snapped = Math.round(parsed / 15) * 15;
    setSeconds(String(snapped));

    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restTimerDefault: snapped }),
      });
    } catch (error) {
      console.error("Failed to update rest timer:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-3">
      <div>
        <p className="text-sm text-[var(--text-muted)]">Default Rest Timer (seconds)</p>
        <input
          type="number"
          min={30}
          max={600}
          step={15}
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          className="mt-2 w-full max-w-[200px] px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] font-[family-name:var(--font-geist-mono)] focus:border-white focus:outline-none"
        />
      </div>
      <Button onClick={handleSave} loading={saving}>
        Save Rest Timer
      </Button>
    </div>
  );
}
