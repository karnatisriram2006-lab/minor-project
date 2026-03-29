/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, Navigation2, CheckCircle2, ChevronRight, Route, Play, MapPin, Info, Settings2, HandCoins, Sparkles, Navigation, Fuel, Gauge, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import touristPlaces from "@/data/touristPlaces.json"
import type { TouristPlace, RouteStop } from "./types"
import AnimatedRoute from "./AnimatedRoute"
import HeatmapLayer from "./HeatmapLayer"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const COLORS = ["#f97316", "#10b981", "#06b6d4", "#6366f1", "#db2777", "#9333ea"] // Saffron, Emerald, Celestial...

export default function RoutePlanner() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routingControlRef = useRef<any>(null)

  const [selectedStops, setSelectedStops] = useState<RouteStop[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([])
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0)
  const [routeTimeMins, setRouteTimeMins] = useState<number>(0)
  const [routeCoordinates, setRouteCoordinates] = useState<{lat: number, lng: number}[]>([])
  const [mileage, setMileage] = useState<number>(15)
  const [fuelPrice, setFuelPrice] = useState<number>(100)
  const [isOptimized, setIsOptimized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isPlayingAnim, setIsPlayingAnim] = useState(false)
  const [loading, setLoading] = useState(false)

  const places = touristPlaces as TouristPlace[]
  const activeRoute = isOptimized ? optimizedRoute : selectedStops

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (!isMounted || !mapRef.current || leafletMapRef.current) return;

    let isCancelled = false;
    (async () => {
      const L = (await import("leaflet")).default
      if (isCancelled) return;

      if (!document.querySelector('link[href*="leaflet-routing-machine.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css"
        document.head.appendChild(link)
      }
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }
      
      const map = L.map(mapRef.current!, { center: [22.5, 82.5], zoom: 5, zoomControl: false })
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)
      leafletMapRef.current = map
    })()

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null }
    }
  }, [isMounted])

  useEffect(() => {
    if (!leafletMapRef.current) return;
    let isEffectActive = true;

    (async () => {
      try {
        const L = (await import("leaflet")).default
        // @ts-ignore
        await import("leaflet-routing-machine")
        if (!isEffectActive) return;
        
        const map = leafletMapRef.current

        markersRef.current.forEach(m => map.removeLayer(m))
        markersRef.current = []

        if (routingControlRef.current) {
          try { map.removeControl(routingControlRef.current) } catch (e) {}
          routingControlRef.current = null
        }
        
        setRouteCoordinates([])
        setIsPlayingAnim(false)

        if (activeRoute.length === 0) {
            setRouteDistanceKm(0)
            setRouteTimeMins(0)
            return
        }

        activeRoute.forEach((stop, i) => {
          const color = COLORS[i % COLORS.length]
          const icon = L.divIcon({
            html: `
              <div class="marker-pulse" style="width:36px;height:36px;background:rgba(255,107,53,0.1);display:flex;align-items:center;justify-content:center;position:relative;">
                 <div style="background:#FF6B35;width:10px;height:10px;border-radius:50%;box-shadow:0 0 15px #FF6B35;"></div>
                 <div style="position:absolute;top:-28px;background:rgba(11,15,26,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);padding:4px 10px;border-radius:10px;font-size:10px;font-weight:900;color:white;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
                    ${i + 1}. ${stop.name}
                 </div>
              </div>
            `,
            className: "custom-route-marker",
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          })
          const m = L.marker([stop.lat, stop.lng], { icon })
            .bindPopup(`
              <div class="p-2 space-y-3">
                <h4 class="font-black italic text-lg leading-tight text-white">${stop.name}</h4>
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full" style="background:${color}"></div>
                   <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order: ${i + 1}</span>
                </div>
              </div>
            `, { className: "glass-3d-popup" })
            .addTo(map)
          markersRef.current.push(m)
        })

        if (!isEffectActive) return;

        if (activeRoute.length > 1) {
            const waypoints = activeRoute.map(s => L.latLng(s.lat, s.lng));
            
            // @ts-ignore
            const control = L.Routing.control({
              waypoints,
              router: (L as any).Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
              }),
              lineOptions: {
                styles: [
                  { color: "#FF6B35", weight: 8, opacity: 0.15 },
                  { color: "#FF6B35", weight: 4, opacity: 0.9, className: 'route-draw' }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
              },
              show: false, 
              addWaypoints: false,
              routeWhileDragging: false,
              fitSelectedRoutes: true,
              createMarker: () => null 
            } as any);

            control.on('routesfound', function(e: any) {
              if (!isEffectActive) return;
              const routes = e.routes;
              const route = routes[0];
              setRouteDistanceKm(route.summary.totalDistance / 1000)
              setRouteTimeMins(route.summary.totalTime / 60)
              setRouteCoordinates(route.coordinates)
            });

            control.addTo(map);
            routingControlRef.current = control;
        } else {
            setRouteDistanceKm(0)
            setRouteTimeMins(0)
            map.setView([activeRoute[0].lat, activeRoute[0].lng], 12)
        }
      } catch (err) {
          console.error("Routing error:", err)
      }
    })()

    return () => {
        isEffectActive = false;
        if (routingControlRef.current) {
            try {
                routingControlRef.current.setWaypoints([]);
                if (leafletMapRef.current) { leafletMapRef.current.removeControl(routingControlRef.current); }
            } catch (e) {}
            routingControlRef.current = null;
        }
        if (leafletMapRef.current) {
            markersRef.current.forEach(m => { try { leafletMapRef.current.removeLayer(m); } catch (e) {} });
            markersRef.current = [];
        }
    }
  }, [activeRoute, isOptimized])

  const addStop = (place: TouristPlace) => {
    if (selectedStops.find(s => s.id === String(place.id))) return
    const stop: RouteStop = { id: String(place.id), name: place.name, lat: place.lat, lng: place.lng, order: selectedStops.length }
    setSelectedStops(prev => [...prev, stop])
    setIsOptimized(false)
    setOptimizedRoute([])
  }

  const removeStop = (id: string) => {
    setSelectedStops(prev => prev.filter(s => s.id !== id))
    setIsOptimized(false)
    setOptimizedRoute([])
  }

  const optimizeRoute = async () => {
    if (selectedStops.length < 2) return;
    setLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${apiUrl}/route/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: selectedStops })
      })

      if (!res.ok) throw new Error("Optimization failed")
      const data = await res.json()
      
      setOptimizedRoute(data.optimizedRoute.map((s: any, i: number) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        order: i
      })));
      setIsOptimized(true);
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false);
    }
  }

  const fuelRequired = routeDistanceKm / mileage;
  const estimatedFuelCost = fuelRequired * fuelPrice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-hidden">

      {/* Control Panel */}
      <div className="lg:col-span-4 space-y-10 group">
        <Card className="bg-card rounded-[3rem] border-border shadow-4xl glass-3d overflow-hidden">
          <CardHeader className="p-10 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent space-y-2">
            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                 <Navigation className="h-6 w-6 text-primary" />
              </div>
              Neural Router
            </CardTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Spatial Trajectory Optimization</p>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            {selectedStops.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {activeRoute.map((stop, i) => (
                    <motion.div 
                      key={stop.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-4 p-5 bg-muted/30 rounded-2xl border border-border shadow-soft group/item hover:border-primary/20 transition-all"
                    >
                      <div className="h-10 w-10 text-white rounded-xl flex items-center justify-center text-[10px] font-black italic shadow-2xl shrink-0 transition-transform group-hover/item:scale-110 group-hover/item:rotate-12" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </div>
                      <span className="text-sm font-black italic tracking-tight truncate flex-1">{stop.name}.</span>
                      <button onClick={() => removeStop(stop.id)} className="text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
                <div className="py-20 text-center space-y-6 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border">
                   <MapPin className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                   <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Zero Trajectory Nodes</p>
                </div>
            )}

            {/* Trajectory Analytics */}
            <AnimatePresence>
              {activeRoute.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-6"
                >
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10">
                    <p className="text-3xl font-black italic tracking-tighter text-primary leading-none mb-2">{routeDistanceKm.toFixed(1)} <span className="text-xs uppercase tracking-widest font-black">km</span></p>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/60">Spatial Delta</p>
                  </div>
                  <div className="p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10 transition-all hover:bg-secondary/10">
                    <p className="text-3xl font-black italic tracking-tighter text-secondary leading-none mb-2">{Math.round(routeTimeMins)} <span className="text-xs uppercase tracking-widest font-black">min</span></p>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-secondary/60">Temporal Cost</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
                <Button className="flex-1 h-16 rounded-2xl bg-foreground hover:bg-primary text-background hover:text-white font-black text-[10px] uppercase tracking-widest shadow-3xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer" onClick={optimizeRoute} disabled={selectedStops.length < 2 || isOptimized || loading}>
                  {loading ? (
                    <div className="flex items-center gap-3">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span>Optimizing...</span>
                    </div>
                  ) : isOptimized ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Vector Resolved</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Resolve Optimal Path</>
                  )}
                </Button>
                
                {routeCoordinates.length > 0 && (
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 border-border hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl active:scale-95 group/play" onClick={() => setIsPlayingAnim(!isPlayingAnim)}>
                        <Play className={cn("h-5 w-5 transition-transform group-hover/play:scale-125", isPlayingAnim ? "text-white animate-pulse" : "text-primary")} />
                    </Button>
                )}
            </div>

            {/* Extended Logic: Fuel Orchestration */}
            {activeRoute.length > 1 && (
                <div className="space-y-6 pt-10 border-t border-border">
                    <div className="flex items-center gap-3">
                       <Fuel className="h-5 w-5 text-accent" />
                       <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Fiscal Consumption Estimator</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Efficiency (km/l)</Label>
                            <Input type="number" min="1" value={mileage} onChange={e => setMileage(Number(e.target.value))} className="h-14 rounded-xl bg-background border-border font-black text-xs focus:ring-4 focus:ring-accent/10 transition-all shadow-lg" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Rate (₹/l)</Label>
                            <Input type="number" min="1" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))} className="h-14 rounded-xl bg-background border-border font-black text-xs focus:ring-4 focus:ring-accent/10 transition-all shadow-lg" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-8 rounded-3xl bg-accent/5 border border-accent/10 shadow-3xl shadow-accent/5 transition-all hover:bg-accent/10">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-accent/60 italic">Total Consumption</span>
                           <p className="text-xl font-black italic tracking-tighter text-accent leading-none font-sans">₹{estimatedFuelCost.toFixed(0)}</p>
                        </div>
                        <Gauge className="h-10 w-10 text-accent opacity-20" />
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card rounded-[3rem] border-border shadow-4xl glass-3d">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground text-center italic">Spatial Entities Catalog</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto p-4 custom-scrollbar">
            {places.map(place => {
              const added = !!selectedStops.find(s => s.id === String(place.id))
              return (
                <button 
                  key={place.id} 
                  onClick={() => addStop(place)} 
                  disabled={added}
                  className={cn(
                    "w-full text-left flex items-center justify-between gap-4 px-6 py-4 rounded-xl text-xs font-black transition-all mb-2 cursor-pointer border",
                    added 
                      ? "bg-primary/5 text-primary border-primary/20 cursor-not-allowed italic opacity-60" 
                      : "bg-transparent text-foreground border-transparent hover:bg-muted hover:border-border"
                  )}
                >
                  <span className="truncate">{place.name}.</span>
                  {added ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> : <Plus className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-primary transition-colors" />}
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Map Intelligence Interface */}
      <div className="lg:col-span-8 h-[900px] rounded-[5rem] overflow-hidden border border-border shadow-4xl relative glass-3d shadow-primary/10">
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        <AnimatePresence>
            {!isMounted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/50 backdrop-blur-3xl flex flex-col items-center justify-center space-y-6"
              >
                  <div className="relative">
                     <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                     <Navigation className="h-16 w-16 text-primary relative z-10 animate-bounce" />
                  </div>
                  <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Initializing Router Interface…</p>
              </motion.div>
            )}
        </AnimatePresence>
        
        {/* Animated route playback marker */}
        <AnimatedRoute 
            map={leafletMapRef.current} 
            coordinates={routeCoordinates} 
            isPlaying={isPlayingAnim} 
            onComplete={() => setIsPlayingAnim(false)} 
        />
        <HeatmapLayer map={leafletMapRef.current} />

        {/* Global UI Decoration */}
        <div className="absolute bottom-12 left-12 p-8 bg-card/60 backdrop-blur-2xl rounded-3xl border border-border flex items-center gap-6 shadow-4xl max-w-sm">
           <div className="p-3 bg-primary/20 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
           </div>
           <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic leading-none">Global Trajectory Analysis</h4>
              <p className="text-[9px] font-medium text-muted-foreground/80 leading-relaxed italic">
                 Utilizing high-order OSRM vectors for real-time spatial triangulation.
              </p>
           </div>
        </div>

        {/* Legend */}
        <div className="absolute top-12 right-12 flex flex-col gap-2">
            <div className="px-6 py-2.5 bg-card/80 backdrop-blur-3xl rounded-full border border-border flex items-center gap-3 shadow-3xl">
               <div className="h-2 w-2 rounded-full bg-primary" />
               <span className="text-[9px] font-black uppercase tracking-widest">Active Trajectory</span>
            </div>
            <div className="px-6 py-2.5 bg-card/80 backdrop-blur-3xl rounded-full border border-border flex items-center gap-3 shadow-3xl">
               <div className="h-2 w-2 rounded-full bg-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-widest">Optimized Resolved</span>
            </div>
        </div>
      </div>
    </div>
  )
}
