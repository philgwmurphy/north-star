import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl mb-4 shadow-[0_0_40px_rgba(255,59,48,0.3)]">
            <span className="text-3xl">*</span>
          </div>
          <h1 className="font-[family-name:var(--font-bebas-neue)] text-5xl tracking-wider gradient-text">
            NORTH STAR
          </h1>
          <p className="text-[var(--text-muted)] mt-2">Strength Training System</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-transparent shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
}
