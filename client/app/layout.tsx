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
  metadataBase: new URL("https://mvparena.onrender.com"),
  title: "MVP Arena | Professional Esports League for BGMI & Free Fire MAX",
  description:
    "India's premier competitive tournament platform for BGMI and Free Fire MAX. Verified custom rooms, automated standings, anti-cheat protected matches, and instant prize payouts.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/logo.png" },
    ],
  },
  openGraph: {
    title: "MVP Arena | Professional Esports League for BGMI & Free Fire MAX",
    description:
      "India's premier competitive tournament platform for BGMI and Free Fire MAX. Verified custom rooms, automated standings, anti-cheat protected matches, and instant prize payouts.",
    url: "https://mvparena.onrender.com",
    siteName: "MVP Arena",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MVP Arena Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MVP Arena | Professional Esports League for BGMI & Free Fire MAX",
    description:
      "India's premier competitive tournament platform for BGMI and Free Fire MAX.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
