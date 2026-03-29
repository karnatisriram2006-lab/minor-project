"use client"

import { useState } from "react"
import Link from "next/link"
import { Compass, Sparkles } from "lucide-react"
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
    } catch (err: unknown) {
      console.error("Registration error:", err)
      setError("Registration failed. Matrix handshake aborted.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-6 bg-heritage-bone text-heritage-onyx font-sans relative overflow-hidden">
      
      {/* Cinematic Background Accent */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767608, transparent 40%)' }} />

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center justify-center"
        >
          <Link href="/" className="group flex flex-col items-center gap-6">
            <div className="bg-heritage-saffron p-5 rounded-[1.5rem] shadow-premium group-hover:-rotate-12 transition-transform duration-700">
               <Compass className="h-10 w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
               <h1 className="font-extrabold text-4xl tracking-tighter text-heritage-onyx italic">
                 Bharat <span className="text-heritage-saffron underline decoration-heritage-saffron/20">Matrix.</span>
               </h1>
               <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="h-3 w-3 text-heritage-gold" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-heritage-gold">Cultural Intelligence</span>
               </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="bg-white rounded-[2.5rem] border border-heritage-gold/10 shadow-premium overflow-hidden">
            <CardHeader className="space-y-4 text-center border-b border-heritage-bone p-10">
              <CardTitle className="text-3xl font-black text-heritage-onyx tracking-tighter italic">Initialize.</CardTitle>
              <CardDescription className="text-heritage-onyx/40 font-medium text-base leading-relaxed italic">
                Register your presence to embark on a high-fidelity journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-10 space-y-8 px-10 pb-12">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-heritage-saffron/5 border border-heritage-saffron/10 text-heritage-saffron text-xs font-black text-center shadow-soft-inner"
                >
                  {error}
                </motion.div>
              )}
              
              <Button 
                variant="premium"
                onClick={handleGoogleRegister}
                type="button" 
                className="w-full h-20 rounded-[1.5rem] shadow-premium transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-6 group overflow-hidden" 
                disabled={loading}
              >
                {loading ? (
                   <div className="flex items-center gap-4 text-white/60">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="font-black text-xs uppercase tracking-widest">Registering...</span>
                   </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" className="text-white/80"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="text-white/40"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" className="text-white/20"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" className="text-white/60"/>
                    </svg>
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Register Matrix</span>
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-6 pb-10 bg-heritage-bone/30 border-t border-heritage-bone">
              <div className="text-[10px] font-black text-center text-heritage-onyx/30 uppercase tracking-[0.3em]">
                Already synced?{" "}
                <Link href="/login" className="text-heritage-saffron hover:underline underline-offset-8 transition-all px-2">
                  Access Portal
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
        
        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.8em] text-heritage-gold/40 italic">
          Sacred Data Protocols Active
        </p>
      </div>
    </div>
  )
}
