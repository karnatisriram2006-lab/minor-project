"use client"
/* Forced update marker: v2.0.0 - Leaflet Redesign */

import dynamic from "next/dynamic"
import { useState, useMemo } from "react"
import axios from "axios"
import { Map, MapPin, Navigation, Plus, Trash2, Sparkles, Route, Info, Compass, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f5f3ef] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-[#E8391A] border-t-transparent animate-spin" />
    </div>
  ),
})

interface OptimizedStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visitOrder: number;
  order?: number;
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export default function RoutePlanner() {
  const [places, setPlaces] = useState<Place[]>([
    { id: "1", name: "Taj Mahal, Agra", lat: 27.1751, lng: 78.0421 },
    { id: "2", name: "Agra Fort", lat: 27.1798, lng: 78.0213 },
  ])
  const [newPlace, setNewPlace] = useState("")
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedStop[]>([])
  const [loading, setLoading] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const getCoordinates = async (name: string): Promise<{ lat: number, lng: number } | null> => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: name,
          format: "json",
          limit: 1,
          countrycodes: "in"
        },
        headers: { "User-Agent": "Yatra-Travel-Planner" }
      });
      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  }

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlace.trim() && !isGeocoding) {
      setIsGeocoding(true)
      const coords = await getCoordinates(newPlace.trim());
      if (coords) {
        setPlaces([...places, { 
          id: Date.now().toString(), 
          name: newPlace.trim(),
          ...coords
        }])
        setNewPlace("")
        setOptimizedRoute([])
      } else {
        alert("Could not find the location.")
      }
      setIsGeocoding(false)
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
      const { data } = await api.post("/route/optimize", {
        locations: places.map(p => ({
          id: p.id,
          name: p.name,
          lat: p.lat,
          lng: p.lng
        }))
      })
      const optimized = data.optimizedRoute.map((p: any) => ({
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

  const mapPoints = useMemo(() => {
    const dataSource = optimizedRoute.length > 0 ? optimizedRoute : places;
    return dataSource.filter(p => !!p && p.lat && p.lng).map((p, idx) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      description: `Stop ${idx + 1}`
    }))
  }, [places, optimizedRoute])

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] pt-0 pb-24 sm:pt-4 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-10">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#E8391A] bg-[#E8391A]/8 px-3 py-1 rounded-full border border-[#E8391A]/15">
              <Navigation className="h-3.5 w-3.5" />
              Route Optimizer
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Plan your <span className="text-[#E8391A]">route</span>
          </h1>
          <p className="text-[#777] text-base max-w-xl leading-relaxed">
            Add destinations and calculate the most efficient route across India.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-[#f0ede8] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f0ede8] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-tight">Stops</h2>
                  <p className="text-xs text-[#777] mt-0.5">{places.length} destinations added</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <form onSubmit={handleAddPlace} className="flex gap-2">
                  <Input
                    placeholder="Add a destination..."
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="flex-1 h-11 rounded-xl bg-gray-50 border-[#f0ede8] focus:border-[#E8391A]"
                  />
                  <Button
                    type="submit"
                    disabled={isGeocoding}
                    className="h-11 w-11 bg-[#E8391A] text-white rounded-xl grow-0"
                  >
                    {isGeocoding ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </Button>
                </form>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {places.map((place, index) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-[#f0ede8] hover:border-[#E8391A]/20 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-[#E8391A] text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm truncate">{place.name}</span>
                        </div>
                        <Button
                          variant="ghost" size="icon" onClick={() => handleRemovePlace(place.id)}
                          className="text-gray-400 hover:text-[#E8391A]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Button
                   variant="premium" onClick={handleOptimize}
                  disabled={places.length < 2 || loading}
                  className="w-full h-12 rounded-xl text-sm font-bold bg-[#E8391A] text-white"
                >
                  {loading ? "Optimizing..." : "Optimize route"}
                </Button>
              </div>
            </div>

            {optimizedRoute.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Compass className="h-5 w-5 text-[#E8391A]" />
                  <h3 className="text-sm font-bold text-white">Suggested Order</h3>
                </div>
                {optimizedRoute.map((place) => (
                  <div key={place.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-white text-[#1a1a1a] flex items-center justify-center text-xs font-bold">
                      {place.visitOrder}
                    </div>
                    <span className="font-medium text-white text-sm">{place.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="xl:col-span-3 h-[620px] rounded-2xl overflow-hidden border border-[#f0ede8] shadow-sm relative">
            <InteractiveMap points={mapPoints as any} />
          </div>
        </div>

      </div>
    </div>
  )
}
