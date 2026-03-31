"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Star, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      window.location.href = "/dashboard"
    } catch (err: unknown) {
      console.error("Login error:", err)
      setError("Sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex font-sans overflow-hidden">

      {/* ── Left panel: image + branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12" style={{ backgroundColor: '#222222' }}>
        <Image
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1200"
          alt="Taj Mahal"
          fill
          sizes="(max-width: 1024px) 50vw, 50vw"
          className="object-cover opacity-30"
          priority
        />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">YĀTRĀ</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Your journey through <br />
            <span style={{ color: '#FF5A5F' }}>India</span> starts here.
          </h2>

          <div className="flex flex-col gap-3">
            {[
              { icon: <MapPin className="h-4 w-4" />, text: "200+ destinations across India" },
              { icon: <Star className="h-4 w-4" />, text: "AI-powered trip planning" },
              { icon: <Shield className="h-4 w-4" />, text: "Safe & verified travel data" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <div className="text-[#FF5A5F]">{item.icon}</div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">© 2026 YĀTRĀ. All rights reserved.</p>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/">
              <span className="text-2xl font-extrabold text-[#FF5A5F] tracking-tight">YĀTRĀ</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#484848] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#767676]">Sign in to continue planning your trip.</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#FF5A5F]/8 border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Google sign in */}
          <Button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-white border border-[#DDDDDD] text-[#484848] hover:bg-[#F7F7F7] shadow-sm flex items-center justify-center gap-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#484848]/20 border-t-[#484848] rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EBEBEB]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#767676] bg-white px-3">
              <span className="px-2 bg-white">No password needed</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-[#767676]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#FF5A5F] font-semibold hover:underline underline-offset-4 transition-all">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-[#BBBBBB]">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-[#767676] transition-colors">Terms</a>{" "}and{" "}
            <a href="#" className="underline hover:text-[#767676] transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
