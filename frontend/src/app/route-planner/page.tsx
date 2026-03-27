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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Aurora Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-aurora [animation-delay:-5s]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-20">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 text-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-3xl shadow-primary/20 border border-primary/20"
          >
            <Navigation className="h-12 w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">
               Neural <br /><span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Router.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Calculate hyper-efficient traversal vectors across spatial nodes. Save temporal bandwidth with intelligent orchestration.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Input Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-4 space-y-12"
          >
            <Card className="bg-card rounded-[3.5rem] border-border shadow-4xl glass-3d overflow-hidden h-fit">
              <CardHeader className="p-12 border-b border-border space-y-2">
                <div className="flex justify-between items-center">
                   <CardTitle className="text-3xl font-black tracking-tighter italic">Spatial Nodes</CardTitle>
                   <div className="bg-muted px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"> {places.length} Detected </div>
                </div>
                <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Trajectory Modulation</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <form onSubmit={handleAddPlace} className="flex gap-4">
                  <Input 
                    placeholder="Identify Spatial Entity..." 
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="bg-background rounded-2xl h-18 font-black text-sm focus:ring-4 focus:ring-primary/10 border-border transition-all px-6 tracking-widest uppercase placeholder:text-muted-foreground/30 flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-primary text-white hover:bg-orange-600 rounded-2xl h-18 w-18 cursor-pointer shadow-2xl shadow-primary/20 shrink-0 transition-all hover:scale-110 hover:rotate-6">
                    <Plus className="h-6 w-6" />
                  </Button>
                </form>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {places.map((place, index) => (
                      <motion.div 
                        key={place.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between p-6 bg-muted/30 rounded-[1.5rem] border border-border shadow-soft transition-all hover:border-primary/20 group glass-card"
                      >
                        <div className="flex items-center gap-5 overflow-hidden">
                          <div className="bg-card text-primary w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border border-border shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            {index + 1}
                          </div>
                          <span className="font-black text-foreground text-sm tracking-tight truncate group-hover:text-primary transition-colors">{place.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemovePlace(place.id)}
                          className="text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl shrink-0 h-10 w-10 cursor-pointer transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {places.length === 0 && (
                    <div className="py-20 text-center space-y-6 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border group">
                       <MapPin className="h-12 w-12 text-muted-foreground/20 mx-auto group-hover:scale-125 transition-transform" />
                       <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Zero Nodes Tracked</p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-20 rounded-3xl bg-primary hover:bg-orange-600 text-white font-black text-xl shadow-4xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer" 
                  onClick={handleOptimize}
                  disabled={places.length < 2 || loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-4">
                       <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                       <span>Optimizing Trajectory...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-4">Orchestrate Route <Route className="h-6 w-6" /></span>
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
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card className="bg-accent rounded-[3.5rem] border-none shadow-4xl overflow-hidden glass-3d">
                    <CardHeader className="p-12 pb-8 border-b border-white/10 space-y-2">
                      <CardTitle className="text-white text-3xl font-black tracking-tighter italic flex items-center gap-4">
                        <Compass className="h-8 w-8 animate-pulse" /> 
                        Optimal Vector
                      </CardTitle>
                      <CardDescription className="text-white/60 font-medium uppercase text-[10px] tracking-[0.3em]">Temporal Delta Optimized</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 space-y-10 relative pt-12 pr-16 before:absolute before:inset-0 before:left-[4.5rem] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-white/0 before:via-white/20 before:to-white/0">
                      {optimizedRoute.map((place, i) => (
                        <div key={place.id} className="relative flex items-center gap-10 group">
                          {/* Order Number */}
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl border-4 border-accent bg-white text-accent shadow-4xl shrink-0 z-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:bg-primary group-hover:text-white group-hover:border-white/20">
                            <span className="text-xl font-black italic">{place.visitOrder}</span>
                          </div>
                          
                          {/* Place Card */}
                          <div className="flex-1 p-8 rounded-[2rem] shadow-3xl bg-white/5 backdrop-blur-3xl border border-white/10 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                            <h4 className="font-black text-white text-lg tracking-tight mb-2 group-hover:translate-x-2 transition-transform italic">{place.name}</h4>
                            <div className="flex items-center gap-4">
                               <MapPin className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white/80 transition-colors">Trajectory Step {place.visitOrder}</span>
                            </div>
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
            transition={{ delay: 0.3 }}
            className="lg:col-span-12 xl:col-span-8 sticky top-32"
          >
            <Card className="bg-card rounded-[4rem] border-border shadow-4xl glass-3d overflow-hidden h-full flex flex-col min-h-[800px]">
              <div className="p-8 px-12 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-6">
                   <div className="p-3 bg-primary/10 rounded-xl">
                      <Map className="h-6 w-6 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-black italic tracking-tighter">Spatial Preview</h3>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Orchestration Mode</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">System Active</span>
                </div>
              </div>
              <div className="flex-1 relative bg-grid-slate-900/[0.04] flex items-center justify-center overflow-hidden">
                {/* Simulated Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }} />
                
                <div className="text-center space-y-10 p-16 bg-card/40 backdrop-blur-3xl rounded-[4rem] max-w-2xl relative z-10 shadow-4xl border border-white/20 group">
                  <div className="relative">
                     <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                     <MapPin className="h-24 w-24 text-primary mx-auto relative z-10 transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic tracking-tighter leading-none">Spatial Visualization Matrix.</h3>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed px-8 opacity-60">
                      In the production environment, this module instantiates an interactive high-fidelity map with neural polyline trajectory rendering.
                    </p>
                  </div>
                  {optimizedRoute.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-10 pt-10 border-t border-border"
                    >
                      <div className="flex items-center justify-center gap-4">
                         <Sparkles className="h-5 w-5 text-emerald-500" />
                         <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600/80">
                            Optimal Trajectory Resolved for {optimizedRoute.length} Spatial Entities
                         </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-12 left-12 p-8 bg-card/30 backdrop-blur-2xl rounded-3xl border border-border flex items-start gap-4 max-w-sm">
                   <Info className="h-6 w-6 text-primary shrink-0" />
                   <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">
                      Neural router currently using alpha heuristic for distance modulation. Production grade Google Maps API handshake pending.
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
