import { useState, useCallback } from 'react';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { geocodeCity } from '@/lib/geocodingService';

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getWeather = useCallback(async (city: string) => {
        if (!city.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Geocode city (Nominatim)
            const coords = await geocodeCity(city);
            if (!coords) {
                setError(`Could not find location: ${city}`);
                setLoading(false);
                return;
            }
            
            // Step 2: Fetch weather (Open-Meteo)
            const data = await fetchWeather(coords.lat, coords.lng);
            if (!data) {
                setError("Failed to fetch weather data.");
                setLoading(false);
                return;
            }
            
            setWeather(data);
        } catch (err) {
            console.error(err);
            setError("Something went wrong while fetching weather.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { weather, loading, error, getWeather };
}
