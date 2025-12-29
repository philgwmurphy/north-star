import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "North Star | Strength Training System",
  description:
    "Track your strength training progress with proven programs like 5/3/1, nSuns, and more.",
  keywords: [
    "strength training",
    "workout tracker",
    "5/3/1",
    "powerlifting",
    "fitness",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "North Star",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ff3b30",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#111111",
          colorInputText: "#ffffff",
          borderRadius: "12px",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-r from-[#ff3b30] to-[#ff9500] hover:shadow-[0_0_30px_rgba(255,59,48,0.4)]",
          card: "bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)]",
          headerTitle: "text-white",
          headerSubtitle: "text-[#a0a0a5]",
          socialButtonsBlockButton:
            "bg-[#111111] border border-[rgba(255,255,255,0.08)] hover:bg-[#1a1a1a]",
          formFieldInput:
            "bg-[#111111] border border-[rgba(255,255,255,0.08)] text-white",
          footerActionLink: "text-[#ff3b30] hover:text-[#ff9500]",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}
        >
          <div className="bg-pattern" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
