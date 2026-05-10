import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";
import SidebarClient from "@/components/SidebarClient";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import ChatBotWrapper from "@/components/ChatBotWrapper";
import { PageTransition } from "@/components/PageTransition";
import PwaRegistrar from "@/components/PwaRegistrar";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { LanguageProvider } from "@/context/LanguageContext";
import { UpdateAvailableBanner } from "@/components/OfflineComponents";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yatra-frontend.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Travel Planner — Smart Indian Itineraries | YĀTRĀ",
    template: "%s | YĀTRĀ",
  },
  description:
    "YĀTRĀ is a smart multilingual AI-powered travel recommendation and route optimization platform for India. Plan trips, discover hidden gems, and manage budgets with AI.",
  keywords: ["AI Travel Planner", "India Tourism", "Itinerary Generator", "Smart Travel", "Budget Travel India", "Yatra", "Travel Recommendations", "Route Optimization"],
  authors: [{ name: "Yatra Team" }],
  creator: "Yatra AI",
  publisher: "Yatra AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AI Travel Planner — Smart Indian Itineraries | YĀTRĀ",
    description:
      "Plan your perfect Indian journey with YĀTRĀ. AI-powered itineraries, real-time nearby discovery, and smart budget management.",
    type: "website",
    url: siteUrl,
    siteName: "YĀTRĀ",
    locale: "en_IN",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "YĀTRĀ — AI Travel Planning for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YĀTRĀ — AI Travel Planner for India",
    description:
      "Plan your perfect Indian journey with AI. Smart itineraries and local discovery.",
    images: ["/images/og-image.svg"],
    creator: "@yatra_ai",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FF5A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.className, playfair.className)}
    >
      <head>
        {/* Mobile PWA / theme color */}
        <meta name="theme-color" content="#E8651A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] antialiased selection:bg-[#FF5A5F]/10 overflow-x-hidden",
        )}
      >
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
                  <SidebarClient />

                  {/* Main content area */}
                  <main className="flex-1 min-w-0 relative pb-20 sm:pb-0">
                    <PageTransition>{children}</PageTransition>
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

        {/* Structured Data (JSON-LD) */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "YĀTRĀ AI",
              "url": "https://yatra-frontend.vercel.app",
              "logo": "https://yatra-frontend.vercel.app/icon-512.svg",
              "sameAs": [
                "https://twitter.com/yatra_ai",
                "https://github.com/karnatisriram2006-lab/minor-project"
              ],
              "description": "AI-powered travel recommendation and route optimization platform for India."
            }),
          }}
        />
        <Script
          id="website-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "YĀTRĀ",
              "url": "https://yatra-frontend.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://yatra-frontend.vercel.app/trip-planner?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
