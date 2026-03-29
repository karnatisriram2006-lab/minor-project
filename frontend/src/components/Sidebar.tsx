"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { name: "Dashboard", href: "/dashboard",    icon: LayoutDashboard },
  { name: "Budget",    href: "/budget",        icon: Wallet },
  { name: "Itinerary", href: "/trip-planner", icon: Map },
  { name: "Companion", href: "/companions",   icon: Users },
  { name: "Offline",   href: "/offline",      icon: WifiOff },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/"
  if (isAuthPage) return null

  const displayName = user?.displayName || "Traveler"
  const photoUrl    = user?.photoURL || "/avatars/default.jpg"
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <aside className="w-72 h-[calc(100vh-80px)] sticky top-20 bg-white border-r border-[#EBEBEB] flex flex-col p-6 pt-8 z-50 text-[#484848] font-sans">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#EBEBEB]">
        <Avatar className="h-12 w-12 border border-[#EBEBEB] shadow-sm rounded-full">
          <AvatarImage src={photoUrl} />
          <AvatarFallback className="bg-[#F7F7F7] text-[#FF5A5F] font-bold text-base">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-[#484848] truncate max-w-[160px]">{displayName}</p>
          <p className="text-[11px] text-[#767676] mt-0.5">Show profile</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-[#FF5A5F]/8 text-[#FF5A5F]"
                  : "text-[#484848] hover:bg-[#F7F7F7] hover:text-[#484848]"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-105",
                  isActive ? "text-[#FF5A5F]" : "text-[#767676] group-hover:text-[#484848]"
                )} />
                <span className={cn(
                  "font-semibold text-sm",
                  isActive ? "text-[#484848]" : "text-[#484848]"
                )}>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="space-y-2 pt-6 border-t border-[#EBEBEB]">
        <Button
          variant="premium"
          className="w-full h-12 rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>Get Support</span>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-3 text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] rounded-xl px-4 h-11">
          <Settings className="h-4 w-4" />
          <span className="font-medium text-sm">Settings</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] rounded-xl px-4 h-11">
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium text-sm">Help Center</span>
        </Button>
      </div>
    </aside>
  )
}
