import { fetchCoordinates } from '@/services/geoService'
import { fetchRoute } from '@/services/routeService'

export type TravelMode = 'car'|'bus'|'walk'

export async function calculateRoute(
  from: { name?: string; lat?: number; lng?: number },
  to: { name?: string; lat?: number; lng?: number },
  mode: TravelMode = 'car'
): Promise<{
  distanceKm: number
  durationMin: number
  cost: number
  mode: TravelMode
  from: string
  to: string
  fromCoords?: { lat: number; lng: number }
  toCoords?: { lat: number; lng: number }
} | null> {
  // Resolve coordinates for from/to
  let fromCoords: { lat: number; lng: number } | null = null
  if (from.lat != null && from.lng != null) {
    fromCoords = { lat: from.lat, lng: from.lng }
  } else if (from.name) {
    const f = await fetchCoordinates(from.name)
    if (f) fromCoords = { lat: f.lat, lng: f.lon ?? f.lon }
  }

  let toCoords: { lat: number; lng: number } | null = null
  if (to.lat != null && to.lng != null) {
    toCoords = { lat: to.lat, lng: to.lng }
  } else if (to.name) {
    const t = await fetchCoordinates(to.name)
    if (t) toCoords = { lat: t.lat, lng: t.lon ?? t.lon }
  }

  if (!fromCoords || !toCoords) return null

  const route = await fetchRoute({ lat: fromCoords!.lat, lon: fromCoords!.lng }, { lat: toCoords!.lat, lon: toCoords!.lng })
  if (!route) return null

  const distanceKm = route.distanceKm ?? 0
  const durationMin = route.durationMin ?? Math.max(1, Math.round(distanceKm * 2))
  const rate = mode === 'car' ? 10 : mode === 'bus' ? 2 : mode === 'walk' ? 0 : 1
  const cost = distanceKm * rate
  return {
    distanceKm,
    durationMin,
    cost,
    mode,
    from: from.name ?? `${fromCoords!.lat.toFixed(4)},${fromCoords!.lng.toFixed(4)}`,
    to: to.name ?? `${toCoords!.lat.toFixed(4)},${toCoords!.lng.toFixed(4)}`,
    fromCoords: fromCoords!,
    toCoords: toCoords!
  }
}
