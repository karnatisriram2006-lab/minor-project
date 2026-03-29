"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
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
  User
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Explore",   href: "/companions", icon: <Globe /> },
    { name: "Planner",   href: "/trip-planner", icon: <Sparkles /> },
    { name: "Community", href: "/community",  icon: <Users /> },
  ]

  return (
    <header className={cn(
      "h-20 fixed top-0 left-0 right-0 z-[100] px-8 flex items-center justify-between transition-all duration-300 bg-white",
      isScrolled ? "border-b border-[#EBEBEB] shadow-sm" : "border-b border-transparent"
    )}>
      {/* Branding */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tighter text-[#FF5A5F]">
            YĀTRĀ
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="relative group px-4 py-2 rounded-xl">
                <span className={cn(
                  "text-[13px] font-semibold transition-colors duration-200",
                  isActive ? "text-[#484848]" : "text-[#767676] hover:text-[#484848]"
                )}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#FF5A5F]"
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#767676]">
                Traveler
              </span>
              <span className="text-sm font-semibold text-[#484848]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            <div className="ml-1 pl-3 border-l border-[#EBEBEB]">
              <Link href="/dashboard">
                <Button size="icon" variant="premium" className="h-10 w-10 rounded-full shadow-sm transition-all active:scale-95">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[13px] font-semibold text-[#484848] hover:bg-[#F7F7F7] transition-colors h-10 px-5 rounded-xl">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="premium" className="rounded-xl px-6 h-10 text-[13px] font-semibold shadow-sm transition-all active:scale-95">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
