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
  Sparkles,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Itinerary", href: "/trip-planner", icon: Map },
  { name: "Companion", href: "/companions", icon: Users },
  { name: "Offline", href: "/offline", icon: WifiOff },
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

  // Hide sidebar on landing, login, and register pages for a premium full-width experience
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/"
  
  if (isAuthPage) return null

  // Fallbacks if user hasn't explicitly set a display name or photo
  const displayName = user?.displayName || "Authorized User"
  const photoUrl = user?.photoURL || "/avatars/default.jpg"
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <aside className="w-80 h-[calc(100vh-80px)] sticky top-20 bg-white border-r border-[#DDDDDD] flex flex-col p-8 pt-10 z-50 text-[#222222] font-sans">
      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-12">
        <Avatar className="h-16 w-16 border border-gray-100 shadow-sm">
          <AvatarImage src={photoUrl} />
          <AvatarFallback className="bg-gray-100 text-[#FF385C] font-bold text-xl">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-bold text-[#222222] truncate max-w-[160px]">{displayName}</p>
          <p className="text-xs text-gray-500 font-medium">Show profile</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer mb-1",
                isActive 
                  ? "bg-gray-50 text-[#222222]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#222222]"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-[#FF385C]" : "text-gray-400 group-hover:text-[#FF385C]")} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Section - Airbnb Style "Luxury Consult" */}
      <div className="space-y-6 pt-8 border-t border-gray-100">
        <Button className="w-full h-12 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95">
          <Sparkles className="h-4 w-4" />
          <span>Luxury Support</span>
        </Button>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-[#222222] hover:bg-gray-50 rounded-xl px-4 h-11">
            <Settings className="h-4 w-4" />
            <span className="font-medium text-sm">Settings</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-[#222222] hover:bg-gray-50 rounded-xl px-4 h-11">
            <HelpCircle className="h-4 w-4" />
            <span className="font-medium text-sm">Help Center</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
