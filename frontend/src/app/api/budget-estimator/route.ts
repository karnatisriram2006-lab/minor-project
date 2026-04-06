import { NextRequest, NextResponse } from 'next/server'
// Fallback budgets (avoid module resolution issues during build). Can be replaced by imported module later.
const PER_KM_RATES = { car: 10, bus: 2, train: 1.5, flight: 5 } as const
const PER_DAY_BUDGET = { low: 500, medium: 1500, luxury: 4000 } as const

type TravelMode = 'car'|'bus'|'train'|'flight'
type BudgetType = 'low'|'medium'|'luxury'

async function geocode(address: string): Promise<{lat: number, lon: number} | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'YATRA-budget-estimator' } })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function GET(request: NextRequest) {
  const { source, destination, days, mode, budget } = Object.fromEntries(new URL(request.url).searchParams)

  // Basic validation and defaults
  const s = source?.trim()
  const d = destination?.trim()
  const daysN = parseInt(days || '1', 10)
  const travelMode = (mode as TravelMode) ?? 'car'
  const budgetType = (budget as BudgetType) ?? 'medium'
  if (!s || !d) {
    return NextResponse.json({ error: 'source and destination required' }, { status: 400 })
  }
  if (!['car','bus','train','flight'].includes(travelMode)) {
    return NextResponse.json({ error: 'invalid travel mode' }, { status: 400 })
  }
  if (!['low','medium','luxury'].includes(budgetType)) {
    return NextResponse.json({ error: 'invalid budget type' }, { status: 400 })
  }

  // Geocode both locations
  const src = await geocode(s)
  const dst = await geocode(d)
  if (!src || !dst) {
    return NextResponse.json({ error: 'Unable to geocode source/destination' }, { status: 400 })
  }

  // Try OSRM distance (driving). Fallback to haversine if OSRM fails
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${src.lon},${src.lat};${dst.lon},${dst.lat}?overview=false`
  let distanceMeters = 0
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(osrmUrl, { signal: controller.signal })
    const data = await res.json()
    distanceMeters = data?.routes?.[0]?.distance ?? 0
  } catch {
    distanceMeters = Math.round(haversineKm(src.lat, src.lon, dst.lat, dst.lon) * 1000)
  } finally {
    clearTimeout(timeoutId)
  }
  const distanceKm = distanceMeters / 1000

  const rate = PER_KM_RATES[travelMode] ?? 0
  const perDayBudget = PER_DAY_BUDGET[budgetType] ?? 0
  const travelCost = distanceKm * rate
  const stayCost = daysN * perDayBudget
  const foodCost = daysN * 500
  const total = travelCost + stayCost + foodCost

  const payload = {
    distanceKm,
    distanceMeters,
    travelCost,
    stayCost,
    foodCost,
    total,
    mode: travelMode,
    budgetType,
    source: s,
    destination: d,
    days: daysN,
    perKmRate: rate,
    perDayBudget
  }
  return NextResponse.json(payload)
}
