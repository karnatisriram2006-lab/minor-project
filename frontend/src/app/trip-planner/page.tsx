"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Navigation, 
  Compass,
  Wallet,
  MoreVertical,
  Maximize2,
  Info,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Deck.gl requires WebGL — must be client-only to avoid SSR errors
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#020617] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '0.6s' }} />
    </div>
  ),
})

interface ItineraryStop {
  name: string;
  type?: string;
  description?: string;
  time?: string;
  lat: number;
  lng: number;
  status?: string;
}

type ItineraryType = Record<string, ItineraryStop[]>

export default function TripPlanner() {
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null)
  const [formData, setFormData] = useState({
    city: "Jaipur",
    days: "3",
    interests: "Culture, History, Food",
    budget: "Luxury"
  })

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
      const dynamicMock: ItineraryType = {}
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
    return Object.values(itinerary).flatMap((day: ItineraryStop[]) => 
      day.map((act: ItineraryStop) => ({
        id: act.name,
        name: act.name,
        lat: Number(act.lat) || 26.9124,
        lng: Number(act.lng) || 75.7873,
        description: act.description || ""
      }))
    )
  }, [itinerary])

  return (
    <div className="flex flex-col h-screen pt-20 overflow-hidden bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10">
      
      {/* 1. Header Area - Heritage style */}
      <div className="h-24 border-b border-heritage-gold/10 bg-white/80 backdrop-blur-xl px-12 flex items-center justify-between z-20 shrink-0 shadow-premium">
        <div className="flex items-center gap-8">
           <h2 className="text-3xl font-extrabold text-heritage-onyx tracking-tighter">Trip Planner</h2>
           <div className="h-8 w-px bg-heritage-gold/20" />
           <div className="flex gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] bg-heritage-saffron/5 text-heritage-saffron px-4 py-1.5 rounded-full border border-heritage-saffron/10 shadow-soft-inner">AI Architect</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <Avatar key={i} className="h-10 w-10 border-2 border-white shadow-premium">
                  <AvatarFallback className="bg-heritage-bone text-heritage-gold text-xs font-bold">U{i}</AvatarFallback>
                </Avatar>
              ))}
           </div>
           <Button variant="premium" size="sm" className="px-8 h-10 text-[11px] uppercase tracking-widest transition-transform duration-[160ms] ease-emil-out active:scale-[0.97]">
              Invite Seekers
           </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. Left Panel: Config or Itinerary Timeline */}
        <div className={cn(
          "w-full lg:w-[480px] xl:w-[550px] bg-white border-r border-heritage-gold/10 flex flex-col z-10 transition-transform duration-500 ease-emil-in-out overflow-y-auto shadow-premium",
          itinerary ? "translate-x-0" : "translate-x-0"
        )}>
          {!itinerary ? (
            <div className="min-h-full flex flex-col justify-center p-12 lg:p-16 space-y-12 bg-transparent">
               <div className="space-y-4 text-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                    className="text-4xl lg:text-5xl font-extrabold text-heritage-onyx tracking-tighter leading-tight"
                  >
                    Architect your <br /><span className="text-heritage-saffron italic font-serif">Deep Journey.</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                    className="text-base font-medium text-heritage-onyx/50 max-w-sm mx-auto leading-relaxed"
                  >
                    Every path in Bharat tells a story. Tell us yours, and we&apos;ll weave the map.
                  </motion.p>
               </div>

               <form onSubmit={handleGenerate} className="space-y-8 max-w-md mx-auto w-full">
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-heritage-gold ml-2">Sacred Destination</Label>
                       <div className="relative group">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                          <input 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-heritage-bone/50 h-16 rounded-2xl pl-16 pr-8 font-bold text-lg text-heritage-onyx border border-heritage-gold/10 focus:outline-none focus:border-heritage-saffron/40 focus:ring-8 focus:ring-heritage-saffron/5 transition-all duration-200 ease-emil-out placeholder:text-heritage-onyx/20 shadow-soft-inner"
                            placeholder="e.g. Varanasi, India"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-heritage-gold ml-2">Duration (Days)</Label>
                          <div className="relative group">
                             <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                             <input 
                               type="number"
                               value={formData.days}
                               onChange={(e) => setFormData({...formData, days: e.target.value})}
                               className="w-full bg-heritage-bone/50 h-16 rounded-2xl pl-16 pr-8 font-bold text-lg text-heritage-onyx border border-heritage-gold/10 focus:outline-none focus:border-heritage-saffron/40 focus:ring-8 focus:ring-heritage-saffron/5 transition-all duration-200 ease-emil-out shadow-soft-inner"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-heritage-gold ml-2">Tier</Label>
                          <div className="relative group">
                             <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                             <select 
                               value={formData.budget}
                               onChange={(e) => setFormData({...formData, budget: e.target.value})}
                               className="w-full bg-heritage-bone/50 h-16 rounded-2xl pl-16 pr-10 font-bold text-lg text-heritage-onyx border border-heritage-gold/10 focus:outline-none focus:border-heritage-saffron/40 focus:ring-8 focus:ring-heritage-saffron/5 transition-all duration-200 ease-emil-out appearance-none cursor-pointer shadow-soft-inner"
                             >
                               <option>Economy</option>
                               <option>Classic</option>
                               <option>Imperial</option>
                             </select>
                             <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-heritage-gold pointer-events-none rotate-90" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-heritage-gold ml-2">Narrative Interests</Label>
                       <div className="relative group">
                        <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                        <input 
                           value={formData.interests}
                           onChange={(e) => setFormData({...formData, interests: e.target.value})}
                           className="w-full bg-heritage-bone/50 h-16 rounded-2xl pl-16 pr-8 font-bold text-base text-heritage-onyx border border-heritage-gold/10 focus:outline-none focus:border-heritage-saffron/40 focus:ring-8 focus:ring-heritage-saffron/5 transition-all duration-200 ease-emil-out placeholder:text-heritage-onyx/20 shadow-soft-inner"
                           placeholder="Culture, Gastronomy, Architecture..."
                        />
                       </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    variant="premium"
                    className="w-full h-20 rounded-2xl text-lg relative overflow-hidden group shadow-premium transition-transform duration-[160ms] ease-emil-out active:scale-[0.97]"
                  >
                    {loading ? (
                       <div className="flex items-center gap-4">
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs uppercase tracking-[0.3em] font-extrabold">Consulting Local Spirits...</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-4">
                          <Compass className="h-6 w-6 group-hover:rotate-180 transition-transform duration-300 ease-emil-in-out" />
                          <span className="text-xs uppercase tracking-[0.3em] font-extrabold">Initialize Itinerary</span>
                       </div>
                    )}
                  </Button>
               </form>

               <div className="p-8 rounded-[2rem] bg-heritage-bone border border-heritage-gold/10 flex items-center gap-6 max-w-md mx-auto shadow-soft-inner">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white flex items-center justify-center text-heritage-saffron shadow-premium border border-heritage-gold/5">
                    <Info className="h-7 w-7" />
                  </div>
                  <p className="text-xs font-bold text-heritage-onyx/50 leading-relaxed italic">
                    &quot;AI precision filtered through local wisdom to ensure every step is meaningful.&quot;
                  </p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-white relative">
               <div className="p-10 border-b border-heritage-bone shrink-0 bg-heritage-bone/30">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-4xl font-extrabold text-heritage-onyx tracking-tighter leading-none">The Path</h2>
                    <Button variant="ghost" size="icon" onClick={() => setItinerary(null)} className="text-heritage-onyx/30 hover:text-heritage-saffron transition-transform duration-[160ms] ease-emil-out active:scale-95 hover:bg-heritage-bone/50">
                       <ChevronRight className="h-6 w-6 rotate-180" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-heritage-saffron animate-pulse" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-heritage-gold">Unveiling {formData.city}</p>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  {Object.entries(itinerary).map(([day, activities]: [string, ItineraryStop[]], idx) => (
                    <div key={day} className="relative pl-14 border-l-2 border-dashed border-heritage-gold/20 last:border-l-transparent">
                       {/* Day Marker */}
                       <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-2xl bg-heritage-onyx text-heritage-bone flex items-center justify-center z-10 font-black text-xs shadow-premium border-2 border-heritage-gold/40">
                          {idx + 1}
                       </div>

                       <div className="space-y-8">
                          {activities.map((act: ItineraryStop, aIdx: number) => (
                             <motion.div 
                               key={aIdx}
                               initial={{ opacity: 0, x: 20, scale: 0.95 }}
                               animate={{ opacity: 1, x: 0, scale: 1 }}
                               transition={{ delay: aIdx * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                               className="premium-card group px-8 py-6 hover:translate-x-2 active:scale-[0.97] transition-all duration-[250ms] ease-emil-out cursor-pointer"
                             >
                               <div className="flex items-center justify-between mb-4 text-[10px] font-black uppercase tracking-[0.3em]">
                                  <div className="flex items-center gap-2 text-heritage-saffron">
                                     <Clock className="h-4 w-4" />
                                     <span>{act.time}</span>
                                  </div>
                                  {act.status && (
                                    <span className="bg-heritage-gold/5 text-heritage-gold px-3 py-1 rounded-full border border-heritage-gold/10 shadow-soft-inner">{act.status}</span>
                                  )}
                               </div>
                               <h3 className="text-2xl font-extrabold text-heritage-onyx mb-2 group-hover:text-heritage-saffron transition-colors duration-[250ms] tracking-tight">{act.name}</h3>
                               <p className="text-sm text-heritage-onyx/50 leading-relaxed font-medium line-clamp-2 italic">{act.description}</p>
                               
                               <div className="mt-6 flex items-center justify-between border-t border-heritage-bone pt-4">
                                  <span className="text-[10px] font-black text-heritage-gold/40 uppercase tracking-[0.4em]">{act.type}</span>
                                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-heritage-onyx/20 group-hover:text-heritage-saffron transition-colors duration-[160ms] ease-emil-out hover:bg-heritage-bone/50">
                                     <MoreVertical className="h-4 w-4" />
                                  </Button>
                               </div>
                            </motion.div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-10 border-t border-heritage-bone shrink-0 bg-white shadow-soft-inner">
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-heritage-gold/20 text-heritage-onyx hover:bg-heritage-bone hover:text-heritage-saffron font-bold text-xs uppercase tracking-[0.3em] transition-all duration-[200ms] ease-emil-out active:scale-[0.97] shadow-premium">
                     Scribe Journey (PDF)
                  </Button>
               </div>
            </div>
          )}
        </div>

        {/* 3. Main Center/Right Area: Map */}
        <div className="flex-1 bg-heritage-bone relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <InteractiveMap points={mapPoints} />
          </div>
          
          {/* Overlay UI elements for the map */}
          <div className="absolute top-10 right-10 z-20 space-y-4">
             <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] border border-heritage-gold/10 shadow-premium flex items-center gap-6 animate-float">
                <div className="w-14 h-14 rounded-2xl bg-heritage-onyx flex items-center justify-center text-heritage-gold shadow-premium border border-heritage-gold/20">
                   <Navigation className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-heritage-gold uppercase tracking-[0.3em] mb-1">Focus Point</p>
                  <p className="text-xl font-extrabold text-heritage-onyx tracking-tighter leading-none">{formData.city}</p>
                </div>
             </div>

             <div className="flex gap-3 justify-end">
                <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-md w-14 h-14 rounded-2xl border border-heritage-gold/10 shadow-premium text-heritage-onyx hover:text-heritage-saffron hover:bg-white transition-all duration-[160ms] ease-emil-out active:scale-95">
                   <LayoutGrid className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-md w-14 h-14 rounded-2xl border border-heritage-gold/10 shadow-premium text-heritage-onyx hover:text-heritage-saffron hover:bg-white transition-all duration-[160ms] ease-emil-out active:scale-95">
                   <Maximize2 className="h-6 w-6" />
                </Button>
             </div>
          </div>

          {!itinerary && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
               <div className="bg-white/70 backdrop-blur-2xl p-20 rounded-[4rem] border border-heritage-gold/10 flex flex-col items-center shadow-premium scale-110">
                  <div className="w-28 h-28 rounded-full border-4 border-heritage-gold/10 flex items-center justify-center mb-10 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-tr from-heritage-saffron/20 to-heritage-gold/20 animate-pulse" />
                     <div className="w-16 h-16 rounded-full border-[6px] border-heritage-saffron border-t-transparent animate-spin" style={{ animationDuration: '0.5s' }} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-heritage-onyx/20 select-none tracking-tighter">Awaiting your coordinates</h3>
                  <div className="mt-6 flex gap-4">
                   <div className="h-1.5 w-12 rounded-full bg-heritage-gold/20" />
                   <div className="h-1.5 w-6 rounded-full bg-heritage-saffron/20" />
                   <div className="h-1.5 w-12 rounded-full bg-heritage-gold/20" />
                  </div>
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
      strokeWidth="2" 
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
