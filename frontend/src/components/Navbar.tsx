"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { 
  LayoutDashboard, 
  Sparkles, 
  Globe, 
  Users, 
  LogOut, 
  User, 
  ArrowRightCircle,
  Bell,
  Search,
  LayoutGrid
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isAuthPage = !pathname || pathname === "/" || pathname === "/login" || pathname === "/register" || pathname.startsWith("/login/") || pathname.startsWith("/register/")

  const [isScrolled, setIsScrolled] = React.useState(false)
  const { scrollY } = useScroll()

  React.useEffect(() => {
    return scrollY.onChange((latest) => setIsScrolled(latest > 50))
  }, [scrollY])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Explore", href: "/companions", icon: <Globe /> },
    { name: "Planner", href: "/trip-planner", icon: <Sparkles /> },
    { name: "Community", href: "/community", icon: <Users /> },
  ]

  return (
    <header className={cn(
      "h-24 fixed top-0 left-0 right-0 z-[100] px-12 flex items-center justify-between transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
      isScrolled 
        ? "bg-[#0B1120]/95 backdrop-blur-3xl border-b border-white/5 py-3 shadow-2xl" 
        : (isAuthPage ? "bg-transparent py-8" : "bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/5 py-8 shadow-sm")
    )}>
      {/* Branding */}
      <div className="flex items-center gap-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
            <span className={cn(
              "text-3xl font-black font-serif tracking-tighter italic transition-all duration-700 text-white",
              !isScrolled && isAuthPage ? "scale-110" : "scale-100"
            )}>
              Heritage AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="relative group">
                <span className={cn(
                  "text-[13px] font-black uppercase tracking-[0.3em] transition-all duration-500",
                  isActive ? "text-primary" : "text-white/70 group-hover:text-white group-hover:tracking-[0.4em]"
                )}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-4 left-0 right-0 h-[2px] rounded-full bg-primary glow-primary"
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">
                Neural Link Active
              </span>
              <span className="text-xs font-bold italic text-white/80">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon" 
              className="rounded-full h-12 w-12 transition-all duration-500 hover:rotate-90 text-white/70 hover:text-red-400 hover:bg-white/5"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            
            <div className="ml-2 pl-4 border-l border-white/10">
              <Link href="/dashboard">
                <Button size="icon" className="h-12 w-12 bg-primary text-white hover:bg-orange-600 rounded-full transition-all duration-500 shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-8">
             <Link href="/login">
                <Button variant="ghost" className="text-xs font-black uppercase tracking-[0.4em] transition-all duration-500 text-white/70 hover:text-white">
                   Identify
                </Button>
             </Link>
             <Link href="/register">
                <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-10 h-14 text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 shadow-2xl shadow-black/40 transition-all duration-500 hover:scale-105 active:scale-95">
                   Join Matrix
                </Button>
             </Link>
          </div>
        )}
      </div>
    </header>
  )
}
