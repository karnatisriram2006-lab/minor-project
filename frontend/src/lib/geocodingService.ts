/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 * 100% Free - No API Key Required
 * Note: Requires custom User-Agent as per Nominatim usage policy.
 */

export interface GeocodeResult {
    lat: number;
    lng: number;
    displayName: string;
}

export const geocodeCity = async (city: string): Promise<GeocodeResult | null> => {
    if (!city) return null;
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'YatraMatrix-Travel-App/1.0'
                }
            }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
        
        return null;
    } catch (error) {
        console.error('[Geocoding] Error fetching coordinates:', error);
        return null;
    }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'User-Agent': 'YatraMatrix-Travel-App/1.0'
                }
            }
        );
        
        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('[Geocoding] Error fetching address:', error);
        return null;
    }
};
