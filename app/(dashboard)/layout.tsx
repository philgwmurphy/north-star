import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pb-24 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
