import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "YĀTRĀ — AI Travel Planner for India",
  description: "AI-powered travel platform for India. Plan trips, discover destinations, manage budgets, and connect with travel companions.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

import { AuthProvider } from "@/context/AuthContext";
import ChatBotWrapper from "@/components/ChatBotWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, playfair.variable)}>
      <head>
        {/* Mobile PWA / theme color */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning className={cn(
        "min-h-screen font-sans bg-white text-[#484848] antialiased selection:bg-[#FF5A5F]/10 overflow-x-hidden"
      )}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* Top navbar (all breakpoints) */}
            <Navbar />

            {/* Page body: sidebar + main content */}
            <div className="flex min-h-screen pt-16 sm:pt-20">
              {/* Sidebar — desktop only (hidden lg:flex inside component) */}
              <Sidebar />

              {/* Main content area */}
              <main className="flex-1 min-w-0 relative">
                {children}
              </main>
            </div>

            {/* Mobile bottom tab bar */}
            <MobileBottomNav />

            {/* AI Chat bot */}
            <ChatBotWrapper />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
