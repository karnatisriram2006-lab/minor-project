import { useState, useCallback } from 'react';
import { geocodeCity } from '@/lib/geocodingService';
import { estimateTripCost, CostEstimate } from '@/lib/costCalculator';

export function useCostEstimator() {
    const [estimate, setEstimate] = useState<CostEstimate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateEstimate = useCallback(async (source: string, destination: string, days: number) => {
        if (!source || !destination || days < 1) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Geocode both locations
            const [sourceCoords, destCoords] = await Promise.all([
                geocodeCity(source),
                geocodeCity(destination)
            ]);
            
            if (!sourceCoords || !destCoords) {
                setError("Could not find source or destination.");
                setLoading(false);
                return;
            }
            
            // Step 2: Calculate
            const result = estimateTripCost(
                sourceCoords.lat, sourceCoords.lng,
                destCoords.lat, destCoords.lng,
                days
            );
            
            setEstimate(result);
        } catch (err) {
            console.error('[Cost Estimator] Error:', err);
            setError("Failed to calculate cost estimate.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { estimate, loading, error, calculateEstimate };
}
