import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Offline</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        It looks like you&apos;ve lost your internet connection. Please check
        your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-gradient-to-r from-[#ff3b30] to-[#ff9500] text-white font-medium hover:shadow-[0_0_30px_rgba(255,59,48,0.4)] transition-shadow"
      >
        Try Again
      </button>
    </div>
  );
}
