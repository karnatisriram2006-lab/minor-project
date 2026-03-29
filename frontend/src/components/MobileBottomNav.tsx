"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Map,
  Wallet,
  Users,
  Compass
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Home",     href: "/dashboard",    icon: LayoutDashboard },
  { name: "Discover", href: "/discover",     icon: Compass },
  { name: "Planner",  href: "/trip-planner", icon: Map },
  { name: "Budget",   href: "/budget",       icon: Wallet },
  { name: "People",   href: "/companions",   icon: Users },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  // Hide on auth pages and landing
  const hidden = pathname === "/" || pathname === "/login" || pathname === "/register"
  if (hidden) return null

  return (
    <>
      {/* Spacer so content doesn't hide behind the bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-[#EBEBEB]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
            const Icon = tab.icon
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative active:bg-[#F7F7F7] transition-colors"
                aria-label={tab.name}
              >
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
                      isActive ? "text-[#FF5A5F]" : "text-[#AAAAAA]"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>

                <span className={cn(
                  "text-[10px] font-semibold transition-colors duration-150 leading-none",
                  isActive ? "text-[#FF5A5F]" : "text-[#AAAAAA]"
                )}>
                  {tab.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
