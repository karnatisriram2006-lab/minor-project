/* eslint-disable */
"use client"

import { useEffect } from "react"
import L from "leaflet"
import touristPlaces from "@/data/touristPlaces.json"

interface HeatmapLayerProps {
  map: any
}

export default function HeatmapLayer({ map }: HeatmapLayerProps) {
  useEffect(() => {
    if (!map) return

    let heatLayer: any = null

    const initHeatmap = async () => {
      // Load leaflet-heat from CDN if not already present
      if (!(L as any).heatLayer) {
        await new Promise((resolve) => {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      // Prepare data points from touristPlaces (lat, lng, intensity)
      const points = touristPlaces.map((p: any) => [
        p.lat,
        p.lng,
        (p.rating || 4.5) * 5 // Use rating as intensity
      ])

      // @ts-ignore
      heatLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
      }).addTo(map)
    }

    initHeatmap()

    return () => {
      if (heatLayer && map) {
        map.removeLayer(heatLayer)
      }
    }
  }, [map])

  return null
}
