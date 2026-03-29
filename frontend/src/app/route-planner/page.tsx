"use client"

import { useState } from "react"
import axios from "axios"
import { Map, MapPin, Navigation, Plus, Trash2, Sparkles, Route, Info, Compass, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OptimizedStop {
  id: string;
  name: string;
  visitOrder: number;
  order?: number;
}

export default function RoutePlanner() {
  const [places, setPlaces] = useState<{ id: string; name: string }[]>([
    { id: "1", name: "Taj Mahal, Agra" },
    { id: "2", name: "Agra Fort" },
  ])
  const [newPlace, setNewPlace] = useState("")
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedStop[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlace.trim()) {
      setPlaces([...places, { id: Date.now().toString(), name: newPlace.trim() }])
      setNewPlace("")
      setOptimizedRoute([])
    }
  }

  const handleRemovePlace = (id: string) => {
    setPlaces(places.filter(p => p.id !== id))
    setOptimizedRoute([])
  }

  const handleOptimize = async () => {
    if (places.length < 2) return
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await axios.post(`${apiUrl}/route/optimize`, {
        locations: places.map(p => ({
          name: p.name,
          lat: 27.1751 + (Math.random() * 0.1),
          lng: 78.0421 + (Math.random() * 0.1)
        }))
      })
      const optimized = res.data.optimizedRoute.map((p: { id: string; name: string; order: number }) => ({
        ...p,
        visitOrder: p.order
      }))
      setOptimizedRoute(optimized)
    } catch (err) {
      console.error("Optimization error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-0 pb-24 sm:pt-4 sm:pb-12 font-sans">

      <div className="container mx-auto px-6 max-w-6xl space-y-10">

        {/* ── Page Header ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Navigation className="h-3.5 w-3.5" />
              Route Optimizer
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Plan your <span className="text-[#FF5A5F]">route</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Add your destinations and we&apos;ll calculate the most efficient route across India.
          </p>
        </div>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

          {/* Left: Input + Results */}
          <div className="xl:col-span-2 space-y-5">

            {/* Stop input card */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EBEBEB] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#484848] tracking-tight">Stops</h2>
                  <p className="text-xs text-[#767676] mt-0.5">Add at least 2 destinations</p>
                </div>
                <span className="text-xs font-semibold text-[#767676] bg-[#F7F7F7] px-3 py-1.5 rounded-lg border border-[#EBEBEB]">
                  {places.length} stop{places.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Add place form */}
                <form onSubmit={handleAddPlace} className="flex gap-2">
                  <Input
                    placeholder="Add a destination..."
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="flex-1 h-11 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all px-4"
                  />
                  <Button
                    type="submit"
                    className="h-11 w-11 bg-[#FF5A5F] hover:bg-[#e04f54] text-white rounded-xl shrink-0 transition-all active:scale-95 p-0 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </form>

                {/* Places list */}
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {places.map((place, index) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        layout
                        className="flex items-center justify-between px-4 py-3 bg-[#F7F7F7] rounded-xl border border-[#EBEBEB] hover:border-[#FF5A5F]/20 hover:bg-white transition-all group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-[#FF5A5F]/10 text-[#FF5A5F] flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-medium text-[#484848] text-sm truncate">{place.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePlace(place.id)}
                          className="h-8 w-8 text-[#BBBBBB] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/5 rounded-lg shrink-0 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {places.length === 0 && (
                    <div className="py-10 text-center space-y-2 border-2 border-dashed border-[#EBEBEB] rounded-xl">
                      <MapPin className="h-8 w-8 text-[#DDDDDD] mx-auto" />
                      <p className="text-xs text-[#BBBBBB] font-medium">No stops added yet</p>
                    </div>
                  )}
                </div>

                {/* Optimize button */}
                <Button
                  variant="premium"
                  className="w-full h-12 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  onClick={handleOptimize}
                  disabled={places.length < 2 || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Optimizing route...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      <span>Optimize route</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Optimized results */}
            <AnimatePresence>
              {optimizedRoute.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#484848] rounded-2xl border border-[#484848] overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <Compass className="h-5 w-5 text-[#FF5A5F]" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Optimized Route</h3>
                      <p className="text-[11px] text-white/40 font-medium">Best travel order</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {optimizedRoute.map((place) => (
                      <div key={place.id} className="flex items-center gap-3 px-4 py-3 bg-white/8 rounded-xl border border-white/8 hover:bg-white/12 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-white text-[#484848] flex items-center justify-center text-xs font-bold shrink-0">
                          {place.visitOrder}
                        </div>
                        <span className="font-medium text-white text-sm">{place.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2 px-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#FF5A5F]" />
                      <span className="text-[11px] text-white/40 font-medium">{optimizedRoute.length} stops optimized</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="xl:col-span-3 sticky top-28"
          >
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden" style={{ minHeight: '620px' }}>
              {/* Map card header */}
              <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5A5F]/8 flex items-center justify-center text-[#FF5A5F]">
                    <Map className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#484848]">Route Map</h3>
                    <p className="text-[11px] text-[#767676]">Visual route preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF5A5F] animate-pulse" />
                  <span className="text-[11px] font-semibold text-[#767676]">Live</span>
                </div>
              </div>

              {/* Map body — dot-grid background + placeholder */}
              <div
                className="flex-1 relative flex items-center justify-center"
                style={{
                  minHeight: '560px',
                  backgroundImage: `radial-gradient(circle at 2px 2px, #DDDDDD 1.5px, transparent 0)`,
                  backgroundSize: '28px 28px',
                  backgroundColor: '#FAFAFA'
                }}
              >
                <div className="text-center space-y-5 p-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#EBEBEB] shadow-sm max-w-sm relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF5A5F]/8 flex items-center justify-center mx-auto">
                    <MapPin className="h-7 w-7 text-[#FF5A5F]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#484848]">Map preview</h3>
                    <p className="text-sm text-[#767676] leading-relaxed">
                      Add your stops and optimize the route to see the map visualization here.
                    </p>
                  </div>
                  {optimizedRoute.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 pt-1"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#FF5A5F]" />
                      <span className="text-xs font-semibold text-[#00A699]">
                        Route optimized — {optimizedRoute.length} stops
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Info footnote */}
                <div className="absolute bottom-5 left-5 right-5 flex items-start gap-3 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 border border-[#EBEBEB] shadow-sm">
                  <Info className="h-4 w-4 text-[#767676] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#767676] leading-relaxed">
                    Route calculations use approximate coordinates. Connect to backend for precise geospatial data.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CTA strip ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#484848]">Ready to plan your full trip?</h3>
            <p className="text-sm text-[#767676]">Generate a day-by-day AI itinerary from the Trip Planner.</p>
          </div>
          <Button variant="premium" className="h-11 px-6 rounded-xl text-sm font-semibold shrink-0 group transition-all active:scale-[0.97]">
            Open Trip Planner
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </div>
  )
}
