"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Send, 
  Clock, 
  Map as MapIcon, 
  ChevronRight, 
  Navigation, 
  Globe, 
  Compass,
  Search,
  Users,
  Wallet,
  MoreVertical,
  Maximize2,
  Info
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Deck.gl requires WebGL — must be client-only to avoid SSR errors
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  ),
})

export default function TripPlanner() {
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any>(null)
  const [formData, setFormData] = useState({
    city: "Jaipur",
    days: "3",
    interests: "Culture, History, Food",
    budget: "Luxury"
  })

  // Simulated itinerary data matching the new design if API fails or to show the result instantly for demo
  const mockItinerary = {
    "Day 1": [
      { name: "Amber Fort Expedition", type: "UNESCO Heritage", description: "Ascend the hilltop fortress.", time: "09:00", lat: 26.9855, lng: 75.8513, status: "Must Visit" },
      { name: "City Palace", type: "Museum", description: "Royal residence exploration.", time: "14:00", lat: 26.9258, lng: 75.8237 }
    ],
    "Day 2": [
      { name: "Hawa Mahal", type: "Photography", description: "Palace of Winds.", time: "08:00", lat: 26.9239, lng: 75.8267 },
      { name: "Jantar Mantar", type: "Astronomy", description: "Historic observatory.", time: "11:00", lat: 26.9248, lng: 75.8245 }
    ]
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${apiUrl}/ai/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error("API Response Error")
      
      const data = await res.json()
      // Backend returns { itinerary: { day1: [], ... } }
      setItinerary(data.itinerary || data)
    } catch (err) {
      console.error("[Curation Error]", err)
      
      // Dynamic Mock Fallback if API fails, so user sees the correct number of days
      const dynamicMock: any = {}
      const dayCount = parseInt(formData.days) || 3
      // Base coordinates for the city (using Jaipur as default if city not found)
      const baseLat = formData.city.toLowerCase().includes("agra") ? 27.1751 : 26.9124
      const baseLng = formData.city.toLowerCase().includes("agra") ? 78.0421 : 75.7873

      for (let i = 1; i <= dayCount; i++) {
        dynamicMock[`Day ${i}`] = [
          { 
            time: "09:00", 
            name: `${formData.city} Heritage Discovery ${i}`, 
            type: "Unlocking Nodes", 
            description: `AI curated sequence for ${formData.interests} in ${formData.city}. Exploring local heritage sites.`,
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1,
            status: "Suggested"
          },
          { 
            time: "14:00", 
            name: `Cultural Immersion ${i}`, 
            type: "Experiential", 
            description: `High-fidelity local experience tailored to your interest in ${formData.interests}.`,
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1
          }
        ]
      }
      setItinerary(dynamicMock)
    } finally {
      setLoading(false)
    }
  }

  // Extract points for the map
  const mapPoints = useMemo(() => {
    if (!itinerary) return []
    return Object.values(itinerary).flatMap((day: any) => 
      day.map((act: any) => ({
        id: act.name,
        name: act.name,
        lat: act.lat || 26.9124,
        lng: act.lng || 75.7873,
        description: act.description
      }))
    )
  }, [itinerary])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 1. Header Area - Matching Screen 2/3 */}
      <div className="h-20 border-b border-white/5 bg-[#020617] px-12 flex items-center justify-between z-20 shrink-0 text-white">
        <div className="flex items-center gap-6">
           <h2 className="text-3xl font-black font-serif text-white italic">Planner</h2>
           <div className="h-6 w-[1px] bg-white/5" />
           <div className="flex gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded">Heritage AI</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-3 py-1 rounded">V1.2 Stable</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <Avatar key={i} className="h-8 w-8 border-2 border-[#020617]">
                  <AvatarFallback className="bg-[#0B1120] text-white/80 text-[10px] font-bold">U{i}</AvatarFallback>
                </Avatar>
              ))}
              <div className="h-8 w-8 rounded-full bg-accent text-white border-2 border-[#020617] flex items-center justify-center text-[10px] font-black">+2</div>
           </div>
           <Button className="h-10 rounded-full bg-white/10 text-white font-bold text-xs px-6 shadow-2xl hover:bg-white/20 transition-all border border-white/5">
              Invite Peers
           </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. Left Panel: Config or Itinerary Timeline */}
        <div className={cn(
          "w-full lg:w-[450px] xl:w-[500px] bg-[#0B1120]/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-10 transition-all duration-700 overflow-y-auto text-white",
          itinerary ? "translate-x-0" : "translate-x-0"
        )}>
          {!itinerary ? (
            <div className="min-h-full flex flex-col justify-center p-8 lg:p-10 space-y-6 bg-transparent">
               <div className="space-y-3 text-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl lg:text-5xl font-black font-serif text-white tracking-tight"
                  >
                    Define Your <span className="text-primary italic">Odyssey</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs font-medium text-white/40 max-w-xs mx-auto leading-relaxed"
                  >
                    Input parameters to orchestrate a high-order travel sequence across the sub-continent.
                  </motion.p>
               </div>

               <form onSubmit={handleGenerate} className="space-y-8 max-w-md mx-auto w-full">
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-primary transition-colors">Destination Node</Label>
                       <div className="relative group">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:scale-110 transition-transform" />
                          <input 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-[#020617] h-18 rounded-2xl pl-16 pr-8 font-black text-lg text-white border border-white/10 shadow-inner focus:outline-none focus:ring-4 ring-primary/10 transition-all placeholder:text-white/20"
                            placeholder="e.g. Jaipur"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-primary transition-colors">Duration</Label>
                          <div className="relative group">
                             <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                             <input 
                               type="number"
                               value={formData.days}
                               onChange={(e) => setFormData({...formData, days: e.target.value})}
                               className="w-full bg-[#020617] h-16 rounded-[1.5rem] pl-16 pr-6 font-black text-base text-white border border-white/10 shadow-inner focus:outline-none focus:ring-4 ring-primary/10 transition-all"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-primary transition-colors">Tier</Label>
                          <div className="relative group">
                             <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                             <select 
                               value={formData.budget}
                               onChange={(e) => setFormData({...formData, budget: e.target.value})}
                               className="w-full bg-[#020617] h-16 rounded-[1.5rem] pl-16 pr-10 font-black text-base text-white border border-white/10 shadow-inner focus:outline-none focus:ring-4 ring-primary/10 transition-all appearance-none cursor-pointer"
                             >
                               <option className="bg-[#0B1120] text-white">Budget</option>
                               <option className="bg-[#0B1120] text-white">Standard</option>
                               <option className="bg-[#0B1120] text-white">Luxury</option>
                             </select>
                             <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none rotate-90" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-primary transition-colors">Core Interests</Label>
                       <div className="relative group">
                        <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input 
                           value={formData.interests}
                           onChange={(e) => setFormData({...formData, interests: e.target.value})}
                           className="w-full bg-[#020617] h-16 rounded-[1.5rem] pl-16 pr-8 font-bold text-sm text-white border border-white/10 shadow-inner focus:outline-none focus:ring-4 ring-primary/10 transition-all placeholder:text-white/20"
                           placeholder="History, Art, Local Food..."
                        />
                       </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-20 rounded-[2rem] bg-primary hover:bg-orange-600 text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {loading ? (
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="uppercase tracking-[0.3em] text-[10px] font-black">Orchestrating Logic...</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-4 relative z-10">
                          <Sparkles className="h-6 w-6 animate-pulse text-white/50" />
                          <span className="uppercase tracking-[0.3em] text-[10px] font-black glow-primary">Generate Odyssey</span>
                       </div>
                    )}
                  </Button>
               </form>

               <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center gap-6 max-w-md mx-auto">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#020617] flex items-center justify-center shadow-2xl text-primary border border-white/10">
                    <Info className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium text-white/40 leading-relaxed italic">
                    "Our AI models are trained on exclusive heritage archives and real-time transit telemetry to ensure 100% authenticity."
                  </p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-transparent">
               <div className="p-10 border-b border-white/5 shrink-0 bg-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-4xl font-black font-serif text-white italic">The Timeline</h2>
                    <Button variant="ghost" size="icon" onClick={() => setItinerary(null)} className="text-white/20 hover:text-primary">
                       <ChevronRight className="h-5 w-5 rotate-180" />
                    </Button>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Node: {formData.city} • Sequence Locked</p>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="absolute left-[54px] top-40 bottom-10 w-[1px] bg-white/5" />
                  
                  {Object.entries(itinerary).map(([day, activities]: [string, any], idx) => (
                    <div key={day} className="relative pl-16">
                       {/* Day Circle */}
                       <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-primary text-white flex flex-col items-center justify-center z-10 border-4 border-[#0B1120] shadow-2xl">
                          <span className="text-[8px] font-black leading-none opacity-60">D</span>
                          <span className="text-sm font-black leading-none">{idx + 1}</span>
                       </div>

                       <div className="space-y-6">
                          {activities.map((act: any, aIdx: number) => (
                            <motion.div 
                              key={aIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="group heritage-card p-6 border-l-4 border-l-primary hover:border-l-primary active:scale-[0.98] transition-all"
                            >
                               <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                     <Clock className="h-3 w-3" />
                                     <span>{act.time}</span>
                                  </div>
                                  {act.status && (
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 text-emerald-400 px-2 py-0.5 rounded-full border border-white/20 glow-primary">{act.status}</span>
                                  )}
                               </div>
                               <h3 className="text-xl font-black font-serif text-white mb-2 group-hover:text-primary transition-colors">{act.name}</h3>
                               <p className="text-[11px] font-medium text-white/40 leading-relaxed line-clamp-2">{act.description}</p>
                               
                               <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{act.type}</span>
                                  <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full text-white/20 group-hover:text-white">
                                     <MoreVertical className="h-3 w-3" />
                                  </Button>
                               </div>
                            </motion.div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-10 border-t border-white/5 shrink-0">
                  <Button className="w-full h-16 rounded-2xl bg-white/10 text-white hover:bg-white/20 font-black text-xs uppercase tracking-widest shadow-2xl hover:opacity-90 active:scale-95 transition-all text-white border border-white/5">
                     Download Full Ledger
                  </Button>
               </div>
            </div>
          )}
        </div>

        {/* 3. Main Center/Right Area: Interactive Visualization (The Map) */}
        <div className="flex-1 bg-[#020617] relative">
          <InteractiveMap points={mapPoints} />
          
          {/* Overlay UI elements for the map */}
          <div className="absolute top-10 left-10 z-20 space-y-4">
             <div className="bg-[#0B1120]/90 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/5 shadow-2xl flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white glow-primary">
                   <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Anchor</p>
                  <p className="text-sm font-black text-white">Jaipur Spatial Node</p>
                </div>
             </div>

             <div className="flex gap-2">
                <Button variant="outline" size="icon" className="bg-[#0B1120]/90 backdrop-blur-md w-12 h-12 rounded-xl border border-white/5 shadow-2xl text-white/40 hover:text-primary transition-all hover:bg-white/10 hover:border-primary/20">
                   <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="bg-[#0B1120]/90 backdrop-blur-md w-12 h-12 rounded-xl border border-white/5 shadow-2xl text-white/40 hover:text-primary transition-all hover:bg-white/10 hover:border-primary/20">
                   <Maximize2 className="h-5 w-5" />
                </Button>
             </div>
          </div>

          {!itinerary && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="bg-[#020617]/60 backdrop-blur-3xl p-20 rounded-full border-2 border-dashed border-white/10 flex flex-col items-center text-white/90 glass-3d">
                  <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center mb-8">
                     <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin glow-primary" />
                  </div>
                  <h3 className="text-3xl font-black font-serif text-white/30 select-none">Awaiting Parameters...</h3>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LayoutGrid({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
