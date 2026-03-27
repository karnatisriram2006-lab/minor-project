"use client"

import { useState } from "react"
import Link from "next/link"
import { Compass, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { auth } from "@/lib/firebase"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleRegister = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      window.location.href = "/dashboard"
    } catch (err: any) {
      console.error("Registration error:", err)
      setError("Registration failed. Matrix handshake aborted.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#020617] text-white selection:bg-primary/20 font-sans noise-overlay">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-[#020617] via-[#0B1120] to-[#020617]">
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-900/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-800/20 rounded-full blur-[120px] animate-pulse [animation-delay:-5s]" />
      </div>

      <div className="w-full max-w-md relative z-10 pt-8 sm:pt-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col items-center justify-center"
        >
          <Link href="/" className="flex flex-col items-center justify-center gap-4 group cursor-pointer">
            <div className="bg-[#0B1120] p-4 rounded-2xl group-hover:scale-105 transition-all duration-700 shadow-2xl shadow-black/40 border border-white/5 relative">
               <div className="absolute inset-0 bg-white/5 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
               <Compass className="h-6 w-6 text-white/80 relative z-10" />
            </div>
            <div className="text-center space-y-1">
               <span className="font-black text-3xl tracking-tighter text-white block group-hover:text-primary transition-colors italic leading-none font-serif">Spawn Identity.</span>
               <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/30 hidden sm:block">Authorized Matrix Enrollment</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="bg-[#0B1120]/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden glass-3d">
            <CardHeader className="space-y-2 text-center border-b border-white/5 p-6 bg-white/[0.01]">
              <div className="flex justify-center mb-1">
                 <div className="bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/80">Identity Verification</span>
                 </div>
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter italic text-white leading-tight font-serif">Join the Matrix.</CardTitle>
              <CardDescription className="text-white/40 font-medium text-xs leading-relaxed px-4 italic">
                Orchestrate your journey through Bharat securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6 px-6 sm:px-10 pb-10">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center italic mb-4"
                >
                  {error}
                </motion.div>
              )}
              
              <Button 
                onClick={handleGoogleRegister}
                type="button" 
                className="w-full h-14 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-sm shadow-xl shadow-black/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer group flex items-center justify-center gap-3" 
                disabled={loading}
              >
                {loading ? (
                   <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Handshake Active...</span>
                   </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="tracking-wide">Continue with Google</span>
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6 bg-white/[0.01] border-t border-white/5">
              <div className="text-[11px] font-bold text-center text-white/40 tracking-wide uppercase">
                Already synchronized?{" "}
                <Link href="/login" className="text-white hover:text-primary transition-colors cursor-pointer italic underline underline-offset-4 decoration-white/20">
                  Identify Yourself
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
