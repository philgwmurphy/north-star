"use client";

import { BodyWeightChart } from "@/components/body-weight/trend-chart";

interface BodyWeightEntry {
  id: string;
  weight: number;
  unit: string;
  recordedAt: string;
}

interface BodyWeightChartSectionProps {
  entries: BodyWeightEntry[];
}

export function BodyWeightChartSection({ entries }: BodyWeightChartSectionProps) {
  return <BodyWeightChart entries={entries} />;
}
