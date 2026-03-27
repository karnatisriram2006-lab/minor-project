"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { ItineraryStop } from "./types"

interface MapFitterProps {
  stops: ItineraryStop[]
}

export default function MapFitter({ stops }: MapFitterProps) {
  const map = useMap()

  useEffect(() => {
    if (stops.length > 1) {
      const bounds = stops.map((s) => [s.lat, s.lng] as [number, number])
      map.fitBounds(bounds, { padding: [40, 40] })
    } else if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 13)
    }
  }, [stops, map])

  return null
}
