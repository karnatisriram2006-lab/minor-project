"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  X,
  Menu,
  Wallet,
  Map,
  WifiOff,
  ShieldAlert,
  Compass,
  MapPin
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu on route change
  React.useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when menu open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setMobileOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { name: "Dashboard",  href: "/dashboard",    icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Explore",    href: "/companions",    icon: <Globe className="h-5 w-5" /> },
    { name: "Planner",    href: "/trip-planner",  icon: <Sparkles className="h-5 w-5" /> },
    { name: "Community",  href: "/community",     icon: <Users className="h-5 w-5" /> },
  ]

  const allMobileLinks = [
    { name: "Dashboard",  href: "/dashboard",    icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Trip Planner", href: "/trip-planner", icon: <Map className="h-5 w-5" /> },
    { name: "Budget",     href: "/budget",        icon: <Wallet className="h-5 w-5" /> },
    { name: "Near Me",    href: "/near-me",       icon: <MapPin className="h-5 w-5" /> },
    { name: "Companions", href: "/companions",    icon: <Users className="h-5 w-5" /> },
    { name: "Discover",   href: "/discover",      icon: <Compass className="h-5 w-5" /> },
    { name: "Route",      href: "/route-planner", icon: <Globe className="h-5 w-5" /> },
    { name: "Emergency",  href: "/emergency",     icon: <ShieldAlert className="h-5 w-5" /> },
    { name: "Offline",    href: "/offline",       icon: <WifiOff className="h-5 w-5" /> },
  ]

  const displayName = user?.displayName?.split(" ")[0] || "Traveler"
  const photoUrl = user?.photoURL || ""
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* ── Top navbar ────────────────────────────────────── */}
      <header className={cn(
        "h-16 sm:h-20 fixed top-0 left-0 right-0 z-[100] px-4 sm:px-8 flex items-center justify-between bg-white",
        "transition-[border-color,box-shadow] duration-200",
        isScrolled ? "border-b border-[#EBEBEB] shadow-sm" : "border-b border-transparent"
      )}>
        {/* Logo + Desktop nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#FF5A5F]">YĀTRĀ</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className="relative group px-4 py-2 rounded-xl">
                  <span className={cn(
                    "text-[13px] font-semibold transition-colors duration-150",
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Desktop: name + logout */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#767676]">Traveler</span>
                <span className="text-sm font-semibold text-[#484848]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="hidden md:flex rounded-full h-10 w-10 text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7]"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              <div className="hidden md:block ml-1 pl-3 border-l border-[#EBEBEB]">
                <Link href="/dashboard">
                  <Button size="icon" variant="premium" className="h-10 w-10 rounded-full shadow-sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-[13px] font-semibold text-[#484848] h-10 px-5 rounded-xl">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="premium" className="rounded-xl px-6 h-10 text-[13px] font-semibold shadow-sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#484848] hover:bg-[#F7F7F7] transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile slide-in menu ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.08 }}
              className="fixed top-0 right-0 bottom-0 z-[200] w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
                <span className="text-xl font-black tracking-tighter text-[#FF5A5F]">YĀTRĀ</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F7F7F7] text-[#484848] hover:bg-[#EBEBEB] transition-colors active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User profile in drawer */}
              {user && (
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EBEBEB]">
                  <Avatar className="h-11 w-11 border border-[#EBEBEB] shadow-sm rounded-full shrink-0">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback className="bg-[#F7F7F7] text-[#FF5A5F] font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#484848] truncate">{displayName}</p>
                    <p className="text-xs text-[#767676] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {allMobileLinks.map((item, i) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors",
                          isActive
                            ? "bg-[#FF5A5F]/8 text-[#FF5A5F]"
                            : "text-[#484848] hover:bg-[#F7F7F7]"
                        )}
                      >
                        <span className={cn("shrink-0", isActive ? "text-[#FF5A5F]" : "text-[#767676]")}>
                          {item.icon}
                        </span>
                        <span className="font-semibold text-sm">{item.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />}
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-4 pb-6 pt-4 border-t border-[#EBEBEB] space-y-2">
                {!user ? (
                  <div className="space-y-2">
                    <Link href="/register">
                      <Button variant="premium" className="w-full h-12 rounded-xl text-sm font-semibold">
                        Create account
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold border-[#EBEBEB]">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] rounded-xl px-4 h-12 text-sm font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
