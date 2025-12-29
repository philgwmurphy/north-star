"use client";

import { useEffect, useState } from "react";
import { QuickStartButton } from "@/components/workout/quick-start-button";
import { CustomStartButton } from "@/components/workout/custom-start-button";
import { Button } from "@/components/ui/button";
import { type RepMaxes } from "@/lib/programs";

interface QuickStartSectionProps {
  programKey: string | null;
  repMaxes: RepMaxes | null;
  nextDay?: string;
}

const dismissKey = "northstar-dismiss-get-started";

export function QuickStartSection({ programKey, repMaxes, nextDay }: QuickStartSectionProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  const needsSetup = !programKey || !repMaxes;

  return (
    <div className="space-y-4">
      {needsSetup ? (
        !dismissed && (
          <div>
            <QuickStartButton programKey={programKey} repMaxes={repMaxes} nextDay={nextDay} />
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
            </div>
          </div>
        )
      ) : (
        <QuickStartButton programKey={programKey} repMaxes={repMaxes} nextDay={nextDay} />
      )}
      <CustomStartButton />
    </div>
  );
}
