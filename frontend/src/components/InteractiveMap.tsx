"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Map, Marker, useMap, useControl } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox"
import { PathLayer } from "@deck.gl/layers"
import "maplibre-gl/dist/maplibre-gl.css"
import { motion, AnimatePresence } from "framer-motion"

// Helper component for DeckGL Overlay in MapLibre
function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props))
  overlay.setProps(props)
  return null
}

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
      id: "route-path-glow",
      data: [{ path: visibleRoute }],
      getPath: (d: any) => d.path,
      getColor: [255, 56, 92, 40], // #FF385C Rausch Red with low opacity
      getWidth: 10,
      widthUnits: "pixels",
      jointRounded: true,
      capRounded: true,
    }),
    new PathLayer({
      id: "route-path",
      data: [{ path: visibleRoute }],
      getPath: (d: any) => d.path,
      getColor: [255, 56, 92, 255], // #FF385C Rausch Red
      getWidth: 3,
      widthUnits: "pixels",
      jointRounded: true,
      capRounded: true,
    }),
  ]

  return (
    <div className="h-full w-full relative group bg-white">
      {/* Light placeholder shown on server / before mount */}
      {!isMounted ? (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#FF385C] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <Map 
            mapLib={maplibregl}
            initialViewState={INITIAL_VIEW_STATE}
            mapStyle={MAP_STYLE as any} 
            style={{ width: "100%", height: "100%" }}
            reuseMaps
          >
            {/* Standard DeckGL Overlay */}
            <DeckGLOverlay layers={layers} />

            {/* Custom Markers */}
            {points.map((loc, idx) => (
              <Marker key={`${loc.id}-${idx}`} longitude={loc.lng} latitude={loc.lat} anchor="center">
                <div className="relative group/marker cursor-pointer">
                  {/* Marker Pin Visual */}
                  <div className="w-8 h-8 flex items-center justify-center relative">
                    <div className="absolute w-4 h-4 bg-[#FF385C]/20 rounded-full animate-ping" />
                    <div className="relative w-3 h-3 bg-[#FF385C] border-2 border-white rounded-full shadow-lg" />
                  </div>

                  {/* HTML Popup on Hover */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-all transform group-hover/marker:-translate-y-1 pointer-events-none z-50">
                    <div className="bg-white rounded-xl p-3 w-44 border border-gray-100 shadow-xl">
                      <h4 className="text-[#222222] font-bold text-xs">{loc.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2">
                        {loc.description}
                      </p>
                      <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF385C]">
                            Activity
                          </span>
                        </div>
                    </div>
                  </div>
                </div>
              </Marker>
            ))}
            
            <MapController points={points} />
          </Map>
        </div>
      )}

      {/* Dynamic Overlay for Routing State */}
      <AnimatePresence>
        {loadingRoute && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Updating route...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Info Badge */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Zoom: {INITIAL_VIEW_STATE.zoom.toFixed(1)}
        </div>
      </div>
    </div>
  )
}
