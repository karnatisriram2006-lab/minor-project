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
    <aside className="w-80 h-screen sticky top-0 bg-[#020617] border-r border-white/5 flex flex-col p-8 z-50 text-white font-sans noise-overlay">
      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-12">
        <Avatar className="h-14 w-14 border-2 border-primary/20 transition-transform hover:scale-105 shadow-2xl">
          <AvatarImage src={photoUrl} />
          <AvatarFallback className="bg-[#0B1120] text-primary font-black italic">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 leading-none mb-1">Identity Node</h3>
          <p className="text-sm font-black text-white truncate max-w-[160px]">{displayName}</p>
          <p className="text-[10px] text-primary/80 font-bold uppercase tracking-[0.2em] italic mt-1">Matrix Verified</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 cursor-pointer mb-2 border",
                isActive 
                  ? "bg-[#0B1120] text-white shadow-2xl scale-[1.02] border-white/10 glow-primary" 
                  : "text-white/40 border-transparent hover:bg-white/[0.02] hover:text-white hover:border-white/5"
              )}>
                <div className="flex items-center gap-4">
                  <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-white/20 group-hover:text-primary/80")} />
                  <span className="font-bold text-xs tracking-[0.1em] uppercase">{item.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="space-y-6 pt-8 border-t border-white/5">
        <Button className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] border border-white/5 text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Sparkles className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform relative z-10" />
          <span className="relative z-10 italic">Neural Consult</span>
        </Button>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-4 text-white/30 hover:text-white hover:bg-white/[0.02] rounded-xl px-6 h-12 transition-colors">
            <Settings className="h-4 w-4" />
            <span className="font-black text-[10px] uppercase tracking-widest">Settings</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-4 text-white/30 hover:text-white hover:bg-white/[0.02] rounded-xl px-6 h-12 transition-colors">
            <HelpCircle className="h-4 w-4" />
            <span className="font-black text-[10px] uppercase tracking-widest">Support</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
