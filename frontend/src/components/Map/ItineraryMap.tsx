/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Sparkles, MapPin, Clock, Calendar, Compass, ArrowRight, ShieldCheck, Globe, Map as MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ItineraryStop } from "./types"
import AIItineraryRoute from "./AIItineraryRoute"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ItineraryMap({ transparent = false }: { transparent?: boolean }) {
  const [city, setCity] = useState("")
  const [days, setDays] = useState("2")
  const [budget, setBudget] = useState("medium")
  const [stops, setStops] = useState<ItineraryStop[]>([])
  const [loading, setLoading] = useState(false)
  const [activeDay, setActiveDay] = useState(1)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${apiUrl}/ai/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          days: Number(days),
          budget,
          interests: "Culture, Sightseeing, Food" 
        })
      })

      if (!res.ok) throw new Error("Failed to generate AI itinerary")
      
      const data = await res.json()
      const flatStops: ItineraryStop[] = []
      const itineraryData = data.itinerary || data
      
      Object.keys(itineraryData).forEach(dayKey => {
        const dayNumber = parseInt(dayKey.replace("day", "").replace("Day ", "")) || 1
        const places = itineraryData[dayKey]
        
        if (Array.isArray(places)) {
          places.forEach((p: any) => {
            flatStops.push({
              name: p.name || p.place || p.activity,
              lat: p.lat || 0,
              lng: p.lng || 0,
              day: dayNumber,
              time: p.time || "Flexible",
              description: p.description || `AI Recommended attraction in ${city}`
            })
          })
        }
      })

      setStops(flatStops)
      setActiveDay(1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const days_list = Array.from({ length: Number(days) }, (_, i) => i + 1)

  return (
    <div className={cn("min-h-full flex flex-col gap-12", !transparent && "bg-background p-12")}>
      
      {/* 1. Header Section */}
      {!transparent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
           <h2 className="text-5xl font-black tracking-tighter">Your Odyssey</h2>
           <Link href="/map">
             <Button variant="outline" className="rounded-2xl font-black h-12 px-8 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                <MapIcon className="h-4 w-4 mr-2" /> Live Visualization
             </Button>
           </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
        {/* Left: Input Form */}
        <Card className={cn("lg:col-span-4 rounded-[3rem] border border-white/10 overflow-hidden", transparent ? "glass-command" : "bg-card shadow-4xl")}>
          <CardHeader className="p-10 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Orchestrator</p>
            </div>
            <CardTitle className="text-3xl font-black italic tracking-tighter leading-tight">Instantiate Trajectory.</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target Node (City)</Label>
                <Input 
                  placeholder="e.g. Goa, Jaipur, Mumbai" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-2xl h-16 bg-background/50 border-white/5 focus:ring-primary focus:border-primary px-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Temporal Duration</Label>
                  <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="rounded-2xl h-16 bg-background/50 border-white/5">
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 glass-command">
                      <SelectItem value="1">1 Solar Cycle</SelectItem>
                      <SelectItem value="2">2 Solar Cycles</SelectItem>
                      <SelectItem value="3">3 Solar Cycles</SelectItem>
                      <SelectItem value="5">5 Solar Cycles</SelectItem>
                      <SelectItem value="7">7 Solar Cycles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Fiscal Tier</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="rounded-2xl h-16 bg-background/50 border-white/5">
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 glass-command">
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="medium">Standard</SelectItem>
                      <SelectItem value="luxury">Luxury Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !city} 
                className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-4xl hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Computing Trajectory...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-3">Initialize Odyssey <ArrowRight className="h-4 w-4" /></span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Results Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {stops.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                {/* Day Selection Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                  <div className="flex gap-3 flex-wrap bg-white/5 p-4 rounded-3xl border border-white/10">
                    {days_list.map(d => (
                      <button 
                        key={d} 
                        onClick={() => setActiveDay(d)}
                        className={cn(
                          "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 cursor-pointer shadow-xl",
                          activeDay === d 
                            ? "bg-primary text-white shadow-primary/20 scale-105" 
                            : "bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10"
                        )}
                      >
                        Day {d}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6 relative max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="absolute left-8 top-8 bottom-8 w-[2px] bg-gradient-to-b from-primary via-primary/30 to-transparent" />
                    {stops.filter(s => (s.day ?? 1) === activeDay).map((stop, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-16 group"
                      >
                        <div className="absolute left-0 top-0 w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black bg-white/5 border border-white/5 transition-all duration-500 group-hover:bg-primary group-hover:text-white z-10 italic">
                          {i + 1}
                        </div>
                        <div className="p-8 glass-command rounded-[2.5rem] border border-white/5 transition-all duration-700 hover:border-primary/20">
                          <p className="font-black text-lg italic tracking-tight mb-2 truncate group-hover:text-primary transition-colors">{stop.name}.</p>
                          <div className="flex items-center gap-4 mb-4">
                            <p className="text-[9px] font-black text-primary flex items-center gap-2 uppercase tracking-widest"><Clock className="h-3.5 w-3.5" /> {stop.time}</p>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest italic">{city}</p>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed pr-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">{stop.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Map/Visualization Matrix */}
                <div className="lg:col-span-8 rounded-[3rem] overflow-hidden border border-white/10 h-[600px] lg:h-auto shadow-4xl relative">
                  <AIItineraryRoute stops={stops.filter(s => (s.day ?? 1) === activeDay)} />
                  <div className="absolute top-8 left-8 glass-command px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 z-[1000]">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Temporal Layer {activeDay} Active</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] bg-white/5 border border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center p-20 text-center"
              >
                 <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10 border border-primary/20 animate-pulse">
                    <Compass className="h-16 w-16 text-primary/40" />
                 </div>
                 <h3 className="text-3xl font-black italic tracking-tighter mb-4 text-white/80">Command Matrix Idle.</h3>
                 <p className="text-sm font-medium text-muted-foreground max-w-sm leading-relaxed italic">
                    Configure target node and temporal duration to generate deep-dive trajectory analysis.
                 </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
