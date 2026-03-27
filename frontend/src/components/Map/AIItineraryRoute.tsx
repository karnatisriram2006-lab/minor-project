"use client"

import { useEffect, useRef, useState } from "react"
import type { ItineraryStop } from "./types"
import AnimatedRoute from "./AnimatedRoute"
import HeatmapLayer from "./HeatmapLayer"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIItineraryRouteProps {
  stops: ItineraryStop[]
}

export default function AIItineraryRoute({ stops }: AIItineraryRouteProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routingControlRef = useRef<any>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [isPlayingAnim, setIsPlayingAnim] = useState(false)
  const [routeCoordinates, setRouteCoordinates] = useState<{lat: number, lng: number}[]>([])

  useEffect(() => { setIsMounted(true) }, [])

  // Init map once
  useEffect(() => {
    if (!isMounted || !mapRef.current || leafletMapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default
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
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [isMounted])

  // Draw markers + routing when stops change
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
        
        setRouteCoordinates([])
        setIsPlayingAnim(false)

        markersRef.current.forEach(m => map.removeLayer(m))
        markersRef.current = []
        if (routingControlRef.current) { 
            try { map.removeControl(routingControlRef.current); } catch (e) {}
            routingControlRef.current = null 
        }

        if (stops.length === 0) return

        stops.forEach((stop, i) => {
          const icon = L.divIcon({
            html: `
              <div class="marker-pulse" style="width:36px;height:36px;background:rgba(255,107,53,0.1);display:flex;align-items:center;justify-content:center;position:relative;">
                 <div style="background:#FF6B35;width:10px;height:10px;border-radius:50%;box-shadow:0 0 15px #FF6B35;"></div>
                 <div style="position:absolute;top:-28px;background:rgba(11,15,26,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);padding:4px 10px;border-radius:10px;font-size:10px;font-weight:900;color:white;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
                    ${i + 1}. ${stop.name}
                 </div>
              </div>
            `,
            className: "custom-stop-marker",
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          })
          const m = L.marker([stop.lat, stop.lng], { icon })
            .bindPopup(`
              <div class="p-2 space-y-3">
                <h4 class="font-black italic text-lg leading-tight">${stop.name}</h4>
                <p class="text-[10px] text-muted-foreground/60 italic">${stop.description || ""}</p>
                <Button class="w-full h-10 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Explore Node</Button>
              </div>
            `, { className: "glass-3d-popup" })
            .addTo(map)
          markersRef.current.push(m)
        })

        if (!isEffectActive) return;

        if (stops.length > 1) {
            const waypoints = stops.map(s => L.latLng(s.lat, s.lng))
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
            });

            control.on('routesfound', function(e: any) {
              if (!isEffectActive) return;
              const routes = e.routes;
              setRouteCoordinates(routes[0].coordinates);
            });

            control.addTo(map);
            routingControlRef.current = control;
        } else {
            // Single stop
            map.setView([stops[0].lat, stops[0].lng], 13)
        }
      } catch (err) {
        console.error("Routing error:", err)
      }
    })()

    return () => {
        isEffectActive = false;
        if (routingControlRef.current) {
            try {
                // Remove waypoints first to stop any pending routing requests
                routingControlRef.current.setWaypoints([]);
                if (leafletMapRef.current) {
                    leafletMapRef.current.removeControl(routingControlRef.current);
                }
            } catch (e) {
                console.warn("Cleanup: Routing control removal failed", e);
            }
            routingControlRef.current = null;
        }
        if (leafletMapRef.current) {
            markersRef.current.forEach(m => {
                try { leafletMapRef.current.removeLayer(m); } catch (e) {}
            });
            markersRef.current = [];
        }
    }
  }, [stops])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      {!isMounted && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <p className="text-muted-foreground">Loading AI map…</p>
        </div>
      )}
      
      {/* Play Animation Overlay */}
      {routeCoordinates.length > 0 && (
         <div className="absolute bottom-6 right-6 z-[1000] bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
             <Button variant={isPlayingAnim ? "secondary" : "default"} size="sm" onClick={() => setIsPlayingAnim(!isPlayingAnim)} className="flex items-center gap-2">
                 <Play className={`h-4 w-4 ${isPlayingAnim ? "text-primary animate-pulse" : ""}`} /> 
                 {isPlayingAnim ? "Animating..." : "Play Route"}
             </Button>
         </div>
      )}

      {/* The Animated Marker Component */}
      <AnimatedRoute 
         map={leafletMapRef.current} 
         coordinates={routeCoordinates} 
         isPlaying={isPlayingAnim} 
         onComplete={() => setIsPlayingAnim(false)} 
      />
      <HeatmapLayer map={leafletMapRef.current} />
    </div>
  )
}
