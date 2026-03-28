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
    <div className="h-[calc(100vh-80px)] relative overflow-hidden bg-white font-sans">
      {/* 1. MAP CORE */}
      <div className="absolute inset-0 z-0">
         <InteractiveMap />
      </div>

      {/* 2. OVERLAY CONTROLS */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
         <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-100 shadow-md flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF385C] flex items-center justify-center text-white shadow-sm">
               <Globe className="h-5 w-5" />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Viewing Map</p>
               <h3 className="text-lg font-bold text-[#222222]">Explore India</h3>
            </div>
         </div>

         <div className="flex gap-2">
            {["Heritage", "Nature", "Luxury", "Routes"].map(layer => (
              <button 
                key={layer}
                onClick={() => setActiveLayer(layer.toLowerCase())}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                  activeLayer === layer.toLowerCase() 
                    ? "bg-[#222222] text-white border-[#222222]" 
                    : "bg-white/90 backdrop-blur-md text-gray-400 border-gray-100 hover:text-[#222222] hover:bg-white"
                )}
              >
                {layer}
              </button>
            ))}
         </div>
      </div>

      {/* 3. SYNCED STATUS (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-10">
         <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-xl border border-gray-100 shadow-md flex items-center gap-3 border-l-4 border-l-[#00A699]">
            <div className="relative">
               <div className="w-2 h-2 rounded-full bg-[#00A699] animate-pulse" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Live: {activeLayer} Layer Active
            </span>
         </div>
      </div>

      {/* 4. MAP UTILITIES (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
         <Button 
           variant="outline" 
           size="icon" 
           onClick={() => setShowInsights(!showInsights)}
           className={cn("w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-md transition-all", showInsights ? "text-[#FF385C]" : "text-gray-300")}
         >
            <LayoutGrid className="h-5 w-5" />
         </Button>
         <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-md text-gray-300">
            <Maximize2 className="h-5 w-5" />
         </Button>
      </div>

      {/* 5. AI INSIGHTS PANEL */}
      <AIInsightsPanel isVisible={showInsights} location="Jaipur Central" />
    </div>
  )
}
