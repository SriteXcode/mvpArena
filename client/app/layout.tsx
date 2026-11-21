import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ProfileProgressBanner from "@/components/ProfileProgressBanner";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/lib/context/ToastContext";

export const metadata: Metadata = {
  title: "MVP Arena | Professional Esports League for BGMI & Free Fire MAX",
  description:
    "India's premier competitive tournament platform for BGMI and Free Fire MAX. Verified custom rooms, automated standings, anti-cheat protected matches, and instant prize payouts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        suppressHydrationWarning
        className="min-h-screen bg-(--bg-primary) text-(--text-primary) antialiased flex flex-col selection:bg-emerald-500 selection:text-white"
      >
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<div className="h-16 w-full border-b border-(--border-subtle) bg-(--bg-primary)"></div>}>
              <Navbar />
            </Suspense>
            <ProfileProgressBanner />
            <main className="flex-1">
              <Suspense fallback={<div className="p-12 text-center text-xs text-zinc-500 font-mono">Loading Arena...</div>}>
                {children}
              </Suspense>
            </main>
            <Footer />
            <AuthModal />
            <ProfileCompletionModal />
          </ToastProvider>
        </AuthProvider>

        {/* Client-side Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('[SW] Registered: ', reg.scope); },
                    function(err) { console.log('[SW] Registration failed: ', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
