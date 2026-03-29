"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRightCircle, Globe, Users, LayoutDashboard, LogOut } from "lucide-react"

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
      title: "AI Travel Planner", 
      desc: "Smart itineraries created specifically for your interests and schedule.", 
      icon: <Sparkles className="h-8 w-8" />,
      color: "bg-[#FF385C]/5 text-[#FF385C]"
    },
    { 
      title: "Smart Mapping", 
      desc: "Navigate India's most iconic heritage sites with ease.", 
      icon: <Globe className="h-8 w-8" />,
      color: "bg-[#00A699]/5 text-[#00A699]"
    },
    { 
      title: "Connect with Travelers", 
      desc: "Find and meet other explorers traveling to the same places.", 
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-50 text-blue-500"
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 overflow-x-hidden font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 scale-110">
           <Image 
             src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000" 
             alt="Taj Mahal" 
             fill 
             priority
             className="object-cover opacity-90 brightness-[0.8]"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-heritage-onyx/40 via-transparent to-heritage-bone" />
        </motion.div>

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto space-y-12"
          >
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl shadow-premium border border-white/20 text-heritage-bone text-[11px] font-bold uppercase tracking-widest"
              >
                <Sparkles className="h-4 w-4 text-heritage-gold animate-pulse" />
                Experience the Soul of India
              </motion.div>
              
              <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-extrabold tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
                Bharat <br />
                <span className="text-heritage-saffron italic font-serif">Awaits.</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1.2 }}
                className="text-xl md:text-3xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed mt-10 drop-shadow-md"
              >
                Intelligent planning meets timeless heritage. Your journey into the heart of India begins here.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="h-20 w-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-heritage-gold/30 border-t-heritage-gold rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/dashboard">
                      <Button variant="premium" size="xl" className="min-w-[240px]">
                        Command Center <LayoutDashboard className="h-6 w-6 ml-3" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="border-heritage-onyx/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-2xl px-12 h-16 text-lg font-bold transition-all active:scale-95"
                    >
                      Sign Out <LogOut className="h-5 w-5 ml-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/register">
                      <Button variant="premium" size="xl" className="min-w-[240px]">
                        Begin Exploration <ArrowRightCircle className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="border-white/40 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 rounded-2xl px-12 h-16 text-lg font-bold transition-all active:scale-95">
                        Log In
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
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-heritage-gold font-bold">Scroll Down</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-heritage-gold to-transparent shadow-premium" />
        </motion.div>
      </section>

      {/* 2. Feature Set */}
      <section className="py-40 bg-heritage-bone relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-heritage-gold/20 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <FadeInView key={i} delay={i * 0.15}>
                <div className="premium-card group bg-white p-16 rounded-[3rem] transition-all hover:-translate-y-2">
                  <div className={`w-20 h-20 rounded-[1.5rem] bg-heritage-bone flex items-center justify-center mb-10 shadow-soft-inner border border-heritage-gold/10 text-heritage-onyx group-hover:text-heritage-saffron transition-colors duration-500`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-extrabold mb-6 tracking-tight">{feature.title}</h3>
                  <p className="text-heritage-onyx/60 text-xl leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Statement */}
      <section className="py-64 relative overflow-hidden bg-heritage-onyx text-heritage-bone">
        <motion.div style={{ y: y2 }} className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.05]">
            <h2 className="text-[15rem] md:text-[25rem] font-extrabold text-heritage-gold select-none whitespace-nowrap tracking-tighter">
              INCREDIBLE INDIA
            </h2>
        </motion.div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <div className="max-w-5xl mx-auto space-y-12">
              <span className="text-heritage-gold font-bold tracking-[0.6em] uppercase text-xs">Our Vision</span>
              <h2 className="text-6xl md:text-8xl font-extrabold leading-[0.9] tracking-tight">
                Empowering your journey through the timeless heart of <span className="text-heritage-saffron italic">Bharat.</span>
              </h2>
              <div className="h-24 w-[1px] bg-gradient-to-b from-heritage-gold to-transparent mx-auto mt-16 shadow-premium" />
            </div>
          </FadeInView>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-24 bg-heritage-bone border-t border-heritage-gold/10 relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16">
           <div className="flex flex-col gap-3 items-center md:items-start">
              <span className="text-5xl font-extrabold text-heritage-onyx tracking-tighter">YĀTRĀ</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-heritage-gold">Modern Heritage Travel</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-12 text-[12px] font-bold text-heritage-onyx/40 tracking-[0.2em] uppercase">
              <Link href="#" className="hover:text-heritage-saffron transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-heritage-saffron transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-heritage-saffron transition-colors">Contact Us</Link>
           </div>
           
           <div className="text-[11px] font-bold text-heritage-onyx/20 uppercase tracking-[0.3em]">
             © 2026 YĀTRĀ • BHARAT
           </div>
        </div>
      </footer>
    </div>
  )
}
