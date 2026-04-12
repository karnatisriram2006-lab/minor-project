"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { User as FirebaseUser } from "firebase/auth"
import {
  LayoutDashboard,
  Wallet,
  Map,
  Users,
  WifiOff,
  Settings,
  HelpCircle,
  Sparkles,
  MapPin,
  Globe2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("Navbar")
  // Keep initial SSR and first client render identical, then hydrate route-aware UI.
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: t("dashboard"), href: "/dashboard",    icon: LayoutDashboard },
    { name: t("budget"),    href: "/budget",        icon: Wallet },
    { name: t("itinerary"), href: "/trip-planner", icon: Map, special: true },
    { name: t("community"), href: "/community",    icon: Globe2 },
    { name: t("nearMe"),   href: "/near-me",       icon: MapPin },
    { name: t("companion"), href: "/companions",   icon: Users },
    { name: t("offline"),   href: "/offline",      icon: WifiOff },
  ]

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const resolvedPathname = mounted ? (pathname ?? "") : ""
  const isAuthPage = resolvedPathname === "/login" || resolvedPathname === "/register" || resolvedPathname === "/"
  if (isAuthPage) return null

  const displayName = user?.displayName || t("traveler")
  const photoUrl    = user?.photoURL || "/avatars/default.svg"
  const userInitial = displayName.charAt(0).toUpperCase()

  const handleItineraryClick = () => {
    router.push("/trip-planner?new=true");
  };

  return (
    /* hidden on mobile (< lg), visible on lg+ */
    <aside suppressHydrationWarning className="hidden lg:flex w-64 h-[calc(100vh-80px)] sticky top-20 bg-white dark:bg-[#1A1A1A] border-r border-[#EBEBEB] dark:border-[#2A2A2A] flex-col p-5 pt-6 z-50 text-[#484848] dark:text-[#E0E0E0] font-sans shrink-0 no-print">
      {/* Profile */}
      <Link href="/profile">
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[#EBEBEB] dark:border-[#2A2A2A] hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
          <Avatar className="h-10 w-10 border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm rounded-full shrink-0">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#FF5A5F] font-bold text-sm">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0] truncate">{displayName}</p>
            <p className="text-[11px] text-[#767676] dark:text-[#888]">{t("viewProfile")}</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          // Active for exact path; for the special itinerary item also mark active if path starts with its href
          const isActive = resolvedPathname === item.href || (item.special && resolvedPathname.startsWith(item.href))
          return (
            <div key={item.href}>
              {item.special ? (
                <button
                  onClick={handleItineraryClick}
                  className={cn(
                    "w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
                    "transition-colors duration-150",
                    isActive ? "bg-[#FF5A5F]/8 dark:bg-[#FF5A5F]/15 text-[#FF5A5F]" : "text-[#484848] dark:text-[#E0E0E0] hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A]"
                  )}
                >
                  <item.icon className={cn(
                    "h-4.5 w-4.5 shrink-0",
                    isActive ? "text-[#FF5A5F]" : "text-[#767676] dark:text-[#888]"
                  )} />
                  <span className="font-semibold text-sm">{typeof item.name === 'string' ? item.name : item.href}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />
                  )}
                </button>
              ) : (
                <Link href={item.href}>
                  <div className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
                    "transition-colors duration-150",
                    isActive
                      ? "bg-[#FF5A5F]/8 dark:bg-[#FF5A5F]/15 text-[#FF5A5F]"
                      : "text-[#484848] dark:text-[#E0E0E0] hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A]"
                  )}>
                    <item.icon className={cn(
                      "h-4.5 w-4.5 shrink-0",
                      isActive ? "text-[#FF5A5F]" : "text-[#767676] dark:text-[#888]"
                    )} />
                    <span className="font-semibold text-sm">{typeof item.name === 'string' ? item.name : item.href}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />
                    )}
                  </div>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 pt-4 border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
        <Button
          variant="premium"
          className="w-full h-10 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("getSupport")}
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-3 text-[#767676] dark:text-[#888] hover:text-[#484848] dark:hover:text-[#E0E0E0] hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] rounded-xl px-3 h-10">
          <Settings className="h-4 w-4" />
          <span className="font-medium text-sm">{t("settings")}</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-[#767676] dark:text-[#888] hover:text-[#484848] dark:hover:text-[#E0E0E0] hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] rounded-xl px-3 h-10">
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium text-sm">{t("helpCenter")}</span>
        </Button>
      </div>
    </aside>
  )
}
