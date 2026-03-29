"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Globe, LayoutGrid, Maximize2, Sparkles, Navigation } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import AIInsightsPanel from "@/components/AI/AIInsightsPanel"

// Dynamic imports to avoid SSR issues
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false })

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState("heritage")
  const [showInsights, setShowInsights] = useState(true)

  return (
    <div className="h-[calc(100vh-80px)] relative overflow-hidden bg-heritage-bone font-sans">
      
      {/* 1. MAP CORE */}
      <div className="absolute inset-0 z-0">
         <InteractiveMap />
      </div>

      {/* 2. OVERLAY CONTROLS (Top Left) */}
      <div className="absolute top-10 left-10 z-10 flex flex-col gap-6">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white rounded-[1.8rem] px-8 py-5 border border-heritage-gold/10 shadow-premium flex items-center gap-6"
         >
            <div className="w-14 h-14 rounded-2xl bg-heritage-onyx flex items-center justify-center text-white shadow-premium">
               <Globe className="h-7 w-7" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-heritage-gold mb-1">Planetary View</p>
               <h3 className="text-2xl font-black text-heritage-onyx tracking-tighter italic">Explore Bharat.</h3>
            </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="flex gap-3 bg-heritage-bone/50 p-2 rounded-2xl backdrop-blur-md border border-heritage-gold/5 shadow-soft-inner"
         >
            {["Heritage", "Nature", "Luxury", "Routes"].map((layer, idx) => (
              <button 
                key={layer}
                onClick={() => setActiveLayer(layer.toLowerCase())}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2",
                  activeLayer === layer.toLowerCase() 
                    ? "bg-heritage-saffron text-white shadow-premium" 
                    : "text-heritage-onyx/40 hover:text-heritage-saffron hover:bg-white"
                )}
              >
                {idx === 0 && <Sparkles className="h-3 w-3" />}
                {layer}
              </button>
            ))}
         </motion.div>
      </div>

      {/* 3. SYNCED STATUS (Bottom Left) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-10 left-10 z-10"
      >
         <div className="bg-white/90 backdrop-blur-2xl px-6 py-4 rounded-[1.2rem] border border-heritage-gold/10 shadow-premium flex items-center gap-4 border-l-8 border-l-heritage-saffron">
            <div className="relative">
               <div className="w-3 h-3 rounded-full bg-heritage-saffron animate-pulse" />
               <div className="absolute inset-0 bg-heritage-saffron rounded-full animate-ping opacity-20" />
            </div>
            <div className="flex items-center gap-3">
               <Navigation className="h-4 w-4 text-heritage-gold" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-onyx/60">
                 Sync Active: {activeLayer} layer
               </span>
            </div>
         </div>
      </motion.div>

      {/* 4. MAP UTILITIES (Bottom Right) */}
      <div className="absolute bottom-10 right-10 z-10 flex gap-4">
         <Button 
           variant="premium" 
           size="icon" 
           onClick={() => setShowInsights(!showInsights)}
           className={cn("w-16 h-16 rounded-[1.5rem] shadow-premium transition-all", !showInsights && "bg-heritage-bone text-heritage-onyx/40 border border-heritage-gold/10")}
         >
            <LayoutGrid className="h-7 w-7" />
         </Button>
         <Button variant="premium" size="icon" className="w-16 h-16 rounded-[1.5rem] shadow-premium bg-heritage-onyx text-white border-0">
            <Maximize2 className="h-7 w-7" />
         </Button>
      </div>

      {/* 5. AI INSIGHTS PANEL */}
      <AnimatePresence>
        {showInsights && (
          <AIInsightsPanel isVisible={true} location="Jaipur Matrix" />
        )}
      </AnimatePresence>
    </div>
  )
}
