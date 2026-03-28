"use client"

import { useState } from "react"
import axios from "axios"
import { Map, MapPin, Navigation, Plus, Trash2, ArrowRight, Sparkles, Route, Info, Compass } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function RoutePlanner() {
  const [places, setPlaces] = useState<{ id: string; name: string }[]>([
    { id: "1", name: "Taj Mahal, Agra" },
    { id: "2", name: "Agra Fort" },
  ])
  const [newPlace, setNewPlace] = useState("")
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([])
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
          lat: 27.1751 + (Math.random() * 0.1), // Mock coords if not provided
          lng: 78.0421 + (Math.random() * 0.1)
        }))
      })
      
      const optimized = res.data.optimizedRoute.map((p: any) => ({
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
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-tr from-red-50/20 via-white to-gray-50/10" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-16">
        
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF385C]/5 text-[#FF385C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FF385C]/10 shadow-sm"
          >
            <Navigation className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-[#222222]">
               Route <span className="text-[#FF385C]">Planner</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Organize your trip efficiently with our smart route optimization tool.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
          
          {/* Input Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-4 space-y-8"
          >
            <Card className="bg-white rounded-[2rem] border-gray-100 shadow-sm overflow-hidden h-fit">
              <CardHeader className="p-10 border-b border-gray-50">
                <div className="flex justify-between items-center">
                   <CardTitle className="text-xl font-bold">Destinations</CardTitle>
                   <div className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400"> {places.length} Items </div>
                </div>
                <CardDescription className="text-xs font-semibold uppercase tracking-widest text-gray-400">Manage your locations</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <form onSubmit={handleAddPlace} className="flex gap-3">
                  <Input 
                    placeholder="Add a new place..." 
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="bg-white rounded-xl h-14 font-bold text-sm focus:ring-4 focus:ring-[#FF385C]/5 border-gray-100 transition-all px-5 shadow-sm flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-[#FF385C] text-white hover:bg-[#E31C5F] rounded-xl h-14 w-14 cursor-pointer shadow-sm shrink-0 transition-all active:scale-95">
                    <Plus className="h-5 w-5" />
                  </Button>
                </form>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {places.map((place, index) => (
                      <motion.div 
                        key={place.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 px-6 bg-gray-50 rounded-xl border border-transparent transition-all hover:border-gray-100 group"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="bg-white text-[#FF385C] w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border border-gray-100 shadow-sm">
                            {index + 1}
                          </div>
                          <span className="font-bold text-[#222222] text-sm truncate">{place.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemovePlace(place.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 h-8 w-8 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {places.length === 0 && (
                    <div className="py-16 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                       <MapPin className="h-10 w-10 text-gray-200 mx-auto" />
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No places added yet</p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-14 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50" 
                  onClick={handleOptimize}
                  disabled={places.length < 2 || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span>Optimizing...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">Calculate Optimal Route <Route className="h-4 w-4" /></span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <AnimatePresence>
              {optimizedRoute.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card className="bg-[#222222] rounded-[2rem] border-none shadow-sm overflow-hidden text-white">
                    <CardHeader className="p-10 pb-6 border-b border-white/5 space-y-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <Compass className="h-5 w-5 text-[#FF385C]" /> 
                        Optimized Route
                      </CardTitle>
                      <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Time-efficient sequence</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 pt-10">
                      {optimizedRoute.map((place) => (
                        <div key={place.id} className="relative flex items-center gap-6 group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-[#222222] shadow-sm shrink-0 z-10 font-bold text-sm italic">
                            {place.visitOrder}
                          </div>
                          <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                            <h4 className="font-bold text-white text-sm">{place.name}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Stop {place.visitOrder}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12 xl:col-span-8 sticky top-32"
          >
            <Card className="bg-white rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden h-full flex flex-col min-h-[700px]">
              <div className="p-8 px-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-[#FF385C]/5 rounded-xl">
                      <Map className="h-5 w-5 text-[#FF385C]" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold">Map Preview</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Interactive Visualization</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-4 py-1.5 rounded-full border border-gray-100">Live</span>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-50/20">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #FF385C 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }} />
                
                <div className="text-center space-y-6 p-12 bg-white rounded-[2rem] max-w-lg relative z-10 shadow-sm border border-gray-50 group">
                  <div className="relative">
                     <MapPin className="h-16 w-16 text-[#FF385C] mx-auto relative z-10 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[#222222]">Route Visualization</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed px-6">
                      An interactive map will appear here to visualize your sequence of stops across the destination.
                    </p>
                  </div>
                  {optimizedRoute.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 pt-8 border-t border-gray-50"
                    >
                      <div className="flex items-center justify-center gap-3">
                         <Sparkles className="h-4 w-4 text-emerald-500" />
                         <span className="text-xs font-bold uppercase tracking-widest text-[#00A699]">
                            Route optimized for {optimizedRoute.length} locations
                         </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="absolute bottom-10 left-10 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 flex items-start gap-4 max-w-xs shadow-sm">
                   <Info className="h-5 w-5 text-[#FF385C] shrink-0" />
                   <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                      Distance calculation utilizes real-time travel heuristics. Production API integration pending.
                   </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
