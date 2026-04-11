"use client";
import { useState, useRef, useEffect } from "react";
import { useMap } from "react-leaflet";

const INDIA_CITIES = [
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Goa", lat: 15.2993, lng: 74.124 },
  { name: "Agra", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", lat: 25.3176, lng: 82.9739 },
  { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
  { name: "Mysore", lat: 12.2958, lng: 76.6394 },
  { name: "Shimla", lat: 31.1048, lng: 77.1734 },
  { name: "Manali", lat: 32.2396, lng: 77.1887 },
  { name: "Leh", lat: 34.1526, lng: 77.5771 },
  { name: "Kochi", lat: 9.9312, lng: 76.2673 },
  { name: "Pondicherry", lat: 11.9416, lng: 79.8083 },
  { name: "Amritsar", lat: 31.634, lng: 74.8723 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
];

export default function MapSearchBar({
  onCitySelect,
}: {
  onCitySelect?: (city: { name: string; lat: number; lng: number }) => void;
}) {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length > 0
      ? INDIA_CITIES.filter((c) =>
          c.name.toLowerCase().startsWith(query.toLowerCase()),
        )
      : [];

  const select = (city: (typeof INDIA_CITIES)[0]) => {
    map.flyTo([city.lat, city.lng], 12, { animate: true, duration: 1.5 });
    setQuery(city.name);
    setFocused(false);
    onCitySelect?.(city);
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 12 : 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: isMobile ? "calc(100% - 24px)" : 340,
        zIndex: 1000,
        maxWidth: "100%",
      }}
    >
      {/* Search pill */}
      <div
        style={{
          background: "white",
          borderRadius: focused ? "12px 12px 0 0" : "24px",
          boxShadow: focused
            ? "0 4px 20px rgba(0,0,0,0.18)"
            : "0 2px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          height: 44,
          transition: "box-shadow 0.2s, border-radius 0.15s",
        }}
      >
        {/* Search icon */}
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={
            isMobile ? "Search India..." : "Search destinations in India..."
          }
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            background: "transparent",
            color: "#1a1a1a",
            fontFamily: "inherit",
            height: "100%",
            minWidth: 0,
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#888",
              fontSize: 18,
              lineHeight: 1,
              flexShrink: 0,
              padding: "4px",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {focused && filtered.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            borderTop: "1px solid #f3f4f6",
            overflow: "hidden",
          }}
        >
          {filtered.slice(0, 5).map((city) => (
            <div
              key={city.name}
              onMouseDown={() => select(city)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                cursor: "pointer",
                fontSize: 13.5,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Red location pin icon */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#FEF2F2",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#E8391A">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: "#111827" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>India</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
