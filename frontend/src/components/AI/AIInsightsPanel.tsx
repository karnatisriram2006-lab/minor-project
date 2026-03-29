"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, Compass, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIInsightsPanelProps {
  isVisible: boolean
  location?: string
}

export default function AIInsightsPanel({ isVisible, location = "Jaipur" }: AIInsightsPanelProps) {
  const insights = [
    { 
       label: "Temporal Window", 
       value: "Optimal in 2.5h", 
       icon: Calendar, 
       color: "text-accent",
       detail: "Heritage analysis suggests peak visual fidelity at the Hawa Mahal during the golden hour transition." 
    },
    { 
       label: "Visitor Density", 
       value: "Moderate", 
       icon: Users, 
       color: "text-primary",
       detail: "Low congestion detected at the City Palace entrance. Recommend immediate transit." 
    },
    { 
       label: "Curator Tip", 
       value: "Verified Node", 
       icon: Compass, 
       color: "text-emerald-600",
       detail: "Use the rear artisan gate for a more exclusive entry and direct access to the royal museum." 
    }
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ opacity: 0, x: 100 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 100 }}
           className="fixed top-24 right-12 w-[400px] z-[50] pointer-events-none"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 space-y-10 border border-black/5 shadow-soft-xl pointer-events-auto">
             {/* Header */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Heritage Intelligence</span>
                </div>
                <h3 className="text-4xl font-black font-serif italic tracking-tighter leading-none text-primary">Insight: {location}.</h3>
             </div>

             {/* Metrics Panel */}
             <div className="space-y-8">
                {insights.map((item, i) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     key={item.label} 
                     className="group"
                   >
                      <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/5 border border-black/5">
                              <item.icon className={cn("h-4 w-4", item.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">{item.label}</span>
                         </div>
                         <div className="px-4 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                            <span className="text-[11px] font-bold text-accent">{item.value}</span>
                         </div>
                      </div>
                      <p className="text-[11px] font-medium text-primary/60 leading-relaxed italic border-l-2 border-primary/5 pl-6 ml-5">
                         {item.detail}
                      </p>
                   </motion.div>
                ))}
             </div>

             {/* Footer Action */}
             <Button className="w-full h-16 bg-primary hover:bg-opacity-90 text-white rounded-2xl flex items-center justify-between px-8 group/btn transition-all shadow-soft-lg">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Full Cultural Ledger</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-all" />
             </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
