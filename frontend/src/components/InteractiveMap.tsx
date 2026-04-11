"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  MapPin,
  Search,
  Shield,
  Info,
  ArrowRight,
  Plus,
  Minus,
  Sun,
  Moon,
} from "lucide-react";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { MultiModeRoute } from "@/services/routeService";

// Custom Components
import { cn } from "@/lib/utils";
import {
  createNumberedMarker,
  createUserLocationMarker,
} from "./map/CustomMarker";
import MapControls from "./map/MapControls";
import MapSearchBar from "./map/MapSearchBar";

// Fix default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

interface Location {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category?: string;
  time?: string;
  duration?: string;
  cost?: number;
  schedule?: {
    departure: string;
    stayDuration: number;
  };
  placeImage?: string;
}

interface InteractiveMapProps {
  points?: Location[];
  center?: [number, number];
  zoom?: number;
  focusLeg?: { from: [number, number]; to: [number, number] } | null;
  routingLeg?: { from: [number, number]; to: [number, number] } | null;
  showMultiRoute?: boolean;
  multiModeRoute?: MultiModeRoute | null;
  onGetLocation?: () => void;
}

// Controller to auto-fit bounds on point updates
function MapController({
  points,
  focusLeg,
  routingLeg,
}: {
  points: Location[];
  focusLeg?: { from: [number, number]; to: [number, number] } | null;
  routingLeg?: { from: [number, number]; to: [number, number] } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusLeg || routingLeg) {
      const leg = routingLeg || focusLeg;
      if (!leg) return;

      const from = leg.from;
      const to = leg.to;

      // Logic handle both [lng, lat] (old focusLeg) and [lat, lng] (standard)
      // Actually, let's normalize to [lat, lng] for routingLeg
      const bounds = L.latLngBounds([
        [from[0], from[1]],
        [to[0], to[1]],
      ]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [100, 100],
          animate: true,
          duration: 1,
        });
      }
    } else if (points && points.length > 0) {
      const validPoints = points.filter(
        (p) =>
          !!p &&
          typeof p.lat === "number" &&
          isFinite(p.lat) &&
          typeof p.lng === "number" &&
          isFinite(p.lng),
      );
      if (validPoints.length > 0) {
        if (validPoints.length === 1) {
          map.flyTo([validPoints[0].lat, validPoints[0].lng], 12, {
            animate: true,
            duration: 1.5,
          });
        } else {
          const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [80, 80],
              maxZoom: 14,
              animate: true,
              duration: 1,
            });
          }
        }
      }
    }
  }, [points, focusLeg, routingLeg, map]);

  return null;
}

function ZoomControls() {
  const map = useMap();
  const [isReady, setIsReady] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    // Ensure map is ready before showing controls
    const onLoad = () => setIsReady(true);
    if (map) {
      map.on("load", onLoad);
    }
    return () => {
      if (map) map.off("load", onLoad);
    };
  }, [map]);

  // Hide on mobile or when not ready
  if (isMobile || !isReady) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        bottom: 80,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderRadius: 99,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        gap: 5,
        opacity: isReady ? 1 : 0,
        pointerEvents: isReady ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }}
    >
      <button
        onClick={() => map.zoomIn()}
        style={{
          width: 40,
          height: 40,
          background: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: 22,
          fontWeight: 300,
          color: "#3C4043",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f8f9fa";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        style={{
          width: 40,
          height: 40,
          background: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: 28,
          fontWeight: 300,
          color: "#3C4043",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          paddingBottom: 4,
          transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f8f9fa";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        −
      </button>
    </div>
  );
}

