import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { BodyWeightQuickEntry } from "@/components/body-weight/quick-entry";
import { BodyWeightHistory } from "@/components/body-weight/history";

async function getBodyWeightData(userId: string) {
  const [entries, settings] = await Promise.all([
    prisma.bodyWeight.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 20,
    }),
    prisma.userSettings.findUnique({
      where: { userId },
    }),
  ]);

  return { entries, settings };
}

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { entries, settings } = await getBodyWeightData(userId);
  const latestWeight = entries[0] || null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-8">
        SETTINGS
      </h1>

      {/* Body Weight Section */}
      <section className="mb-8">
        <h2 className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-wide mb-4">
          BODY WEIGHT
        </h2>
        <div className="space-y-4">
          <BodyWeightQuickEntry
            latestWeight={latestWeight ? {
              weight: latestWeight.weight,
              unit: latestWeight.unit,
              recordedAt: latestWeight.recordedAt.toISOString(),
            } : null}
            defaultUnit={settings?.weightUnit || "lbs"}
          />
          <BodyWeightHistory
            entries={entries.map(e => ({
              id: e.id,
              weight: e.weight,
              unit: e.unit,
              recordedAt: e.recordedAt.toISOString(),
              notes: e.notes,
            }))}
          />
        </div>
      </section>

      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none",
            navbar: "bg-[var(--bg-elevated)]",
            navbarButton: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            navbarButtonActive: "text-[var(--accent-primary)]",
            pageScrollBox: "bg-[var(--bg-surface)]",
            formButtonPrimary:
              "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
          },
        }}
      />
    </div>
  );
}
