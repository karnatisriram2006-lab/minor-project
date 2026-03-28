"use client"

import { useState } from "react"
import Link from "next/link"
import { Compass, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { auth } from "@/lib/firebase"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"

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
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Synchronization failure. Handshake aborted.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-white text-[#222222] font-sans">
      
      {/* Soft Background Accent */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-tr from-red-50/30 via-white to-teal-50/20" />

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex flex-col items-center justify-center"
        >
          <Link href="/" className="flex flex-col items-center justify-center gap-3 group">
            <div className="bg-[#FF385C] p-3.5 rounded-2xl shadow-xl shadow-red-100 group-hover:scale-105 transition-transform duration-500">
               <Compass className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
               <span className="font-extrabold text-2xl tracking-tighter text-[#222222]">Luxury <span className="text-[#FF385C]">India</span> Matrix</span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Card className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden">
            <CardHeader className="space-y-1 text-center border-b border-gray-50 p-8 pb-6">
              <CardTitle className="text-2xl font-bold text-[#222222]">Welcome Back</CardTitle>
              <CardDescription className="text-gray-500 font-medium text-sm">
                Sign in to continue your premium travel experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6 px-8 sm:px-10 pb-10">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-[#FF385C] text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              
              <Button 
                onClick={handleGoogleLogin}
                type="button" 
                className="w-full h-14 rounded-xl bg-white hover:bg-gray-50 text-[#222222] font-bold text-sm border border-gray-200 shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3" 
                disabled={loading}
              >
                {loading ? (
                   <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
                      <span>Signing in...</span>
                   </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 bg-gray-50/50 border-t border-gray-100">
              <div className="text-sm font-medium text-center text-gray-500">
                New to the platform?{" "}
                <Link href="/register" className="text-[#FF385C] font-bold hover:underline transition-all">
                  Create account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
