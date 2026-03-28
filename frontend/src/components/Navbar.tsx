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
      "h-20 fixed top-0 left-0 right-0 z-[100] px-8 flex items-center justify-between transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm",
      isScrolled && "shadow-md"
    )}>
      {/* Branding */}
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tighter text-[#FF385C]">
            YĀTRĀ
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="relative group">
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                  isActive ? "text-[#222222]" : "text-gray-400 hover:text-[#222222]"
                )}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-7 left-0 right-0 h-[2px] rounded-full bg-[#222222]"
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF385C]">
                Pro Traveler
              </span>
              <span className="text-xs font-bold text-[#222222]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 text-gray-400 hover:text-[#FF385C] hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            
            <div className="ml-1 pl-4 border-l border-gray-100">
              <Link href="/dashboard">
                <Button size="icon" className="h-10 w-10 bg-[#FF385C] text-white hover:bg-[#E31C5F] rounded-full shadow-md transition-all active:scale-95">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link href="/login">
                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#222222]">
                   Log In
                </Button>
             </Link>
             <Link href="/register">
                <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full px-8 h-12 text-[11px] font-bold uppercase tracking-widest shadow-md transition-all active:scale-95">
                   Sign Up
                </Button>
             </Link>
          </div>
        )}
      </div>
    </header>
  )
}
