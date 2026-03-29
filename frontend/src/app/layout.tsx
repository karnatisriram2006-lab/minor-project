import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "YĀTRĀ - Modern Heritage Tourism",
  description: "AI-powered premium tourism platform for India with itinerary generation, budget optimization, and more.",
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
      <body className="min-h-screen font-sans bg-white text-[#222222] antialiased selection:bg-[#FF385C]/10">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col relative">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <ChatBotWrapper />
              </div>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
