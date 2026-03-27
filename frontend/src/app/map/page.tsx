"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Sparkles, Globe, Map as MapIcon, Navigation, LayoutGrid, Maximize2 } from "lucide-react"
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
    <div className="h-[calc(100vh-80px)] relative overflow-hidden bg-[#F8F6F3]">
      {/* 1. MAP CORE */}
      <div className="absolute inset-0 z-0">
         <InteractiveMap />
      </div>

      {/* 2. OVERLAY CONTROLS - Heritage Style */}
      <div className="absolute top-10 left-10 z-10 flex flex-col gap-4">
         <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-black/5 shadow-soft-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
               <Globe className="h-5 w-5 text-accent" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Active Exploration</p>
               <h3 className="text-lg font-black font-serif text-primary italic">Incredible India Matrix</h3>
            </div>
         </div>

         <div className="flex gap-2">
            {["Heritage", "Nature", "Luxury", "Routes"].map(layer => (
              <button 
                key={layer}
                onClick={() => setActiveLayer(layer.toLowerCase())}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-soft-sm",
                  activeLayer === layer.toLowerCase() 
                    ? "bg-accent text-white border-accent" 
                    : "bg-white/80 backdrop-blur-md text-primary/40 border-black/5 hover:text-primary"
                )}
              >
                {layer}
              </button>
            ))}
         </div>
      </div>

      {/* 3. SYNCED STATUS TERMINAL (Bottom Left) */}
      <div className="absolute bottom-10 left-10 z-10">
         <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[1.5rem] border border-black/5 shadow-soft-lg flex items-center gap-4 border-l-4 border-l-accent">
            <div className="relative">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-40" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 uppercase">
              Spatial Sync: {activeLayer.toUpperCase()} LAYERS LOADED
            </span>
         </div>
      </div>

      {/* 4. MAP UTILITIES (Bottom Right) */}
      <div className="absolute bottom-10 right-10 z-10 flex gap-2">
         <Button 
           variant="outline" 
           size="icon" 
           onClick={() => setShowInsights(!showInsights)}
           className={cn("w-14 h-14 rounded-2xl bg-white border border-black/5 shadow-soft-lg transition-all", showInsights ? "text-accent" : "text-primary/20")}
         >
            <LayoutGrid className="h-6 w-6" />
         </Button>
         <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl bg-white border border-black/5 shadow-soft-lg text-primary/20">
            <Maximize2 className="h-6 w-6" />
         </Button>
      </div>

      {/* 5. AI INSIGHTS PANEL */}
      <AIInsightsPanel isVisible={showInsights} location="Jaipur Central" />
    </div>
  )
}
