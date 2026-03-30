/**
 * Travel Cost Calculator Utility
 * Uses Haversine Formula for Distance Calculation
 * 100% Local Logic - No API Required
 */

export interface CostEstimate {
    distanceKm: number;
    transportCost: number;
    accommodationCost: number;
    totalCost: number;
}

const EARTH_RADIUS_KM = 6371;
const ROAD_BUFFER_MULTIPLIER = 1.3; // Adjustment from straight-line to road distance
const TRANSPORT_RATE_PER_KM = 12; // Static INR rate per km
const STAY_RATE_PER_DAY = 1800; // Static INR rate per day

/**
 * Calculates straight-line distance between two points on Earth.
 */
export function calculateHaversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

/**
 * Estimates full trip cost.
 */
export function estimateTripCost(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    days: number
): CostEstimate {
    const rawDistance = calculateHaversineDistance(lat1, lng1, lat2, lng2);
    const distanceKm = Math.round(rawDistance * ROAD_BUFFER_MULTIPLIER);
    
    const transportCost = distanceKm * TRANSPORT_RATE_PER_KM;
    const accommodationCost = days * STAY_RATE_PER_DAY;
    
    return {
        distanceKm,
        transportCost,
        accommodationCost,
        totalCost: Math.round(transportCost + accommodationCost)
    };
}
