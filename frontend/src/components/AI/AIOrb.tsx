"use client"

import { useState, useEffect } from "react"
import { Sparkles, MessageSquare, X, Send, Bot, Sparkle, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function AIOrb() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello Traveler. I am your spatial intelligence layer. How shall we traverse the subcontinent today?' }
  ])

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-12 right-12 flex flex-col items-end gap-8 z-[202]">
      {/* 2. Neural Input Trigger (Premium Glass) */}
      <AnimatePresence>
        {!isOpen && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="glass-command px-10 py-6 rounded-[2.5rem] border border-white/10 flex items-center gap-8 shadow-5xl cursor-pointer group hover:border-primary/50 transition-all select-none"
             onClick={() => setIsOpen(true)}
           >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                 <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white transition-colors">Ask Neural Matrix</span>
              <div className="h-6 w-[1px] bg-white/5" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
           </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Orbital Animation (Chakra Spinner Style) */}
        <div className="absolute -inset-4 border-2 border-t-primary border-transparent rounded-full animate-spin duration-[4000ms] opacity-40" />
        <div className="absolute -inset-8 border border-white/5 rounded-full animate-spin duration-[8000ms] opacity-20" />
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent p-[3px] shadow-[0_0_50px_rgba(255,107,53,0.3)] hover:scale-110 active:scale-95 transition-all duration-500"
        >
          <div className="w-full h-full rounded-full bg-[#0B0F1A] flex items-center justify-center overflow-hidden border border-white/5">
             <div className="w-10 h-10 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
             </div>
          </div>
        </button>
      </div>
      
      {/* 4. Neural Hub (Floating Center-Right) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: -20 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, x: -20 }}
            className="absolute bottom-32 -right-8 w-[480px] z-[210] perspective-2000"
          >
            <div className="glass-command rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-6xl border border-white/10">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_15px_var(--color-cyan)]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">YĀTRĀ AI Online</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/10">
                     <X className="h-4 w-4 text-white/40" />
                  </Button>
               </div>

               <div className="space-y-6 relative z-10 pr-4">
                  <h3 className="text-6xl font-black italic tracking-tighter leading-[0.8] text-white drop-shadow-2xl">Neural Link.</h3>
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-accent/20 transition-all">
                     <p className="text-sm font-medium italic text-white/80 leading-relaxed relative z-10 transition-colors group-hover:text-white">
                        {messages[messages.length-1].text}
                     </p>
                  </div>
               </div>

               {/* Pill Shaped Input */}
               <div className="relative group/input flex items-center">
                  <div className="absolute left-6 z-10">
                     <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                  </div>
                  <input 
                    autoFocus
                    className="w-full h-20 bg-white/5 rounded-full pl-16 pr-24 text-sm font-medium focus:outline-none border border-white/10 focus:border-accent/40 focus:bg-white/10 transition-all placeholder:text-white/20 text-white shadow-inner" 
                    placeholder="Ask YĀTRĀ AI..."
                  />
                  <div className="absolute right-4 flex items-center">
                     <Button size="icon" className="w-12 h-12 rounded-full bg-primary hover:bg-orange-600 shadow-[0_0_20px_rgba(255,107,53,0.3)] group/btn transition-all" onClick={() => setIsOpen(false)}>
                       <ArrowRight className="h-5 w-5 text-white group-hover/btn:translate-x-1 transition-all" />
                     </Button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
