"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Map,
  Wallet,
  Users,
  Compass,
  MoreHorizontal,
  MapPin,
  ShieldAlert,
  WifiOff,
  X,
  Globe,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Home",     href: "/dashboard",    icon: LayoutDashboard },
  { name: "Planner",  href: "/trip-planner", icon: Map },
  { name: "More",     href: "#more",          icon: MoreHorizontal },
  { name: "Map",      href: "/route-planner", icon: Globe },
]

const moreItems = [
  { name: "Discover",   href: "/discover",      icon: Compass },
  { name: "Budget",     href: "/budget",         icon: Wallet },
  { name: "Near Me",    href: "/near-me",        icon: MapPin },
  { name: "Companions", href: "/companions",     icon: Users },
  { name: "Emergency",  href: "/emergency",      icon: ShieldAlert },
  { name: "Offline",    href: "/offline",        icon: WifiOff },
  { name: "Settings",   href: "/profile",        icon: Settings },
  { name: "Help",       href: "/community",      icon: HelpCircle },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // Hide on auth pages and landing
  const hidden = pathname === "/" || pathname === "/login" || pathname === "/register"
  if (hidden) return null

  return (
    <>
      {/* Spacer so content doesn't hide behind the bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#EBEBEB] dark:border-[#2A2A2A] no-print"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => {
            const isActive = tab.href !== "#more" && (pathname === tab.href || pathname.startsWith(tab.href + "/"))
            const Icon = tab.icon
            return (
              <button
                key={tab.name}
                onClick={() => tab.href === "#more" ? setMoreOpen(true) : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative active:bg-[#F7F7F7] dark:active:bg-[#2A2A2A] transition-colors"
                aria-label={tab.name}
              >
                {tab.href !== "#more" ? (
                  <Link href={tab.href} className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    {/* Active indicator pill */}
                    {isActive && (
                      <motion.div
                        layoutId="mobile-tab-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#FF5A5F]"
                        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                      />
                    )}

                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-150",
                          isActive ? "text-[#FF5A5F]" : "text-[#AAAAAA] dark:text-[#666]"
                        )}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </motion.div>

                    <span className={cn(
                      "text-[10px] font-semibold transition-colors duration-150 leading-none",
                      isActive ? "text-[#FF5A5F]" : "text-[#AAAAAA] dark:text-[#666]"
                    )}>
                      {tab.name}
                    </span>
                  </Link>
                ) : (
                  <>
                    <motion.div
                      animate={{ scale: moreOpen ? 1.1 : 1 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-150",
                          moreOpen ? "text-[#FF5A5F]" : "text-[#AAAAAA] dark:text-[#666]"
                        )}
                        strokeWidth={moreOpen ? 2.5 : 1.8}
                      />
                    </motion.div>

                    <span className={cn(
                      "text-[10px] font-semibold transition-colors duration-150 leading-none",
                      moreOpen ? "text-[#FF5A5F]" : "text-[#AAAAAA] dark:text-[#666]"
                    )}>
                      {tab.name}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* More slide-up sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMoreOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="more-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.08 }}
              className="fixed bottom-0 left-0 right-0 z-[200] bg-white dark:bg-[#1A1A1A] rounded-t-3xl shadow-2xl lg:hidden max-h-[75vh] overflow-y-auto"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[#DDDDDD] dark:bg-[#444]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
                <h3 className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">More</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#767676] dark:text-[#888]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-3 p-5">
                {moreItems.map((item, i) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#F7F7F7] dark:bg-[#222] hover:bg-[#FF5A5F]/8 dark:hover:bg-[#FF5A5F]/15 transition-colors active:scale-95"
                  >
                    <item.icon className="h-5 w-5 text-[#484848] dark:text-[#E0E0E0]" />
                    <span className="text-[10px] font-semibold text-[#484848] dark:text-[#E0E0E0] text-center leading-tight">{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
