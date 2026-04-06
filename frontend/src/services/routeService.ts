/**
 * Multi-Mode Routing Service
 */
import { snapToRoad } from './geoService';
import { calculateDistance } from '../utils/distance';

export interface RouteSegment {
    mode: 'driving' | 'walking';
    coordinates: [number, number][]; // [lat, lng]
    distance: number; // in meters
    duration: number; // in seconds
    isLastMile?: boolean;
}

export interface MultiModeRoute {
    driving?: RouteSegment;
    walkingLastMile?: RouteSegment;
    totalDistance: number;
    totalDuration: number;
    hasLastMile: boolean;
}

const ROUTE_CACHE = new Map<string, MultiModeRoute>();

/**
 * Generates a route with last-mile detection and multi-mode support.
 * @param start [lat, lng]
 * @param end [lat, lng]
 */
export const getMultiModeRoute = async (
    start: [number, number],
    end: [number, number]
): Promise<MultiModeRoute> => {
    const cacheKey = `${start[0]},${start[1]}-${end[0]},${end[1]}`;
    if (ROUTE_CACHE.has(cacheKey)) {
        return ROUTE_CACHE.get(cacheKey)!;
    }

    try {
        // Step 1: Snap source and destination to nearest roads
        const snappedStart = await snapToRoad(start[0], start[1], 'driving');
        const snappedEnd = await snapToRoad(end[0], end[1], 'driving');

        // Step 2: Fetch Driving Route between snapped points
        const drivingUrl = `https://router.project-osrm.org/route/v1/driving/${snappedStart.lng},${snappedStart.lat};${snappedEnd.lng},${snappedEnd.lat}?overview=full&geometries=geojson`;
        const driveRes = await fetch(drivingUrl);
        const driveData = await driveRes.json();

        if (!driveData.routes || !driveData.routes[0]) {
            throw new Error('No driving route found');
        }

        const driveRoute = driveData.routes[0];
        const drivingSegment: RouteSegment = {
            mode: 'driving',
            coordinates: driveRoute.geometry.coordinates.map((c: number[]) => [c[1], c[0]]),
            distance: driveRoute.distance,
            duration: driveRoute.duration,
        };

        // Step 3: Detect Last-Mile Gap
        // Difference between snapped road endpoint and actual destination
        const lastMileDist = calculateDistance(snappedEnd.lat, snappedEnd.lng, end[0], end[1]);
        const hasLastMile = lastMileDist > 50; // Threshold: 50 meters

        let walkingLastMile: RouteSegment | undefined;
        if (hasLastMile) {
            // Option A: Try OSRM Walking between snapped point and actual destination
            // Option B: Just a straight line (cheaper for very short distances)
            // For better experience, we use a straight line if < 200m, else try OSRM walking
            if (lastMileDist < 300) {
              walkingLastMile = {
                  mode: 'walking',
                  coordinates: [[snappedEnd.lat, snappedEnd.lng], [end[0], end[1]]],
                  distance: lastMileDist,
                  duration: lastMileDist / 1.4, // Avg walking speed 1.4m/s
                  isLastMile: true,
              };
            } else {
              try {
                const walkUrl = `https://router.project-osrm.org/route/v1/walking/${snappedEnd.lng},${snappedEnd.lat};${end[1]},${end[0]}?overview=full&geometries=geojson`;
                const walkRes = await fetch(walkUrl);
                const walkData = await walkRes.json();
                if (walkData.routes && walkData.routes[0]) {
                  const walkRoute = walkData.routes[0];
                  walkingLastMile = {
                    mode: 'walking',
                    coordinates: walkRoute.geometry.coordinates.map((c: number[]) => [c[1], c[0]]),
                    distance: walkRoute.distance,
                    duration: walkRoute.duration,
                    isLastMile: true,
                  };
                }
              } catch (walkErr) {
                // Fallback to straight line
                walkingLastMile = {
                    mode: 'walking',
                    coordinates: [[snappedEnd.lat, snappedEnd.lng], [end[0], end[1]]],
                    distance: lastMileDist,
                    duration: lastMileDist / 1.4,
                    isLastMile: true,
                };
              }
            }
        }

        const result: MultiModeRoute = {
            driving: drivingSegment,
            walkingLastMile,
            totalDistance: (drivingSegment.distance || 0) + (walkingLastMile?.distance || 0),
            totalDuration: (drivingSegment.duration || 0) + (walkingLastMile?.duration || 0),
            hasLastMile,
        };

        ROUTE_CACHE.set(cacheKey, result);
        return result;
    } catch (err) {
        console.error('[MultiModeRoute Error]', err);
        // Absolute Fallback: straight line from start to end
        const dist = calculateDistance(start[0], start[1], end[0], end[1]);
        return {
            driving: {
                mode: 'driving',
                coordinates: [[start[0], start[1]], [end[0], end[1]]],
                distance: dist,
                duration: dist / 11, // Avg driving speed ~40km/h
            },
            totalDistance: dist,
            totalDuration: dist / 11,
            hasLastMile: false,
        };
    }
};

/**
 * Compatibility export for older components (e.g. ItineraryRoutes)
 */
export const fetchRoute = async (from: { lat: number, lon: number }, to: { lat: number, lon: number }) => {
  try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`
      const res = await fetch(url)
      const data = await res.json()
      if (data.routes && data.routes[0]) {
          return {
              distanceKm: data.routes[0].distance / 1000,
              durationMin: data.routes[0].duration / 60
          }
      }
  } catch (e) {
      console.error('[fetchRoute Error]', e)
  }
  return null;
};

/**
 * Clears the route cache.
 */
export const clearRouteCache = () => {
    ROUTE_CACHE.clear();
};
