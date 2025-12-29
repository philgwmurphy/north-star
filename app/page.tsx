import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dumbbell, BarChart3, Zap } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  // If logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <span className="text-black text-xl font-bold">*</span>
              </div>
              <span className="font-[family-name:var(--font-bebas-neue)] text-2xl tracking-widest text-white">
                NORTH STAR
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <SignInButton mode="modal">
                <Button variant="ghost" className="w-full sm:w-auto">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="w-full sm:w-auto">Get Started</Button>
              </SignUpButton>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-6xl sm:text-8xl tracking-wider mb-6">
            <span className="text-white">STRENGTH</span>
            <br />
            <span className="text-[var(--text-muted)]">TRAINING SYSTEM</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Track your progress with proven programs like Wendler 5/3/1, nSuns, StrongLifts, and more.
            Built for lifters who want results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg px-8">
                <Zap className="w-5 h-5 mr-2" />
                Start Training Free
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-4xl text-center mb-16 text-white">
            EVERYTHING YOU NEED TO GET STRONGER
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Dumbbell className="w-8 h-8" />}
              title="Proven Programs"
              description="Wendler 5/3/1, nSuns, StrongLifts 5x5, GZCLP, Texas Method, and Greyskull LP - all built in."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Track Progress"
              description="Log every set, track your 1RMs, and watch your numbers climb over time."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Quick Start"
              description="One tap to start your workout. Weights calculated automatically based on your maxes."
            />
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-4xl text-center mb-4 text-white">
            PROGRAMS INCLUDED
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-16 max-w-2xl mx-auto">
            Choose from the most effective strength training programs, each with automatic weight calculations.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Wendler 5/3/1", level: "Intermediate", days: 4 },
              { name: "nSuns 5/3/1 LP", level: "Intermediate", days: 5 },
              { name: "StrongLifts 5x5", level: "Beginner", days: 3 },
              { name: "GZCLP", level: "Beginner", days: 4 },
              { name: "Texas Method", level: "Intermediate", days: 3 },
              { name: "Greyskull LP", level: "Beginner", days: 3 },
            ].map((program) => (
              <div
                key={program.name}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 hover:border-[var(--border-active)] transition-colors"
              >
                <h3 className="font-bold text-lg mb-2 text-white">{program.name}</h3>
                <div className="flex gap-4 text-sm text-[var(--text-muted)]">
                  <span>{program.level}</span>
                  <span>{program.days} days/week</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-bebas-neue)] text-5xl mb-6 text-white">
            READY TO GET STRONGER?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-10">
            Join thousands of lifters tracking their gains with North Star.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-10">
              Start Training Free
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[var(--text-muted)] text-sm">
          <p>North Star Strength Training System</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 text-center hover:border-[var(--border-active)] transition-colors">
      <div className="w-16 h-16 mx-auto mb-6 bg-white flex items-center justify-center text-black">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-white">{title}</h3>
      <p className="text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
