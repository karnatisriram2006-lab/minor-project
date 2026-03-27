"use client"

import { useState, useEffect, useRef } from "react"
import { Filter, Thermometer, X, Star, MapPin, Calendar, Ticket, Navigation, Layers, Sparkles, ArrowRight, Gauge, Wind, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import touristPlaces from "@/data/touristPlaces.json"
import type { TouristPlace } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const FILTER_GROUPS = [
  { key: "monuments", label: "Monuments", emoji: "🏛️", categories: ["monument"] },
  { key: "heritage", label: "Heritage", emoji: "🏰", categories: ["heritage", "fort"] },
  { key: "spiritual", label: "Spiritual", emoji: "⛩️", categories: ["temple", "spiritual"] },
  { key: "beaches", label: "Beaches", emoji: "🏖️", categories: ["beach"] },
  { key: "nature", label: "Nature", emoji: "🌿", categories: ["nature"] },
]

function getCategoryEmoji(category: string) {
  if (["monument"].includes(category)) return "🏛️"
  if (["heritage", "fort"].includes(category)) return "🏰"
  if (["temple", "spiritual"].includes(category)) return "⛩️"
  if (["beach"].includes(category)) return "🏖️"
  if (["nature"].includes(category)) return "🌿"
  return "📍"
}

interface TourismMapProps {
  fullScreen?: boolean
}

export default function TourismMap({ fullScreen = false }: TourismMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const heatLayerRef = useRef<any>(null)

  const [filters, setFilters] = useState<Record<string, boolean>>({
    monuments: true, heritage: true, spiritual: true, beaches: true, nature: true,
  })
  const [heatmapVisible, setHeatmapVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null)

  useEffect(() => { setIsMounted(true) }, [])
  
  useEffect(() => {
    if (!isMounted || !mapRef.current || leafletMapRef.current) return;

    let isCancelled = false;
    (async () => {
      const L = (await import("leaflet")).default
      if (isCancelled || !mapRef.current || leafletMapRef.current) return;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // 1. SPATIAL MATRIX BOUNDARY (India Focus)
      const southWest = L.latLng(5.0, 65.0);
      const northEast = L.latLng(37.0, 100.0);
      const bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(mapRef.current, {
        center: [22.0, 78.0], // Optimized India focal point
        zoom: 5,
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4,
        maxZoom: 12,
        fadeAnimation: true,
        markerZoomAnimation: true,
        attributionControl: false
      })

      // 2. DATA SURFACE LAYER (Muted Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)

      leafletMapRef.current = map
    })()

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [isMounted])

  // Process and Update Markers & Heatmap
  useEffect(() => {
    if (!leafletMapRef.current) return;
    let isEffectActive = true;

    (async () => {
      const L = (await import("leaflet")).default
      // @ts-ignore
      const HeatLayer = (await import("leaflet.heat")).default
      if (!isEffectActive || !leafletMapRef.current) return;

      const map = leafletMapRef.current

      // Cleanup
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)

      const activeCategories = Object.entries(filters)
        .filter(([_, active]) => active)
        .flatMap(([key, _]) => FILTER_GROUPS.find(g => g.key === key)?.categories || [])

      const filteredPlaces = (touristPlaces as TouristPlace[]).filter(p => activeCategories.includes(p.category))

      // Markers Implementation
      filteredPlaces.forEach(p => {
        const emoji = getCategoryEmoji(p.category)
        const icon = L.divIcon({
          html: `
            <div class="group relative flex items-center justify-center transition-all duration-500 scale-90 hover:scale-110">
               <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse opacity-40"></div>
               <div class="w-10 h-10 rounded-full glass-command border border-primary/40 flex items-center justify-center shadow-[0_0_30px_var(--color-saffron)] relative z-10">
                  <span class="text-xl filter drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">${emoji}</span>
               </div>
               <div class="absolute -bottom-2 w-2 h-2 rounded-full bg-primary animate-ping opacity-20"></div>
            </div>
          `,
          className: "custom-neural-node",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -30]
        })

        const marker = L.marker([p.lat, p.lng], { icon })
          .on('click', () => setSelectedPlace(p))
          .bindPopup(`
            <div class="space-y-3 p-2">
              <h4 class="font-black italic text-lg leading-tight">${p.name}</h4>
              <p class="text-[10px] font-black uppercase tracking-widest text-primary">${p.city}, ${p.state}</p>
              <div class="flex items-center gap-4 text-[9px] font-black text-white/40">
                <span class="flex items-center gap-1"><Users className="h-3 w-3" /> Dense</span>
                <span class="flex items-center gap-1"><Thermometer className="h-3 w-3" /> 24°C</span>
              </div>
            </div>
          `, { className: "glass-3d-popup" })
          .addTo(map)
        
        markersRef.current.push(marker)
      })

      // Heatmap Implementation
      if (heatmapVisible) {
        const heatPoints: [number, number, number][] = (touristPlaces as TouristPlace[]).map(p => [p.lat, p.lng, 0.8])
        heatLayerRef.current = L.heatLayer(heatPoints, {
          radius: 35,
          blur: 25,
          maxZoom: 10,
          gradient: { 
            0.4: 'rgba(255, 107, 53, 0.1)', 
            0.65: 'rgba(255, 107, 53, 0.5)', 
            1: '#FFD700' 
          }
        }).addTo(map)
      }

      // 3. NEURAL ROUTER TRAJECTORY (Demo Path: Delhi to Mumbai)
      const delhi: [number, number] = [28.6139, 77.2090]
      const mumbai: [number, number] = [19.0760, 72.8777]
      const route = L.polyline([delhi, [24, 76], mumbai], {
        color: '#FF6B35',
        weight: 3,
        opacity: 0.6,
        className: 'route-draw'
      }).addTo(map)
    })()

    return () => { isEffectActive = false }
  }, [filters, heatmapVisible])

  const toggleFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#05070D]">
      {/* 4. Bottom Control Panel (Floating Glass Pill) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[102] flex items-center gap-2 p-2 glass-command rounded-full border border-white/10 shadow-6xl scale-90 md:scale-100">
         <div className="flex items-center gap-1 px-4 border-r border-white/5">
            <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setHeatmapVisible(!heatmapVisible)}
               className={cn(
                  "px-6 rounded-full h-12 text-[10px] font-black uppercase tracking-widest transition-all",
                  heatmapVisible ? "bg-primary text-white shadow-[0_0_20px_var(--color-saffron)]" : "text-white/20 hover:text-white/40"
               )}
            >
               <Thermometer className="h-4 w-4 mr-2" /> Dense Matrix
            </Button>
            <Button 
               variant="ghost" 
               size="sm"
               className="px-6 rounded-full h-12 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40"
            >
               <Wind className="h-4 w-4 mr-2" /> Wind Mesh
            </Button>
         </div>

         <div className="flex items-center gap-1 px-2 overflow-x-auto no-scrollbar max-w-[600px] py-1">
            {["Monuments", "Heritage", "Nature", "Food"].map((key) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={cn(
                  "flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 whitespace-nowrap",
                  filters[key]
                    ? "bg-primary text-white border-primary shadow-[0_0_20px_var(--color-saffron)] scale-105"
                    : "bg-white/5 text-white/10 border-white/5 hover:border-white/10"
                )}
              >
                {getCategoryEmoji(key)} <span>{key}</span>
              </button>
            ))}
         </div>
      </div>

      <div ref={mapRef} className="w-full h-full brightness-[0.4] contrast-[1.6] saturate-0 grayscale opacity-80" />

      {!isMounted && (
        <div className="absolute inset-0 map-container flex flex-col items-center justify-center space-y-16 z-[203]">
           <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-[6px] border-primary/10 rounded-full" />
              <div className="absolute inset-0 border-[6px] border-t-primary rounded-full chakra-spinner" />
              <div className="absolute inset-8 border-[2px] border-accent/20 rounded-full animate-ping" />
           </div>
           <div className="text-center space-y-4">
              <p className="text-sm font-black uppercase tracking-[1em] text-white animate-pulse">Initializing Neural Grid</p>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Spatial Calibration v4.0.1 Stable</p>
           </div>
        </div>
      )}

      {/* 6. Destination Detail Overlay (Floating) */}
      <AnimatePresence>
         {selectedPlace && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute top-12 left-12 w-[480px] glass-command rounded-[4rem] p-16 z-[103] border border-white/10 shadow-5xl"
            >
              <button 
                onClick={() => setSelectedPlace(null)}
                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 group"
              >
                 <X className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
              </button>

              <div className="space-y-8 mb-12">
                 <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl border border-primary/20 shadow-4xl">
                    {getCategoryEmoji(selectedPlace.category)}
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-6xl font-black italic tracking-tighter leading-[0.9] text-white underline decoration-primary/20 decoration-8">{selectedPlace.name}.</h3>
                    <p className="text-xs font-black uppercase tracking-[0.6em] text-primary">{selectedPlace.city}, {selectedPlace.state}</p>
                 </div>
              </div>

              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 space-y-8">
                 <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-white/40 italic">Temporal Trajectory</span>
                    <span className="text-primary">{selectedPlace.bestTime}</span>
                 </div>
                 <div className="h-[1px] w-full bg-white/5" />
                 <p className="text-base font-medium leading-relaxed italic text-muted-foreground/60 line-clamp-4">
                    {selectedPlace.description}
                 </p>
                 <Button className="w-full h-20 command-button-primary rounded-[2rem] text-sm">
                    Synchronize Vector Loop
                 </Button>
              </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}
