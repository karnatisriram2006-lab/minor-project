"use client"
import { useEffect, useRef } from "react"
import type { Map as LeafletMap } from "leaflet"

interface AnimatedRouteProps {
  map: LeafletMap | null;
  coordinates: { lat: number; lng: number }[];
  isPlaying: boolean;
  onComplete?: () => void;
}

export default function AnimatedRoute({ map, coordinates, isPlaying, onComplete }: AnimatedRouteProps) {
  const markerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const progressRef = useRef(0);

  useEffect(() => {
    if (!map || coordinates.length === 0) return;

    const setupMarker = async () => {
      if (!markerRef.current) {
        const L = (await import("leaflet")).default;
        const icon = L.divIcon({
          html: `
            <div class="marker-pulse" style="width:32px;height:32px;background:rgba(255,107,53,0.3);display:flex;align-items:center;justify-content:center;position:relative;">
               <div style="background:#FF6B35;width:10px;height:10px;border-radius:50%;box-shadow:0 0 20px #FF6B35, 0 0 40px #FFD700;"></div>
            </div>
          `,
          className: "custom-animated-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        markerRef.current = L.marker([coordinates[0].lat, coordinates[0].lng], { icon, zIndexOffset: 1000 }).addTo(map);
      }
    };

    setupMarker();

    return () => {
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [map, coordinates]);

  useEffect(() => {
    if (!isPlaying || !markerRef.current || coordinates.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    const speed = 0.05; // Adjust this to make it faster or slower
    
    // Calculate total distance to make speed uniform
    const totalPoints = coordinates.length;

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      progressRef.current += (delta * speed);
      
      const currentIdx = Math.floor(progressRef.current);
      if (currentIdx >= totalPoints - 1) {
        // Animation complete
        progressRef.current = 0;
        const lastPoint = coordinates[totalPoints - 1];
        markerRef.current.setLatLng([lastPoint.lat, lastPoint.lng]);
        if (onComplete) onComplete();
        return;
      }

      const point1 = coordinates[currentIdx];
      const point2 = coordinates[currentIdx + 1];

      if (!point1 || !point2) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const fraction = progressRef.current - currentIdx;

      // Linear interpolation
      const lat = point1.lat + (point2.lat - point1.lat) * fraction;
      const lng = point1.lng + (point2.lng - point1.lng) * fraction;

      markerRef.current.setLatLng([lat, lng]);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, coordinates, onComplete]);

  return null;
}
