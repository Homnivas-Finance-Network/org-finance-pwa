import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { JourneyProvider } from "@/context/JourneyProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Self-hosted (not next/font/google) — no external fetch at build time,
// works identically in every build environment including Cloudflare Pages.
const displayFont = localFont({
  src: [
    { path: "./fonts/space-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/space-grotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
});

const bodyFont = localFont({
  src: [
    { path: "./fonts/plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plex-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plex-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
});

const monoFont = localFont({
  src: [
    { path: "./fonts/plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Homnivas Finance Network — Know your money, fix your debt",
  description:
    "Take the 5-question quiz, see your financial personality, and get a real plan to clear your loans.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Homnivas Finance Network",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} font-body antialiased bg-bg text-text-primary`}
      >
        <AuthProvider>
          <JourneyProvider>
            <ServiceWorkerRegister />
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
              {children}
            </div>
          </JourneyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
