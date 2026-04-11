/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 * 100% Free - No API Key Required
 * Note: Requires custom User-Agent as per Nominatim usage policy.
 *
 * Fallback behavior: If remote geocoding fails (network or service blocked), we fall back to a small local cache of
 * coordinates for common cities to keep the app usable offline or in restricted environments.
 */

export interface GeocodeResult {
    lat: number;
    lng: number;
    displayName: string;
}

// Local city coordinate cache (fallback when network geocoding isn't available)
const LOCAL_COORDS: Record<string, { lat: number; lng: number; displayName?: string }> = {
  Delhi: { lat: 28.6139, lng: 77.2090, displayName: 'Delhi' },
  Mumbai: { lat: 19.0760, lng: 72.8777, displayName: 'Mumbai' },
  Jaipur: { lat: 26.9124, lng: 75.7873, displayName: 'Jaipur' },
  Goa: { lat: 15.2993, lng: 74.1233, displayName: 'Goa' },
  Varanasi: { lat: 25.3176, lng: 82.9739, displayName: 'Varanasi' },
  Kochi: { lat: 9.9312, lng: 76.2673, displayName: 'Kochi' },
  Kerala: { lat: 10.8505, lng: 76.2711, displayName: 'Kerala' },
  Chennai: { lat: 13.0827, lng: 80.2707, displayName: 'Chennai' },
  Bangalore: { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru' },
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const apiUrl = (rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl) + '/api';

export const geocodeCity = async (city: string): Promise<GeocodeResult | null> => {
  if (!city) return null
  // Try remote geocoding via our backend proxy first
  try {
    const response = await fetch(`${apiUrl}/route/geocode?q=${encodeURIComponent(city)}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (e) {
    // fall back to local cache
    console.warn('[Geocoding] Remote fetch failed, trying local cache:', e)
  }

  // Fallback to local cache for common cities
  const key = city.trim()
  const byKey = LOCAL_COORDS[key]
  if (byKey) {
    return {
      lat: byKey.lat,
      lng: byKey.lng,
      displayName: byKey.displayName || key
    }
  }
  // Try capitalized form as a secondary key
  const cap = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
  const byCap = LOCAL_COORDS[cap]
  if (byCap) {
    return {
      lat: byCap.lat,
      lng: byCap.lng,
      displayName: byCap.displayName || cap
    }
  }
  return null
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
        const response = await fetch(`${apiUrl}/route/reverse?lat=${lat}&lon=${lng}`);
        if (response.ok) {
          const data = await response.json();
          return data.display_name || null;
        }
        return null;
    } catch (error) {
        console.error('[Geocoding] Error fetching address:', error);
        return null;
    }
};
