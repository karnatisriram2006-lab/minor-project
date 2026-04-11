import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import ChatBotWrapper from "@/components/ChatBotWrapper";
import { PageTransition } from "@/components/PageTransition";
import PwaRegistrar from "@/components/PwaRegistrar";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { LanguageProvider } from "@/context/LanguageContext";
import { UpdateAvailableBanner } from "@/components/OfflineComponents";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: { default: "%s | YĀTRĀ — AI Travel Planner for India", template: "%s | YĀTRĀ" },
  description: "AI-powered travel platform for India. Plan trips, discover destinations, manage budgets, and connect with travel companions.",
  openGraph: {
    title: "YĀTRĀ — AI Travel Planner for India",
    description: "AI-powered travel platform for India. Plan trips, discover destinations, manage budgets, and connect with travel companions.",
    type: "website",
    url: "http://localhost:3000",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "YĀTRĀ Travel Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YĀTRĀ — AI Travel Planner for India",
    description: "AI-powered travel platform for India. Plan trips, discover destinations, manage budgets, and connect with travel companions.",
    images: ["/images/og-image.svg"],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html lang="en" suppressHydrationWarning className={cn(inter.className, playfair.className)}>
      <head>
        {/* Mobile PWA / theme color */}
        <meta name="theme-color" content="#E8651A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning className={cn(
        "min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] antialiased selection:bg-[#FF5A5F]/10 overflow-x-hidden"
      )}>
        <OfflineBanner />
        <UpdateAvailableBanner />
        <GlobalErrorBoundary>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <LanguageProvider>
                {/* Top navbar (all breakpoints) */}
                <Navbar />

                {/* Page body: sidebar + main content */}
                <div className="flex min-h-screen pt-16 sm:pt-20">
                  {/* Sidebar — desktop only (hidden lg:flex inside component) */}
                  <Sidebar />

                  {/* Main content area */}
                <main className="flex-1 min-w-0 relative pb-20 sm:pb-0">
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </main>
                </div>

                {/* Mobile bottom tab bar */}
                <MobileBottomNav />

                {/* AI Chat bot */}
                <ChatBotWrapper />
                
                {/* PWA Service Worker */}
                <PwaRegistrar />
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
