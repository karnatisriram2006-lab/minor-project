import { useState, useCallback } from 'react';
import axios from 'axios';

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
}

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNearbyPlaces = useCallback(async (lat: number, lon: number, type: string = 'tourism.sightseeing') => {
    // Offline fallback: use a local static dataset if offline
    if (typeof window !== 'undefined' && !navigator.onLine) {
      try {
        const res = await fetch('/places.json');
        if (res.ok) {
          const data = await res.json();
          const mapped: Place[] = data.map((p: any) => ({
            id: p.id ?? p.name,
            name: p.name ?? '',
            category: p.category ?? '',
            address: p.address ?? '',
            lat: p.lat ?? 0,
            lon: p.lon ?? 0,
            distance: p.distance ?? 0,
          }));
          setPlaces(mapped);
          return;
        }
      } catch {
        // ignore offline dataset fetch errors
      }
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) {
      console.warn('[Places] Geoapify API key missing. Loading offline dataset if possible.');
      try {
        const res = await fetch('/places.json');
        if (res.ok) {
          const data = await res.json();
          const mapped: Place[] = data.map((p: any) => ({
            id: p.id ?? p.name,
            name: p.name ?? '',
            category: p.category ?? '',
            address: p.address ?? '',
            lat: p.lat ?? 0,
            lon: p.lon ?? 0,
            distance: p.distance ?? 0,
          }));
          setPlaces(mapped);
        }
      } catch {
        // ignore
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=20&apiKey=${apiKey}`
      );

      if (response.data && response.data.features) {
        const mappedPlaces = response.data.features.map((f: any) => ({
          id: f.properties.place_id,
          name: f.properties.name || f.properties.street || 'Unnamed Venue',
          category: f.properties.categories?.[0] ?? '',
          address: f.properties.formatted ?? '',
          lat: f.properties.lat,
          lon: f.properties.lon,
          distance: f.properties.distance ?? 0
        }));
        setPlaces(mappedPlaces);
      }
    } catch (err) {
      console.error('[Places] Error fetching:', err);
      setError('Failed to fetch nearby places.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { places, loading, error, getNearbyPlaces };
}
