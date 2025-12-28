import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-bebas-neue)] text-4xl tracking-wider mb-8">
        SETTINGS
      </h1>

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
