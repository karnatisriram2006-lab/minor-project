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
    <div className="flex flex-col min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 overflow-x-hidden font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
           <Image 
             src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000" 
             alt="Taj Mahal" 
             fill 
             priority
             className="object-cover opacity-80 scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
        </motion.div>

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto space-y-10"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 text-[#FF385C] text-[10px] font-bold uppercase tracking-widest"
              >
                <Sparkles className="h-3 w-3 animate-pulse" />
                Discover India
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] text-[#222222]">
                Explore India like <br />
                <span className="text-[#FF385C]">never before.</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-lg md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mt-8"
              >
                Smart planning, local connections, and curated experiences across the heart of Bharat.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="h-16 w-56 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#FF385C]/30 border-t-[#FF385C] rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                      <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-xl px-12 h-16 text-lg font-bold shadow-md transition-all active:scale-95 group">
                        Go to Dashboard <LayoutDashboard className="h-5 w-5 ml-3" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="border-gray-200 bg-white/50 backdrop-blur-md text-gray-500 hover:text-[#222222] rounded-xl px-12 h-16 text-lg font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Sign Out <LogOut className="h-5 w-5 ml-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register">
                      <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-xl px-12 h-16 text-lg font-bold shadow-md transition-all active:scale-95 group">
                        Get Started <ArrowRightCircle className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="border-gray-200 bg-white/50 backdrop-blur-md text-[#222222] rounded-xl px-12 h-16 text-lg font-bold hover:bg-gray-50 transition-all active:scale-95">
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
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Scroll</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#FF385C] to-transparent" />
        </motion.div>
      </section>

      {/* 2. Feature Set */}
      <section className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="group bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 border border-black/5`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Statement */}
      <section className="py-48 relative overflow-hidden bg-white">
        <motion.div style={{ y: y2 }} className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03]">
            <h2 className="text-[12rem] md:text-[20rem] font-extrabold text-[#222222] select-none whitespace-nowrap">
              INCREDIBLE INDIA
            </h2>
        </motion.div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <div className="max-w-4xl mx-auto space-y-10">
              <span className="text-[#FF385C] font-bold tracking-[0.5em] uppercase text-xs">Our Dream</span>
              <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                Empowering your journey through the timeless heart of India.
              </h2>
              <div className="h-20 w-[1px] bg-gradient-to-b from-[#FF385C] to-transparent mx-auto mt-12" />
            </div>
          </FadeInView>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-16 border-t border-gray-100 bg-white relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="flex flex-col gap-2 items-center md:items-start">
              <span className="text-3xl font-extrabold text-[#FF385C] tracking-tighter">YĀTRĀ</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Modern Heritage Travel</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
              <Link href="#" className="hover:text-[#FF385C] transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-[#FF385C] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#FF385C] transition-colors">Contact Us</Link>
           </div>
           
           <div className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">
             © 2026 YĀTRĀ
           </div>
        </div>
      </footer>
    </div>
  )
}
