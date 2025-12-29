"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface BodyWeightEntry {
  id: string;
  weight: number;
  unit: string;
  recordedAt: string;
}

interface BodyWeightChartProps {
  entries: BodyWeightEntry[];
}

export function BodyWeightChart({ entries }: BodyWeightChartProps) {
  // Reverse to show oldest first (left to right)
  const data = [...entries].reverse().map((entry) => ({
    date: new Date(entry.recordedAt).getTime(),
    weight: entry.weight,
    label: formatDate(entry.recordedAt),
  }));

  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-subtle)]">
        Log at least 2 weights to see trend chart
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.1 || 5;

  return (
    <div className="h-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={{ stroke: "#333" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]}
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={{ stroke: "#333" }}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 0,
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [`${value} lbs`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#fff"
            strokeWidth={2}
            dot={{ fill: "#fff", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
