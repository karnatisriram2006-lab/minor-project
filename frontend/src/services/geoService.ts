import { geocodeCity } from '../lib/geocodingService';

/**
 * Geocoding & Snapping Service
 * Uses OSRM Nearest API to find the closest routable road coordinates.
 */

export interface SnappedCoordinate {
  lat: number;
  lng: number;
  name?: string;
  distance: number;
}

const SNAPPING_CACHE = new Map<string, SnappedCoordinate>();

/**
 * Snaps a given coordinate to the nearest routable road.
 * @param lat Latitude
 * @param lng Longitude
 * @param mode OSRM Profile ('driving' or 'walking')
 */
export const snapToRoad = async (lat: number, lng: number, mode: 'driving' | 'walking' = 'driving'): Promise<SnappedCoordinate> => {
  const cacheKey = `${lat},${lng},${mode}`;
  if (SNAPPING_CACHE.has(cacheKey)) {
    return SNAPPING_CACHE.get(cacheKey)!;
  }

  try {
    const url = `https://router.project-osrm.org/nearest/v1/${mode}/${lng},${lat}?number=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM Nearest API returned ${response.status}`);

    const data = await response.json();
    if (data.waypoints && data.waypoints[0]) {
      const snapped = {
        lat: data.waypoints[0].location[1],
        lng: data.waypoints[0].location[0],
        name: data.waypoints[0].name,
        distance: data.waypoints[0].distance,
      };
      SNAPPING_CACHE.set(cacheKey, snapped);
      return snapped;
    }
  } catch (error) {
    console.error('[SnapToRoad Error]', error);
  }

  // Fallback: return original coordinates if snapping fails
  return { lat, lng, distance: 0 };
};

/**
 * Compatibility export for older components (e.g. ItineraryRoutes)
 */
export const fetchCoordinates = async (name: string): Promise<{ lat: number; lon: number } | null> => {
  const res = await geocodeCity(name);
  if (!res) return null;
  return { lat: res.lat, lon: res.lng };
};

/**
 * Clears the snapped coordinate cache.
 */
export const clearSnappingCache = () => {
  SNAPPING_CACHE.clear();
};
