"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  ArrowRight,
  Globe,
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white text-[#484848] pt-24 pb-12 font-sans overflow-hidden">
      {/* ── Background Decals ───────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FF5A5F]/5 to-transparent -z-10" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-[#00A699]/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-bold uppercase tracking-widest"
              >
                <Sparkles className="h-3 w-3" />
                Coming Soon
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-[#484848]">
                Where travelers <br/>
                <span className="text-[#FF5A5F]">become a tribe.</span>
              </h1>
              
              <p className="text-lg text-[#767676] max-w-lg leading-relaxed">
                We're building the ultimate hub for Indian explorers. Share secret spots, 
                swap itineraries, and find your next travel crew in a community that 
                values authentic experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button variant="premium" className="h-14 px-8 rounded-2xl text-base font-bold shadow-xl shadow-[#FF5A5F]/20 group">
                Join the waitlist
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm font-semibold text-[#767676]">
                Already 2,400+ explorers waiting.
              </p>
            </div>

            {/* Feature preview */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EBEBEB] shadow-sm flex items-center justify-center text-[#FF5A5F]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">Real-time chats</h3>
                <p className="text-xs text-[#767676]">Connect with locals and travelers instantly.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EBEBEB] shadow-sm flex items-center justify-center text-[#00A699]">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">Global meetups</h3>
                <p className="text-xs text-[#767676]">Join community-led treks and city walks.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Visual cards stacks */}
            <div className="relative z-10 space-y-4">
              {/* Card 1 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-4 rounded-3xl border border-[#EBEBEB] shadow-2xl flex items-center gap-4 max-w-sm ml-auto"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">AK</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Arjun Kapoor</p>
                  <p className="text-[11px] text-[#767676]">Just posted: Hidden cafe in Manali ☕️</p>
                </div>
                <Heart className="h-4 w-4 text-[#FF5A5F] fill-[#FF5A5F]" />
              </motion.div>

              {/* Main Image Frame */}
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80" 
                  alt="Incredible India" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card 2 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl border border-[#EBEBEB] shadow-2xl space-y-3 max-w-[200px] -rotate-3 hover:rotate-0 transition-transform duration-500"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00A699] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#767676]">Active now</span>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#F7F7F7] flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FF5A5F] flex items-center justify-center text-white text-[10px] font-bold">
                    +12
                  </div>
                </div>
                <p className="text-xs font-bold text-[#484848]">Planning a Spiti trek for June 🏔️</p>
              </motion.div>
            </div>

            {/* Decorative Map Pins */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 -left-10 z-20"
            >
              <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#EBEBEB]">
                <MapPin className="h-4 w-4 text-[#FF5A5F]" />
                <span className="text-xs font-bold text-[#484848]">Leh</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