function MyLocationButton({
  onLocation,
}: {
  onLocation: (pos: [number, number]) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    setError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        map.flyTo(latlng, 15, { animate: true, duration: 1.2 });
        onLocation(latlng);
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError(true);
        setTimeout(() => setError(false), 2000);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        right: 12,
        bottom: 32,
        zIndex: 1000,
        width: 40,
        height: 40,
        background: "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.2s",
        color: error ? "#EF4444" : loading ? "#E8391A" : "#4285F4",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
      title="My location"
    >
      {loading ? (
        <div
          style={{
            width: 16,
            height: 16,
            border: "2.5px solid #E8391A",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
      ) : error ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="9" strokeDasharray="2 3" />
        </svg>
      )}
    </button>
  );
}

export default React.memo(function InteractiveMap({
  points = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  focusLeg = null,
  routingLeg = null,
  showMultiRoute = true,
  multiModeRoute = null,
  onGetLocation,
}: InteractiveMapProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [driveCoords, setDriveCoords] = useState<[number, number][]>([]);

  // Guard against dual-mount in Next.js HMR
  useEffect(() => {
    setHasMounted(true);
    return () => setHasMounted(false);
  }, []);

  const [walkCoords, setWalkCoords] = useState<[number, number][]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    [],
  );
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showDark, setShowDark] = useState(false);
  const [activeStop, setActiveStop] = useState<string | number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mapRef = useRef<L.Map | null>(null);

  // OSRM Route Fetching
  useEffect(() => {
    // Priority 1: Multi-mode route (Driving + Walking)
    if (multiModeRoute) {
      setDriveCoords(multiModeRoute.driving?.coordinates || []);
      setWalkCoords(multiModeRoute.walkingLastMile?.coordinates || []);
      setRouteCoordinates([]); // Clear old single-mode route
      return;
    }

    // Priority 2: Specifically requested routing leg (Point A to Point B)
    if (routingLeg) {
      const fetchDirectRoute = async () => {
        setLoadingRoute(true);
        try {
          const { from, to } = routingLeg;
          const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.routes?.[0]) {
              const pathCoords: [number, number][] =
                data.routes[0].geometry.coordinates.map((c: number[]) => [
                  c[1],
                  c[0],
                ]);
              setRouteCoordinates(pathCoords);
              return;
            }
          }
          setRouteCoordinates([
            [from[0], from[1]],
            [to[0], to[1]],
          ]);
        } catch (err) {
          console.error("Direct route fetch error:", err);
        } finally {
          setLoadingRoute(false);
        }
      };
      fetchDirectRoute();
      return;
    }

    // Priority 2: Multi-stop sequence routing (only if enabled and no specific routingLeg)
    if (!showMultiRoute) {
      if (!routingLeg) setRouteCoordinates([]);
      return;
    }

    const validPoints = points.filter(
      (p) => !!p && typeof p.lat === "number" && typeof p.lng === "number",
    );
    if (validPoints.length < 2) {
      // Guard against infinite re-renders when `points` prop changes identity on each render.
      // Only clear route coordinates if they are not already empty.
      if (routeCoordinates.length !== 0) {
        setRouteCoordinates([]);
      }
      return;
    }

    const fetchMultiRoute = async () => {
      setLoadingRoute(true);
      try {
        const coords = validPoints.map((p) => `${p.lng},${p.lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) {
          setRouteCoordinates(validPoints.map((p) => [p.lat, p.lng]));
          return;
        }
        const data = await res.json();
        if (data.routes?.[0]) {
          const pathCoords: [number, number][] =
            data.routes[0].geometry.coordinates.map((c: number[]) => [
              c[1],
              c[0],
            ]);
          setRouteCoordinates(pathCoords);
        } else {
          setRouteCoordinates(validPoints.map((p) => [p.lat, p.lng]));
        }
      } catch (err) {
        console.error("Multi-route fetch error:", err);
        setRouteCoordinates(validPoints.map((p) => [p.lat, p.lng]));
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchMultiRoute();
  }, [points, routingLeg, showMultiRoute, multiModeRoute]);

  const popupHTML = (stop: Location) => `
    <div style="font-family: 'DM Sans', sans-serif;">
      <div style="
        background: linear-gradient(135deg, #E8391A 0%, #ff6b47 100%);
        padding: 12px 16px;
        color: white;
      ">
        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; opacity: 0.85; margin-bottom: 3px;">
          ${stop.category || "STOP"}
        </div>
        <div style="font-size: 16px; font-weight: 600; line-height: 1.3;">
          ${stop.name}
        </div>
      </div>
      ${
        stop.placeImage
          ? `
        <div style="width: 100%; height: 120px; overflow: hidden; position: relative;">
          <img src="${stop.placeImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${stop.name}" />
        </div>
      `
          : ""
      }
      <div style="padding: 12px 16px; background: white;">
        <div style="display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px; color: #555;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style="font-size: 13px; font-weight: 600; color: #E8391A;">
            ${stop.schedule?.departure || stop.time || "Any time"}
          </span>
          ${
            stop.schedule?.stayDuration || stop.duration
              ? `
            <span style="color:#ccc">·</span>
            <span style="font-size: 13px; color: #666;">
              ${stop.schedule ? `${stop.schedule.stayDuration} min stay` : stop.duration}
            </span>
          `
              : ""
          }
        </div>
        ${
          stop.description
            ? `
          <div style="font-size: 12.5px; color: #666; line-height: 1.5;
            margin-bottom: 10px;">
            ${stop.description.slice(0, 80)}${stop.description.length > 80 ? "…" : ""}
          </div>
        `
            : ""
        }
        <div style="display: flex; justify-content: space-between; align-items: center;">
          ${
            stop.cost
              ? `
            <div style="font-size: 13px; font-weight: 600; color: #1a1a1a;">
              ₹${stop.cost.toLocaleString("en-IN")}
            </div>
          `
              : "<div></div>"
          }
          
          <a
            href="https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}"
            target="_blank"
            style="
              font-size: 12px; font-weight: 500;
              color: #4285F4; text-decoration: none;
              display: flex; align-items: center; gap: 4px;
            "
          >
            Open in Maps
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `;

  if (!hasMounted) {
    return (
      <div className="h-full w-full bg-[#f5f3ef] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#E8391A] border-t-transparent animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#767676]">
            Loading Map Engine
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-[#f5f3ef]">
      <MapContainer
        key="yatra-main-map" // Stable key for HMR
        id="yatra-main-map" // Custom ID for internal Leaflet registry
        center={center}
        zoom={zoom}
        maxZoom={18}
        minZoom={4}
        maxBounds={[
          [6.5, 68],
          [35.7, 97.4],
        ]}
        maxBoundsViscosity={0.85}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          key={showDark ? "dark" : "light"}
          url={
            showDark
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          attribution='© <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <ZoomControls />
        <MyLocationButton onLocation={(pos) => setUserLocation(pos)} />

        <MapController
          points={points}
          focusLeg={focusLeg}
          routingLeg={routingLeg}
        />
        <MapSearchBar />

        {/* Multi-Mode Route Lines */}
        {driveCoords.length > 0 && (
          <>
            <Polyline
              positions={driveCoords}
              pathOptions={{
                color: "#ffffff",
                weight: 8,
                opacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={driveCoords}
              pathOptions={{
                color: "#4285F4",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {walkCoords.length > 0 && (
          <Polyline
            positions={walkCoords}
            pathOptions={{
              color: "#F59E0B",
              weight: 4,
              opacity: 0.8,
              dashArray: "8 12",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* Legacy Single Mode Route Lines */}
        {routeCoordinates.length > 1 && (
          <>
            {/* Layer 1 — white outline underneath (renders first) */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Layer 2 — main blue route on top */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#4285F4",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Layer 3 — direction arrows */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                opacity: 0.8,
                dashArray: "1 12",
                lineCap: "round",
              }}
            />
          </>
        )}

        {/* Markers */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              className: "",
              iconSize: [36, 36],
              iconAnchor: [18, 18],
              html: `
                <div style="
                  width: 36px; height: 36px;
                  background: #E8391A;
                  border: 2.5px solid white;
                  border-radius: 50%;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 13px; font-weight: 700; color: white;
                  box-shadow: 0 3px 10px rgba(232,57,26,0.4);
                ">${count}</div>
              `,
            });
          }}
        >
          {points
            .filter((p) => !!p)
            .map((stop, index) => (
              <Marker
                key={`${stop.id}-${index}`}
                position={[stop.lat, stop.lng]}
                icon={createNumberedMarker(index + 1, activeStop === stop.id)}
                eventHandlers={{
                  click: () => setActiveStop(stop.id),
                }}
              >
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: popupHTML(stop) }} />
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              html: `
                <div style="position:relative;width:24px;height:24px;">
                  <div style="
                    position:absolute;inset:0;
                    border-radius:50%;
                    background:rgba(66,133,244,0.2);
                    animation:pulse 2s ease-out infinite;
                  "></div>
                  <div style="
                    position:absolute;top:50%;left:50%;
                    transform:translate(-50%,-50%);
                    width:14px;height:14px;
                    background:#4285F4;
                    border:2.5px solid white;
                    border-radius:50%;
                    box-shadow:0 2px 8px rgba(66,133,244,0.5);
                  "></div>
                </div>
              `,
            })}
          >
            <Popup>
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  padding: "2px 4px",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  📍 You are here
                </div>
                <div style={{ fontSize: 11.5, color: "#6B7280" }}>
                  {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {loadingRoute && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#EBEBEB] shadow-lg flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-[#E8391A] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#444]">
                Optimizing route...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </MapContainer>

      {/* Combined Focus Point & Dark Toggle Card */}
      {points && points.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "auto" : 16,
            bottom: isMobile ? 124 : "auto",
            right: isMobile ? 12 : 16,
            zIndex: 1000,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            padding: "2px 8px",
            height: 44,
            border: "1px solid #f0ede8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingRight: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "#FEF2F2",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={14} color="#E8391A" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  fontWeight: 600,
                  marginBottom: 0,
                }}
              >
                Focus Point
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                {points[0]?.name?.split(",")[0] || "Selected Location"}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 30, background: "#F3F4F6" }} />

          {/* Dark mode toggle */}
          <button
            onClick={() => setShowDark(!showDark)}
            style={{
              padding: "8px 14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap",
              transition: "color 0.15s",
              height: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            {showDark ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {showDark ? "Light" : "Dark"}
          </button>
        </div>
      )}

      {/* Utility Stack - Top Right (Grouped below Focus Card) */}
      <div
        className={cn(
          "absolute right-4 z-[40] flex flex-col gap-3",
          isMobile ? "bottom-[180px]" : "top-36",
        )}
      >
        {/* Find Me */}
        {onGetLocation && (
          <button
            onClick={onGetLocation}
            className="h-10 w-10 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.12)] border border-[#f0ede8] flex items-center justify-center text-[#767676] hover:text-[#E8391A] hover:bg-[#E8391A]/5 transition-all group active:scale-95"
            title="My Location"
          >
            <Navigation className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setShowDark(!showDark)}
          className="h-10 w-10 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.12)] border border-[#f0ede8] flex items-center justify-center text-[#767676] hover:text-[#E8391A] hover:bg-[#E8391A]/5 transition-all active:scale-95"
          title={showDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {showDark ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Zoom Pair (Unified Circular Style) */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              document
                .querySelector(".leaflet-container")
                ?.dispatchEvent(new CustomEvent("map-zoom-in"))
            }
            className="h-10 w-10 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.12)] border border-[#f0ede8] flex items-center justify-center text-[#484848] font-bold text-lg hover:bg-[#E8391A]/5 hover:text-[#E8391A] transition-all active:scale-95"
          >
            +
          </button>
          <button
            onClick={() =>
              document
                .querySelector(".leaflet-container")
                ?.dispatchEvent(new CustomEvent("map-zoom-out"))
            }
            className="h-10 w-10 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.12)] border border-[#f0ede8] flex items-center justify-center text-[#484848] font-bold text-lg hover:bg-[#E8391A]/5 hover:text-[#E8391A] transition-all active:scale-95"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
});
