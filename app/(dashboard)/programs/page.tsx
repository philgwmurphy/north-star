"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { programs, getAllPrograms, type RepMaxes } from "@/lib/programs";
import { calculate1RM } from "@/lib/utils";
import { Check } from "lucide-react";

const LIFTS = [
  { key: "squat", name: "Squat", abbrev: "SQ", placeholder: "285" },
  { key: "bench", name: "Bench Press", abbrev: "BP", placeholder: "185" },
  { key: "deadlift", name: "Deadlift", abbrev: "DL", placeholder: "315" },
  { key: "ohp", name: "Overhead Press", abbrev: "OHP", placeholder: "115" },
] as const;

export default function ProgramsPage() {
  const router = useRouter();
  const [repMaxes, setRepMaxes] = useState<Record<string, { weight: string; reps: string }>>({
    squat: { weight: "", reps: "5" },
    bench: { weight: "", reps: "5" },
    deadlift: { weight: "", reps: "5" },
    ohp: { weight: "", reps: "5" },
  });
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [calculated1RMs, setCalculated1RMs] = useState<Record<string, number>>({});

  // Calculate 1RMs when inputs change
  useEffect(() => {
    const newCalculated: Record<string, number> = {};
    Object.entries(repMaxes).forEach(([lift, { weight, reps }]) => {
      const w = parseFloat(weight);
      const r = parseInt(reps);
      if (w && r) {
        newCalculated[lift] = calculate1RM(w, r);
      }
    });
    setCalculated1RMs(newCalculated);
  }, [repMaxes]);

  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          if (data.selectedProgram) {
            setSelectedProgram(data.selectedProgram);
          }
          if (data.repMaxes?.length > 0) {
            const loaded: Record<string, { weight: string; reps: string }> = {};
            data.repMaxes.forEach((rm: { exercise: string; weight: number; reps: number }) => {
              loaded[rm.exercise] = {
                weight: rm.weight.toString(),
                reps: rm.reps.toString(),
              };
            });
            setRepMaxes((prev) => ({ ...prev, ...loaded }));
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    }
    loadData();
  }, []);

  const handleInputChange = (lift: string, field: "weight" | "reps", value: string) => {
    setRepMaxes((prev) => ({
      ...prev,
      [lift]: { ...prev[lift], [field]: value },
    }));
  };

  const handleSave = async () => {
    const allLiftsValid = LIFTS.every((lift) => {
      const { weight, reps } = repMaxes[lift.key];
      return weight && reps && parseFloat(weight) > 0 && parseInt(reps) > 0;
    });

    if (!allLiftsValid) {
      alert("Please fill in all lifts");
      return;
    }

    if (!selectedProgram) {
      alert("Please select a program");
      return;
    }

    setSaving(true);
    try {
      // Save rep maxes
      const repMaxData = LIFTS.map((lift) => ({
        exercise: lift.key,
        weight: parseFloat(repMaxes[lift.key].weight),
        reps: parseInt(repMaxes[lift.key].reps),
        oneRM: calculated1RMs[lift.key],
      }));

      await fetch("/api/user/rep-maxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repMaxData),
      });

      // Save selected program
      await fetch("/api/user/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programKey: selectedProgram }),
      });

      router.push("/");
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-2">
        SET UP YOUR TRAINING
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Enter your rep maxes and select a proven strength program
      </p>

      {/* Rep Max Calculator */}
      <Card variant="gradient" className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide">
              CALCULATE YOUR 1RM
            </h2>
            <Badge variant="advanced">STEP 1</Badge>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Enter a recent lift weight and reps to calculate your estimated one-rep max.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIFTS.map((lift) => (
              <div
                key={lift.key}
                className="bg-[var(--bg-pure-black)] border border-[var(--border-subtle)] rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[var(--bg-elevated)] flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-sm font-bold text-[var(--text-muted)]">
                    {lift.abbrev}
                  </div>
                  <span className="font-semibold">{lift.name}</span>
                </div>

                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={repMaxes[lift.key].weight}
                      onChange={(e) => handleInputChange(lift.key, "weight", e.target.value)}
                      placeholder={lift.placeholder}
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={repMaxes[lift.key].reps}
                      onChange={(e) => handleInputChange(lift.key, "reps", e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] rounded-lg p-3 text-center">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    Est. 1RM
                  </div>
                  <div className="font-[family-name:var(--font-bebas-neue)] text-2xl gradient-text">
                    {calculated1RMs[lift.key] ? `${calculated1RMs[lift.key]} lbs` : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Selection */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide">
          SELECT YOUR PROGRAM
        </h2>
        <Badge variant="advanced">STEP 2</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {getAllPrograms().map(([key, program]) => (
          <Card
            key={key}
            variant={selectedProgram === key ? "gradient" : "interactive"}
            className={`cursor-pointer transition-all ${
              selectedProgram === key ? "ring-2 ring-[var(--accent-primary)]" : ""
            }`}
            onClick={() => setSelectedProgram(key)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{program.name}</h3>
                <Badge variant={program.level}>{program.level}</Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">
                {program.description}
              </p>
              <div className="flex gap-4 pt-3 border-t border-[var(--border-subtle)]">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Days/Week</div>
                  <div className="font-semibold">{program.daysPerWeek}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Cycle</div>
                  <div className="font-semibold">{program.cycleLength}</div>
                </div>
              </div>
              {selectedProgram === key && (
                <div className="mt-4 flex items-center gap-2 text-[var(--accent-primary)] font-semibold">
                  <Check className="w-4 h-4" />
                  Selected
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={saving}
        className="w-full md:w-auto md:min-w-[200px]"
        size="lg"
      >
        Save & Continue
      </Button>
    </div>
  );
}
