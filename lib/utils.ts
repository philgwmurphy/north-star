import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Calculate estimated 1RM using Epley formula
 */
export function calculate1RM(weight: number, reps: number): number {
  if (!weight || !reps || reps === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Round weight to nearest increment (default 5 lbs)
 */
export function roundWeight(weight: number, increment: number = 5): number {
  return Math.round(weight / increment) * increment;
}

/**
 * Calculate training max (90% of 1RM)
 */
export function calculateTM(oneRM: number): number {
  return roundWeight(oneRM * 0.9);
}

/**
 * Format duration from start time to now
 */
export function formatDuration(startTime: Date | string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}m`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: string = "lbs"): string {
  return `${weight} ${unit}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

/**
 * Calculate total volume (weight * reps * sets)
 */
export function calculateVolume(weight: number, reps: number, sets: number): number {
  return weight * reps * sets;
}

/**
 * Format large numbers (e.g., 15000 -> "15k")
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  }
  return num.toString();
}
