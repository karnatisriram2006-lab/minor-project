"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Map, Marker, useMap } from "react-map-gl/maplibre"
import DeckGL from "@deck.gl/react"
import { PathLayer } from "@deck.gl/layers"
import "maplibre-gl/dist/maplibre-gl.css"
import { motion, AnimatePresence } from "framer-motion"

// MapLibre configuration for OpenStreetMap
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

interface Location {
  id: string | number
  name: string
  lat: number
  lng: number
  description: string
}

interface InteractiveMapProps {
  points?: Location[]
  center?: [number, number]
  zoom?: number
}

// Controller to auto-fit bounds on point updates
function MapController({ points }: { points: Location[] }) {
  const { current: map } = useMap()
  
  useEffect(() => {
    if (map && points && points.length > 0) {
      if (points.length === 1) {
        map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 12, duration: 2000 })
      } else if (points.length > 1) {
        const lngs = points.map(p => p.lng)
        const lats = points.map(p => p.lat)
        const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)]
        const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)]
        map.fitBounds([sw, ne], { padding: 50, duration: 2000, maxZoom: 12 })
      }
    }
  }, [points, map])
  
  return null
}

export default function InteractiveMap({ points = [], center = [20.5937, 78.9629], zoom = 5 }: InteractiveMapProps) {
  const [fullRoute, setFullRoute] = useState<[number, number][]>([])
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [visibleRoute, setVisibleRoute] = useState<[number, number][]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Prevent WebGL initialization on server — DeckGL requires browser context
  useEffect(() => { setIsMounted(true) }, [])

  const INITIAL_VIEW_STATE = {
    longitude: center[1],
    latitude: center[0],
    zoom: zoom,
    pitch: 40,
    bearing: 0,
    maxZoom: 18,
  }

  // Fetch Route from OSRM
  useEffect(() => {
    if (points.length < 2) {
      if (fullRoute.length > 0) setFullRoute([])
      return
    }

    const fetchRoute = async () => {
      setLoadingRoute(true)
      try {
        const coords = points.map(p => `${p.lng},${p.lat}`).join(";")
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        
        const res = await fetch(url)
        if (!res.ok) throw new Error("OSRM API Unavailable")
        
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          // GeoJSON returns [lng, lat] natively
          const pathCoords: [number, number][] = data.routes[0].geometry.coordinates
          setFullRoute(pathCoords)
        } else {
          setFullRoute(points.map(p => [p.lng, p.lat] as [number, number]))
        }
      } catch (err) {
        setFullRoute(points.map(p => [p.lng, p.lat] as [number, number]))
      } finally {
        setLoadingRoute(false)
      }
    }

    fetchRoute()
  }, [points])

  // Animate Route progressively
  useEffect(() => {
    if (!fullRoute || fullRoute.length === 0) {
      setVisibleRoute([])
      return
    }

    let current = 0
    const stepSize = Math.max(1, Math.floor(fullRoute.length / 40))
    
    if (fullRoute.length < 10) {
      setVisibleRoute(fullRoute)
      return
    }

    const interval = setInterval(() => {
      if (current < fullRoute.length) {
        current = Math.min(fullRoute.length, current + stepSize)
        setVisibleRoute(fullRoute.slice(0, current))
      } else {
        clearInterval(interval)
      }
    }, 20)
    
    return () => clearInterval(interval)
  }, [fullRoute])

  const layers = [
    new PathLayer({
      id: 'route-path-glow',
      data: [{ path: visibleRoute }],
      getPath: (d: any) => d.path,
      getColor: [249, 115, 22, 50],
      getWidth: 12,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
    }),
    new PathLayer({
      id: 'route-path',
      data: [{ path: visibleRoute }],
      getPath: (d: any) => d.path,
      getColor: [249, 115, 22, 255], // #F97316 Saffron
      getWidth: 4,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
    })
  ]

  return (
    <div className="h-full w-full relative group">
      {/* Dark placeholder shown on server / before mount */}
      {!isMounted ? (
        <div className="absolute inset-0 bg-[#020617] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
      <div className="absolute inset-0 grayscale-[0.2] contrast-[1.1] saturate-[0.8] brightness-[1.0]">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          style={{ width: "100%", height: "100%" }}
        >
          <Map
            mapStyle={MAP_STYLE as any}
            reuseMaps
          >
            {points.map((loc, idx) => (
              <Marker key={`${loc.id}-${idx}`} longitude={loc.lng} latitude={loc.lat} anchor="bottom">
                <div className="relative group/marker cursor-pointer">
                  {/* Marker Pin Visual */}
                  <div className="w-8 h-8 flex items-center justify-center relative">
                    <div className="absolute w-4 h-4 bg-accent/30 rounded-full animate-ping" />
                    <div className="relative w-3 h-3 bg-accent border-2 border-white rounded-full shadow-[0_0_10px_2px_rgba(249,115,22,0.6)]" />
                  </div>
                  
                  {/* HTML Popup on Hover */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-[#0B1120]/90 backdrop-blur-md rounded-2xl p-4 w-48 border border-white/5 shadow-2xl">
                       <h4 className="text-white font-black font-serif italic text-sm">{loc.name}</h4>
                       <p className="text-[10px] text-white/40 font-medium leading-relaxed mt-1 line-clamp-3">{loc.description}</p>
                       <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary">Node Active</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_2px_rgba(249,115,22,0.5)]" />
                       </div>
                    </div>
                  </div>
                </div>
              </Marker>
            ))}
            <MapController points={points} />
          </Map>
        </DeckGL>
      </div>
      )} {/* end isMounted */}

      {/* Dynamic Overlay for Routing State */}
      <AnimatePresence>
        {loadingRoute && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 right-10 z-30 bg-[#0B1120]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-2xl flex items-center gap-2"
          >
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Recalibrating Path...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Overlay Vignette Gradient */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(2,6,23,0.6)] z-10" />
      
      {/* Zoom Info Badge */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
         <div className="bg-[#0B1120]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-2xl text-[10px] font-black uppercase tracking-widest text-white/40">
            Spatial Depth: {INITIAL_VIEW_STATE.zoom.toFixed(1)}
         </div>
      </div>
    </div>
  )
}
