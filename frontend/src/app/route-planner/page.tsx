"use client"

import { useState } from "react"
import axios from "axios"
import { Map, MapPin, Navigation, Plus, Trash2, Sparkles, Route, Info, Compass, ArrowRightCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-40 pb-56 relative overflow-hidden font-sans">
      
      {/* Cinematic Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767608, transparent 40%)' }} />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-24">
        
        {/* Header Section */}
        <div className="text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-heritage-saffron/5 border border-heritage-saffron/10 text-heritage-saffron text-[10px] font-black uppercase tracking-[0.4em] shadow-soft-inner mx-auto mb-4"
          >
            <Navigation className="h-4 w-4" />
            Path Conjurer
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-[8rem] font-extrabold tracking-tighter leading-none text-heritage-onyx italic">
               Flow <span className="text-heritage-saffron underline decoration-heritage-saffron/20">Matrices.</span>
            </h1>
            <p className="text-xl md:text-2xl text-heritage-onyx/40 font-medium max-w-3xl mx-auto leading-relaxed">
              Synchronize your destinations with high-fidelity spatial intelligence for the optimal traversal of Bharat.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pt-12">
          
          {/* Input Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-12 xl:col-span-4 space-y-12"
          >
            <Card className="bg-white rounded-[3rem] border-heritage-gold/10 shadow-premium overflow-hidden h-fit">
              <CardHeader className="p-12 border-b border-heritage-bone">
                <div className="flex justify-between items-center mb-4">
                   <CardTitle className="text-3xl font-black text-heritage-onyx tracking-tighter italic">Stops.</CardTitle>
                   <div className="bg-heritage-bone px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-heritage-onyx/40 shadow-soft-inner"> {places.length} Sequence Point </div>
                </div>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold">Calibrate your traversal</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <form onSubmit={handleAddPlace} className="flex gap-4">
                  <Input 
                    placeholder="Enter destination..." 
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="bg-heritage-bone/50 rounded-[1.2rem] h-16 font-black text-lg text-heritage-onyx focus:ring-8 focus:ring-heritage-saffron/5 border-heritage-gold/10 transition-all px-8 shadow-soft-inner flex-1 placeholder:text-heritage-onyx/20"
                  />
                  <Button type="submit" size="icon" className="bg-heritage-saffron text-white hover:bg-heritage-onyx rounded-[1.2rem] h-16 w-16 cursor-pointer shadow-premium shrink-0 transition-all active:scale-95 group">
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                  </Button>
                </form>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {places.map((place, index) => (
                      <motion.div 
                        key={place.id} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        layout
                        className="flex items-center justify-between p-6 bg-heritage-bone/30 rounded-[1.5rem] border border-transparent transition-all hover:bg-white hover:shadow-premium group"
                      >
                        <div className="flex items-center gap-6 overflow-hidden">
                          <div className="bg-white text-heritage-saffron w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border border-heritage-gold/5 shadow-soft-inner">
                            {index + 1}
                          </div>
                          <span className="font-black text-heritage-onyx text-base tracking-tighter truncate">{place.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemovePlace(place.id)}
                          className="text-heritage-onyx/20 hover:text-heritage-saffron hover:bg-heritage-saffron/5 rounded-xl shrink-0 h-10 w-10 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {places.length === 0 && (
                    <div className="py-24 text-center space-y-6 bg-heritage-bone/20 rounded-[2.5rem] border-2 border-dashed border-heritage-gold/10">
                       <MapPin className="h-16 w-16 text-heritage-gold/20 mx-auto" />
                       <p className="text-[10px] font-black text-heritage-gold/40 uppercase tracking-[0.5em] italic">No Points Synchronized</p>
                    </div>
                  )}
                </div>

                <Button 
                  variant="premium"
                  className="w-full h-20 rounded-[1.5rem] shadow-premium transition-all active:scale-[0.98] disabled:opacity-50" 
                  onClick={handleOptimize}
                  disabled={places.length < 2 || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-4">
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span className="font-black text-xs uppercase tracking-widest">Conjuring Path...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-4 font-black text-xs uppercase tracking-[0.3em]">Synthesize Optimal Route <Route className="h-5 w-5" /></span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <AnimatePresence>
              {optimizedRoute.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="bg-heritage-onyx rounded-[3rem] border-none shadow-premium overflow-hidden text-white relative group">
                    <div className="absolute inset-0 bg-heritage-saffron/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <CardHeader className="p-12 pb-8 border-b border-white/5 space-y-4 relative z-10">
                      <CardTitle className="text-3xl font-black flex items-center gap-4 italic tracking-tighter">
                        <Compass className="h-8 w-8 text-heritage-saffron" /> 
                        The Manifest.
                      </CardTitle>
                      <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">High-Fidelity Chronological Sequence</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6 pt-12 relative z-10">
                      {optimizedRoute.map((place) => (
                        <div key={place.id} className="relative flex items-center gap-8 group/item">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white text-heritage-onyx shadow-premium shrink-0 z-10 font-black text-xs italic transition-transform group-hover/item:scale-110">
                            {place.visitOrder}
                          </div>
                          <div className="flex-1 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 group-hover/item:bg-white/10 transition-all duration-500">
                            <h4 className="font-black text-white text-lg tracking-tighter">{place.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Vector Point {place.visitOrder}</p>
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
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-12 xl:col-span-8 sticky top-32"
          >
            <Card className="bg-white rounded-[3.5rem] border-heritage-gold/10 shadow-premium overflow-hidden h-full flex flex-col min-h-[850px]">
              <div className="p-10 px-12 border-b border-heritage-bone flex items-center justify-between bg-heritage-bone/20">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-heritage-saffron/5 rounded-2xl border border-heritage-saffron/10 shadow-soft-inner">
                      <Map className="h-7 w-7 text-heritage-saffron" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-heritage-onyx italic tracking-tighter">Spatial Surface.</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-heritage-gold">Geospatial Visualization</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="h-3 w-3 rounded-full bg-heritage-saffron animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-onyx/40 bg-white px-6 py-2 rounded-full border border-heritage-gold/5 shadow-soft-inner">Real-Time Sync</span>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-heritage-bone/10 p-12">
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, #76767640 1.5px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
                
                <div className="text-center space-y-10 p-20 bg-white rounded-[4rem] max-w-2xl relative z-10 shadow-premium border border-heritage-gold/5 group">
                  <div className="relative">
                     <div className="absolute inset-0 bg-heritage-saffron/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-150" />
                     <MapPin className="h-24 w-24 text-heritage-saffron mx-auto relative z-10 transition-transform duration-1000 group-hover:scale-125" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-4xl font-black text-heritage-onyx italic tracking-tighter">Neural Layout Pending.</h3>
                    <p className="text-heritage-onyx/40 font-medium text-lg leading-relaxed px-12 italic">
                      The high-fidelity spatial surface will materialize here, visualizing your sequence points across the sacred landscape.
                    </p>
                  </div>
                  {optimizedRoute.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-12 pt-12 border-t border-heritage-bone"
                    >
                      <div className="flex items-center justify-center gap-4">
                         <Sparkles className="h-5 w-5 text-heritage-saffron" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-heritage-gold">
                            Resonance Synchronized: {optimizedRoute.length} Stop Matrices
                         </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="absolute bottom-12 left-12 p-8 bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-heritage-gold/10 flex items-start gap-6 max-w-sm shadow-premium">
                   <div className="w-12 h-12 rounded-2xl bg-heritage-saffron/5 flex items-center justify-center shadow-soft-inner shrink-0">
                      <Info className="h-6 w-6 text-heritage-saffron" />
                   </div>
                   <p className="text-[10px] font-black text-heritage-onyx/30 leading-relaxed uppercase tracking-[0.3em] italic">
                      Vector approximations utilize active pilgrimage flow heuristics. Production API handshake stable.
                   </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* Footer Accent */}
      <section className="py-60 mt-40 relative">
         <div className="container mx-auto px-6 text-center space-y-12">
            <h2 className="text-6xl md:text-[8rem] font-extrabold text-heritage-onyx tracking-tighter leading-none italic opacity-5 border-b border-heritage-gold/10 pb-20">
               Bharat Legacy Sequence.
            </h2>
            <div className="flex justify-center pt-24">
               <Button variant="premium" className="px-24 h-24 rounded-[2rem] text-xl font-black uppercase tracking-[0.4em] shadow-premium group">
                  Finalize Matrices <ArrowRightCircle className="ml-8 h-8 w-8 group-hover:rotate-45 transition-transform duration-700" />
               </Button>
            </div>
         </div>
      </section>

    </div>
  )
}
