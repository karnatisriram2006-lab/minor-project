"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Globe, Users, LayoutDashboard, LogOut, MapPin, Star, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

export default function Home() {
  const { user, loading } = useAuth()
  const { scrollY } = useScroll()

  const y1 = useTransform(scrollY, [0, 600], [0, 180])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  const handleLogout = () => signOut(auth)

  const features = [
    {
      title: "AI Travel Planner",
      desc: "Smart itineraries created specifically for your interests and schedule.",
      icon: <Sparkles className="h-6 w-6" />,
      accent: "#FF5A5F",
      bg: "#FFF0F0"
    },
    {
      title: "Smart Mapping",
      desc: "Navigate India's most iconic heritage sites with ease.",
      icon: <Globe className="h-6 w-6" />,
      accent: "#00A699",
      bg: "#F0FFFE"
    },
    {
      title: "Connect with Travelers",
      desc: "Find and meet other explorers traveling to the same places.",
      icon: <Users className="h-6 w-6" />,
      accent: "#484848",
      bg: "#F7F7F7"
    },
  ]

  const stats = [
    { value: "10,000+", label: "Happy Travelers", icon: <Star className="h-4 w-4" /> },
    { value: "200+", label: "Cities Covered", icon: <MapPin className="h-4 w-4" /> },
    { value: "100%", label: "Verified & Secure", icon: <Shield className="h-4 w-4" /> },
  ]

  return (
    <main className="flex flex-col min-h-screen bg-white text-[#484848] overflow-x-hidden font-sans">

      {/* ── 1. Hero (Header) ────────────────────────────────── */}
      <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Parallax background image */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 scale-110">
          <Image
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000"
            alt="Taj Mahal, India - AI Travel Planning"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FF5A5F]" />
            Experience the Soul of India
          </motion.div>

          {/* Main headline (H1 for SEO) */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-white mb-6"
          >
            Bharat <br />
            <span className="text-[#FF5A5F] italic">Awaits.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="text-base sm:text-lg text-white/80 font-medium max-w-xl mx-auto leading-relaxed mb-10"
          >
            Smart multilingual AI-powered travel recommendation and route optimization platform. Your journey into the heart of India begins here.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="h-14 w-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard" aria-label="Go to Dashboard">
                    <Button
                      variant="premium"
                      className="h-12 px-8 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.97]"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    aria-label="Sign Out"
                    className="h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-semibold transition-all active:scale-[0.97]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/register" aria-label="Register for Yatra">
                    <Button
                      variant="premium"
                      className="h-12 px-8 rounded-xl text-sm font-semibold shadow-lg group transition-all active:scale-[0.97]"
                    >
                      Get started
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login" aria-label="Login to Yatra">
                    <Button
                      className="h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-semibold transition-all active:scale-[0.97]"
                    >
                      Log in
                    </Button>
                  </Link>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-semibold">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </header>

      {/* ── 2. Stats Strip ───────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-[#EBEBEB]" aria-label="Platform Statistics">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {stats.map((stat, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/8 flex items-center justify-center text-[#FF5A5F]" aria-hidden="true">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#484848] tracking-tight leading-none">{stat.value}</p>
                    <p className="text-xs text-[#767676] font-medium mt-0.5">{stat.label}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Feature Cards ─────────────────────────────────── */}
      <section id="features" className="py-20 bg-[#F7F7F7]" aria-labelledby="features-title">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A5F] mb-3">Capabilities</p>
              <h2 id="features-title" className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">Everything you need for your trip</h2>
              <p className="text-[#767676] text-base mt-3 max-w-xl mx-auto leading-relaxed">
                Plan, explore, and connect — all in one place built for the diverse landscape of India.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeInView key={i} delay={i * 0.12}>
                <div className="bg-white rounded-2xl p-8 border border-[#EBEBEB] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: feature.bg, color: feature.accent }}
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#484848] mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-[#767676] leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. About Section ────────────────────────────────── */}
      <section id="about" className="py-24 bg-white" aria-labelledby="about-title">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <FadeInView>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=1000"
                    alt="Exploring Indian Culture"
                    width={1000}
                    height={600}
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              </FadeInView>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <FadeInView delay={0.2}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A5F]">Our Story</p>
                <h2 id="about-title" className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">Smart Planning for Timeless Heritage</h2>
                <p className="text-[#767676] text-lg leading-relaxed">
                  YĀTRĀ was born from a simple vision: to make India's vast and diverse beauty accessible to everyone. We combine state-of-the-art AI with local expertise to ensure your journey is as smooth as it is magical.
                </p>
                <p className="text-[#767676] text-base leading-relaxed">
                  Whether you're exploring the ghats of Varanasi or the tech hubs of Bangalore, our platform adapts to your preferences, budget, and language, providing real-time recommendations that matter.
                </p>
                <div className="pt-4">
                  <Button variant="outline" className="rounded-xl px-8 border-[#EBEBEB]">Learn More</Button>
                </div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Statement / CTA ───────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#222222' }}>
        {/* Subtle coral gradient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(255,90,95,0.08) 0%, transparent 65%)' }} />

        <div className="container mx-auto px-6 text-center relative z-10">
          <FadeInView>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A5F]">Join the Journey</p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-snug tracking-tight" style={{ color: '#FFFFFF' }}>
                Empowering every journey through the{" "}
                heart of <span style={{ color: '#FF5A5F' }} className="italic">India.</span>
              </h2>
              <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                We blend AI precision with local wisdom so every step of your journey is meaningful, safe, and unforgettable.
              </p>
              <div className="pt-4">
                <Link href="/register">
                  <Button
                    variant="premium"
                    className="h-12 px-8 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97]"
                  >
                    Start exploring for free
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── 6. Contact Section ───────────────────────────────── */}
      <section id="contact" className="py-24 bg-[#F7F7F7]" aria-labelledby="contact-title">
        <div className="container mx-auto px-6 max-w-4xl">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 id="contact-title" className="text-3xl font-bold text-[#484848]">Get in Touch</h2>
              <p className="text-[#767676] mt-2">Have questions about your next trip? Our team is here to help.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#EBEBEB]">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Contact Information</h3>
                    <p className="text-sm text-[#767676] leading-relaxed">We're available 24/7 to assist with your travel planning needs. Reach out via email or through our social channels.</p>
                    <div className="space-y-4 pt-4">
                       <p className="text-sm font-bold flex items-center gap-3">
                         <span className="text-[#FF5A5F]">Email:</span> support@yatra-ai.com
                       </p>
                       <p className="text-sm font-bold flex items-center gap-3">
                         <span className="text-[#FF5A5F]">Office:</span> Tech Park, Bengaluru, India
                       </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#767676]">Your Email</label>
                        <input type="email" placeholder="hello@example.com" className="w-full h-12 px-4 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#767676]">Message</label>
                        <textarea placeholder="How can we help?" className="w-full h-32 p-4 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 transition-all resize-none"></textarea>
                     </div>
                     <Button className="w-full h-12 rounded-xl bg-[#1a1a1a] text-white font-bold hover:bg-black transition-all">Send Message</Button>
                  </div>
               </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── 7. Footer ────────────────────────────────────────── */}
      <footer className="py-16 bg-white border-t border-[#EBEBEB]" aria-label="Site Footer">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <span className="text-2xl font-extrabold text-[#FF5A5F] tracking-tighter">YĀTRĀ</span>
              <p className="text-sm text-[#767676] max-w-sm leading-relaxed">
                Smart multilingual AI-powered travel recommendation and route optimization platform built for the incredible diversity of India.
              </p>
              <div className="flex gap-4 pt-2">
                 {/* Social Icons Placeholder */}
                 <div className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F] transition-colors cursor-pointer"><Globe size={16} /></div>
                 <div className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F] transition-colors cursor-pointer"><Users size={16} /></div>
                 <div className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F] transition-colors cursor-pointer"><Star size={16} /></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">Product</h4>
              <nav className="flex flex-col gap-2 text-sm text-[#767676]">
                <Link href="/trip-planner" className="hover:text-[#FF5A5F] transition-colors">AI Planner</Link>
                <Link href="/near-me" className="hover:text-[#FF5A5F] transition-colors">Nearby Guide</Link>
                <Link href="/budget" className="hover:text-[#FF5A5F] transition-colors">Budget Estimator</Link>
                <Link href="/dashboard" className="hover:text-[#FF5A5F] transition-colors">Dashboard</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">Company</h4>
              <nav className="flex flex-col gap-2 text-sm text-[#767676]">
                <Link href="/about" className="hover:text-[#FF5A5F] transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-[#FF5A5F] transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-[#FF5A5F] transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-[#FF5A5F] transition-colors">Terms of Service</Link>
              </nav>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#EBEBEB] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-[#767676] font-medium uppercase tracking-widest">
              © 2026 YĀTRĀ AI • PROUDLY BUILT IN INDIA
            </p>
            <div className="flex gap-6 text-[10px] text-[#767676] font-medium uppercase tracking-widest">
               <span>Next.js 15</span>
               <span>OpenStreetMap</span>
               <span>Lucide Icons</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
