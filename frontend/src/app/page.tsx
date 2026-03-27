"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, MapPin, Compass, Sparkles, Globe, ShieldCheck, Play, ArrowRightCircle, Users, LayoutDashboard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

export default function Home() {
  const { user, loading } = useAuth()
  const { scrollY } = useScroll()
  
  // Parallax Values
  const y1 = useTransform(scrollY, [0, 1000], [0, 300])
  const y2 = useTransform(scrollY, [0, 1000], [0, -150])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 0.9])

  const handleLogout = () => signOut(auth)

  const features = [
    { 
      title: "Digital Curator", 
      desc: "Centuries of history distilled into personalized travel sequences.", 
      icon: <Sparkles className="h-10 w-10" />,
      color: "from-orange-500/20 to-amber-500/20 text-orange-400"
    },
    { 
      title: "Spatial Intelligence", 
      desc: "Real-time optimization across India's heritage nodes.", 
      icon: <Globe className="h-10 w-10" />,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400"
    },
    { 
      title: "Neural Handshakes", 
      desc: "Connect with explorers aligned with your unique trajectory.", 
      icon: <Users className="h-10 w-10" />,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400"
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white selection:bg-primary/20 overflow-x-hidden font-sans noise-overlay">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-[110vh] w-full flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
           <Image 
             src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000" 
             alt="Taj Mahal Cinematic" 
             fill 
             priority
             className="object-cover opacity-30 scale-110"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]" />
        </motion.div>

        {/* Floating Light Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-aurora" />

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-6 relative z-10 text-center pt-24 md:pt-32"
        >
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-primary text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                India Matrix v2.0
              </motion.div>
              
              <h1 className="text-7xl md:text-9xl lg:text-[14rem] font-black font-serif tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
                Experience the <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-500 drop-shadow-none">Bharat Soul.</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="text-lg md:text-3xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed mt-12 italic"
              >
                Neural orchestration for your next historical odyssey.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="h-20 w-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/dashboard">
                      <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-16 h-24 text-2xl font-black shadow-2xl shadow-black/40 border border-white/10 transition-all hover:scale-[1.05] active:scale-95 group">
                        Enter Node <LayoutDashboard className="h-6 w-6 ml-4 group-hover:rotate-12 transition-transform" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="border-white/10 bg-white/5 backdrop-blur-2xl text-white/60 hover:text-white rounded-full px-16 h-24 text-xl font-black hover:bg-white/10 transition-all"
                    >
                      Disconnect <LogOut className="h-5 w-5 ml-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/register">
                      <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-16 h-24 text-2xl font-black shadow-2xl shadow-black/40 border border-white/10 transition-all hover:scale-[1.05] active:scale-95 group glow-primary">
                        Join Matrix <ArrowRightCircle className="h-6 w-6 ml-4 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="border-white/10 bg-white/5 backdrop-blur-2xl text-white rounded-full px-16 h-24 text-2xl font-black hover:bg-white/10 transition-all">
                        Identity Sync
                      </Button>
                    </Link>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Decrypt</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* 2. Glassmorphic Feature Set */}
      <section className="py-64 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <FadeInView key={i} delay={i * 0.2}>
                <div className="group relative p-12 lg:p-16 rounded-[4rem] glass-3d hover:border-primary/40 transition-all duration-700 hover:-translate-y-4">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-700`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-4xl font-black font-serif italic mb-6 leading-tight">{feature.title}</h3>
                  <p className="text-white/40 text-xl leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                  <div className="mt-12 h-[2px] w-12 bg-white/10 group-hover:w-full group-hover:bg-primary transition-all duration-1000" />
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Statement (Large Typography) */}
      <section className="py-64 relative overflow-hidden">
        <motion.div style={{ y: y2 }} className="absolute inset-0 z-0 flex items-center justify-center">
            <h2 className="text-[20rem] md:text-[40rem] font-black font-serif italic text-white/[0.02] select-none whitespace-nowrap">
              INCREDIBLE INDIA
            </h2>
        </motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <FadeInView>
            <div className="max-w-6xl mx-auto text-center space-y-12">
              <span className="text-primary font-black tracking-[1em] uppercase text-xs">The Manifesto</span>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black font-serif italic leading-[1.1] drop-shadow-2xl">
                "We calibrate the historical handshake between the soul and the soil."
              </h2>
              <div className="h-32 w-[2px] bg-gradient-to-b from-primary to-transparent mx-auto mt-20" />
            </div>
          </FadeInView>
        </div>
      </section>

      {/* 4. Footer Node */}
      <footer className="py-24 border-t border-white/5 bg-[#010410] relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16">
           <div className="flex flex-col gap-4 items-center md:items-start">
              <span className="text-5xl font-black font-serif text-primary italic tracking-tighter">YĀTRĀ</span>
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">Authorized Heritage Node</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-12 text-[11px] font-black text-white/30 tracking-[0.5em] uppercase italic">
              <Link href="#" className="hover:text-primary transition-colors">Neural Docs</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy Shield</Link>
              <Link href="#" className="hover:text-primary transition-colors">MHC Protocol</Link>
           </div>
           
           <div className="text-[10px] font-bold text-white/5 uppercase tracking-[2em]">
             © 2026 MATRIX
           </div>
        </div>
      </footer>
    </div>
  )
}
