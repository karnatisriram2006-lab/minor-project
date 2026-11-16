import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const GEOAPIFY_CATEGORIES: Record<string, string> = {
  restaurant: 'catering.restaurant,catering.fast_food,catering.food_court',
  'tourist-info': 'tourism.attraction,tourism.information,tourism.sights',
  hostel: 'accommodation.hostel',
  atm: 'service.financial.atm',
  hospital: 'healthcare.hospital',
  pharmacy: 'healthcare.pharmacy',
  police: 'service.police',
}

const responseCache = new Map<string, { expiresAt: number; body: unknown }>()
const cacheResponse = (key: string, body: unknown) => {
  responseCache.set(key, { body, expiresAt: Date.now() + 60_000 })
  if (responseCache.size > 500) {
    for (const [entryKey, entry] of responseCache) {
      if (entry.expiresAt <= Date.now()) responseCache.delete(entryKey)
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  const radius = Number(searchParams.get('radius') || 5000)
  const category = searchParams.get('category') || 'restaurant'
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return NextResponse.json({ message: 'A valid latitude and longitude are required.' }, { status: 400 })
  }
  if (!Number.isFinite(radius) || radius < 100 || radius > 50000) {
    return NextResponse.json({ message: 'Radius must be between 100 and 50000 meters.' }, { status: 400 })
  }

  const cacheKey = `${lat.toFixed(3)}:${lng.toFixed(3)}:${category}:${radius}`
  const cached = responseCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.body)

  const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

  try {
    const geoapifyKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    const geoapifyCategories = GEOAPIFY_CATEGORIES[category]

    if (geoapifyKey && geoapifyCategories) {
      try {
        const params = new URLSearchParams({
          categories: geoapifyCategories,
          filter: `circle:${lng},${lat},${radius}`,
          bias: `proximity:${lng},${lat}`,
          limit: '20',
          apiKey: geoapifyKey,
        })
        const placesResponse = await fetch(`https://api.geoapify.com/v2/places?${params}`, {
          headers: { 'User-Agent': 'IncredibleIndiaApp/1.0' },
          signal: AbortSignal.timeout(8000),
        })

        if (!placesResponse.ok) throw new Error(`Geoapify returned ${placesResponse.status}`)
        const placesData = await placesResponse.json()
        const places = (placesData.features || []).map((feature: any, index: number) => {
          const place = feature.properties || {}
          const raw = place.datasource?.raw || {}
          return {
            id: place.place_id || feature.id || `geoapify-${index}`,
            name: place.name || place.address_line1 || place.formatted || 'Unnamed place',
            category,
            address: place.formatted || place.address_line2 || 'Address unavailable',
            phone: raw.phone || raw['contact:phone'] || '',
            distance: Number(place.distance) || 0,
            open24Hours: raw.opening_hours === '24/7',
            verified: false,
            rating: 0,
            lat: Number(place.lat),
            lng: Number(place.lon),
          }
        }).filter((place: any) => Number.isFinite(place.lat) && Number.isFinite(place.lng))

        const body = { places }
        cacheResponse(cacheKey, body)
        return NextResponse.json(body)
      } catch (error: any) {
        console.warn('[API Proxy /nearby] Geoapify unavailable; trying Overpass fallback:', error.message)
      }
    }

    const res = await fetch(
      `${backendUrl}/api/nearby?${new URLSearchParams({ lat: String(lat), lng: String(lng), category, radius: String(radius) })}`,
      { 
        headers: { 'User-Agent': 'IncredibleIndiaApp/1.0' },
        signal: AbortSignal.timeout(21000)
      }
    )
    
    const data = await res.json()
    if (res.ok) cacheResponse(cacheKey, data)
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[API Proxy /nearby Error]', error.message)
    return NextResponse.json(
      { message: 'Unable to fetch nearby places. Please try again.', error: error.message },
      { status: 502 }
    )
  }
}
