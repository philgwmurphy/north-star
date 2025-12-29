"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface BodyWeightEntry {
  id: string;
  weight: number;
  unit: string;
  recordedAt: string;
  notes: string | null;
}

interface BodyWeightHistoryProps {
  entries: BodyWeightEntry[];
}

export function BodyWeightHistory({ entries }: BodyWeightHistoryProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/user/body-weight/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        No weight entries yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-geist-mono)] text-lg">
              {entry.weight}
            </span>
            <span className="text-[var(--text-muted)] text-sm">
              {entry.unit}
            </span>
            <span className="text-[var(--text-muted)] text-sm">
              {formatRelativeTime(entry.recordedAt)}
            </span>
          </div>
          <button
            onClick={() => handleDelete(entry.id)}
            disabled={deletingId === entry.id}
            className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
