"use client"

import React, { useEffect, useState } from "react"
import { Map, Marker, useMap, useControl } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox"
import { PathLayer } from "@deck.gl/layers"
import "maplibre-gl/dist/maplibre-gl.css"
import { motion, AnimatePresence } from "framer-motion"

// Helper component for DeckGL Overlay in MapLibre
function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props))
  if (overlay) {
    overlay.setProps(props)
  }
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
  const [webglError, setWebglError] = useState(false)
  // Map context is consumed inside child components to ensure correct scoping
  const [darkMap, setDarkMap] = useState(false)
  const [geoToast, setGeoToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' })
  const [pendingLocation, setPendingLocation] = useState<{ lon: number; lat: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lon: number; lat: number } | null>(null)

  // MapLocator subscribes to map context to fly to the pending location when ready
  function MapLocator({ pendingLocation }: { pendingLocation: { lon: number; lat: number } | null }) {
    const { current: map } = useMap()
    useEffect(() => {
      if (map && pendingLocation) {
        map.flyTo({ center: [pendingLocation.lon, pendingLocation.lat], zoom: 12, duration: 1500 } as any)
        // clear after fly
        // Note: we can't setPendingLocation from here to avoid extra renders; the parent handles state
      }
    }, [map, pendingLocation])
    return null
  }

  // Prevent WebGL initialization on server — DeckGL requires browser context
  useEffect(() => { setIsMounted(true) }, [])

  // Restore last map position from localStorage
  const savedView = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mapView') || 'null') : null
  const INITIAL_VIEW_STATE = {
    longitude: savedView?.longitude || 78.9629, // India Longitude
    latitude: savedView?.latitude || 20.5937,  // India Latitude
    zoom: savedView?.zoom || 5,
    pitch: 40,
    bearing: 0,
    maxZoom: 18,
  }
  // Locate me handler (centers the map on user location)
  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const { longitude, latitude } = pos.coords
      console.debug('[InteractiveMap] Geolocation success', longitude, latitude)
      // Persist user location marker and trigger fly when map is ready
      setUserLocation({ lon: longitude, lat: latitude })
      setPendingLocation({ lon: longitude, lat: latitude })
    }, (err: any) => {
      const msg = err?.message ?? (typeof err?.code !== 'undefined' ? `Geolocation error code ${err.code}` : 'Geolocation error')
      // Show a user-friendly toast instead of noisy console Errors
      setGeoToast({ visible: true, message: msg })
      // Auto-dismiss after a short delay
      window.setTimeout(() => setGeoToast({ visible: false, message: '' }), 4500)
      // As a fallback, center the map to India if geolocation is unavailable
      setPendingLocation({ lon: 78.9629, lat: 20.5937 })
    }, { enableHighAccuracy: true, timeout: 5000 })
  }
  // Map theme toggle
  const toggleDarkMap = () => setDarkMap((d) => !d)
  // MapLocator component handles flying to a pending location when the map is ready

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
        let res: Response | undefined
        let attempts = 0
        const maxAttempts = 3
        while (attempts < maxAttempts) {
          res = await fetch(url)
          if (res?.ok) break
          attempts++
          await new Promise(r => setTimeout(r, 500 * attempts))
        }
        if (!res || !res.ok) throw new Error("OSRM API Unavailable")
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          // GeoJSON returns [lng, lat] natively
          const pathCoords: [number, number][] = data.routes[0].geometry.coordinates
          setFullRoute(pathCoords)
        } else {
          setFullRoute(points.map(p => [p.lng, p.lat] as [number, number]))
        }
      } catch (err: unknown) {
        console.error(err);
        setFullRoute(points.map(p => [p.lng, p.lat] as [number, number]))
      } finally {
        setLoadingRoute(false)
      }
    }

    fetchRoute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullRoute])

  // Defer layer calculation to ensure client-side parity
  const layers = isMounted ? [
    new PathLayer({
      id: "route-path-glow",
      data: [{ path: visibleRoute }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPath: (d: any) => d.path,
      getColor: [255, 90, 95, 40], // Airbnb Rausch with low opacity
      getWidth: 10,
      widthUnits: "pixels",
      jointRounded: true,
      capRounded: true,
    }),
    new PathLayer({
      id: "route-path",
      data: [{ path: visibleRoute }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPath: (d: any) => d.path,
      getColor: [255, 90, 95, 255], // Airbnb Rausch
      getWidth: 3,
      widthUnits: "pixels",
      jointRounded: true,
      capRounded: true,
    }),
  ] : []

  return (
    <div role="region" aria-label="Travel route map" className="h-full w-full relative group bg-[#F7F7F7]">
      {/* Light placeholder shown on server / before mount */}
      {!isMounted ? (
        <div className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#FF5A5F] border-t-transparent animate-spin" />
        </div>
      ) : webglError ? (
        <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[#EBEBEB] rounded-3xl m-4">
          <div className="w-16 h-16 bg-[#484848]/5 rounded-2xl flex items-center justify-center mb-4">
             <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-bold text-[#484848] mb-2">Hardware Acceleration Disabled</h3>
          <p className="text-sm text-[#767676] max-w-sm">
            Your browser could not initialize WebGL, which is required for interactive 3D maps. Please enable hardware acceleration in your browser settings to view the route map.
          </p>
        </div>
      ) : (
        <div className="absolute inset-0" style={{ filter: darkMap ? 'brightness(0.75) saturate(0.9)' : 'none' }}>
          <Map 
            mapLib={maplibregl}
            initialViewState={INITIAL_VIEW_STATE}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mapStyle={MAP_STYLE as any} 
            style={{ width: "100%", height: "100%", filter: darkMap ? 'brightness(0.75) saturate(0.9)' : undefined }}
            reuseMaps
            maxBounds={[[68, 6], [98, 38]]} // Keep map within India region
            onError={(e) => {
              if (e.error && e.error.message && e.error.message.includes("WebGL")) {
                setWebglError(true);
              }
            }}
            onMove={(evt) => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('mapView', JSON.stringify({
                  longitude: evt.viewState.longitude,
                  latitude: evt.viewState.latitude,
                  zoom: evt.viewState.zoom,
                }))
              }
            }}
          >
            {/* Standard DeckGL Overlay */}
            <DeckGLOverlay layers={layers} />
            <MapLocator pendingLocation={pendingLocation} />

            {/* Custom Markers */}
            {points.map((loc, idx) => (
              <Marker key={`${loc.id}-${idx}`} longitude={loc.lng} latitude={loc.lat} anchor="center">
                <div role="button" aria-label={`Destination: ${loc.name}`} className="relative group/marker cursor-pointer" title={loc.name}>
                  {/* Marker Pin Visual */}
                  <div className="w-8 h-8 flex items-center justify-center relative">
                    <div className="absolute w-4 h-4 bg-[#FF5A5F]/20 rounded-full animate-ping" />
                    <div className="relative w-3 h-3 bg-[#FF5A5F] border-2 border-white rounded-full shadow-lg" />
                  </div>

                  {/* HTML Popup on Hover */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-all transform group-hover/marker:-translate-y-1 pointer-events-none z-50">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 w-48 border border-[#EBEBEB] shadow-xl">
                      <h4 className="text-[#484848] font-bold text-xs">{loc.name}</h4>
                      <p className="text-[10px] text-[#767676] font-medium leading-relaxed mt-1 line-clamp-2">
                        {loc.description}
                      </p>
                      <div className="pt-2 mt-2 border-t border-[#EBEBEB] flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF5A5F]">
                            Destination
                          </span>
                        </div>
                    </div>
                  </div>
                </div>
              </Marker>
            ))}
            
            <MapController points={points} />
            {userLocation && (
              <Marker longitude={userLocation.lon} latitude={userLocation.lat} anchor="center" aria-label="Your location" key="user-location">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
                  <div className="absolute w-8 h-8 rounded-full border-2 border-blue-400 opacity-40 animate-ping" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
              </Marker>
            )}
          </Map>
          {/* Map actions: Locate, Theme toggle */}
          <div className="absolute bottom-16 right-12 z-40 flex gap-2" aria-label="Map actions">
            <button onClick={locateMe} aria-label="Locate me" className="w-12 h-12 rounded-full bg-white border border-[#EBEBEB] shadow-sm flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Locate"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M2 12h4"></path><path d="M18 12h4"></path></svg>
            </button>
            <button onClick={toggleDarkMap} aria-label="Toggle map theme" className="w-12 h-12 rounded-full bg-white border border-[#EBEBEB] shadow-sm flex items-center justify-center">
              <span aria-hidden="true" style={{ fontSize: 14 }}>{darkMap ? '☀' : '🌙'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Overlay for Routing State */}
      <AnimatePresence>
        {loadingRoute && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#EBEBEB] shadow-lg flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#484848]">
              Updating route...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Info Badge */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#EBEBEB] shadow-sm text-[9px] font-bold uppercase tracking-[0.2em] text-[#767676]">
          Zoom: {INITIAL_VIEW_STATE.zoom.toFixed(1)}
        </div>
      </div>

      {/* User-facing geolocation toast */}
      {geoToast.visible && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-gray-200 shadow-lg rounded-md p-4 flex items-start gap-3">
          <span className="mt-0.5">📍</span>
          <span className="text-sm text-gray-800 leading-relaxed">{geoToast.message}</span>
          <button aria-label="Dismiss geolocation toast" onClick={() => setGeoToast({ visible: false, message: '' })} className="ml-auto text-gray-500 hover:text-gray-700">×</button>
        </div>
      )}
    </div>
  )
}
