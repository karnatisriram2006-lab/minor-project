'use client'
import L from 'leaflet'

// Numbered stop marker (for itinerary stops 1, 2, 3...)
export function createNumberedMarker(
  number: number,
  isActive = false
): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 42px;
      ">
        <!-- Pin body -->
        <div style="
          width: 34px;
          height: 34px;
          background: ${isActive ? '#E8391A' : '#ffffff'};
          border: 2.5px solid #E8391A;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2),
                      0 1px 3px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          <span style="
            transform: rotate(45deg);
            font-family: -apple-system, sans-serif;
            font-size: ${number > 9 ? '11px' : '13px'};
            font-weight: 700;
            color: ${isActive ? '#ffffff' : '#E8391A'};
            line-height: 1;
            user-select: none;
          ">${number}</span>
        </div>
        <!-- Pin tip shadow -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 4px;
          background: rgba(0,0,0,0.15);
          border-radius: 50%;
          filter: blur(2px);
        "></div>
      </div>
    `,
  })
}

// Category marker (for near-me: restaurant, hospital etc.)
export function createCategoryMarker(emoji: string, color = '#E8391A') {
  return L.divIcon({
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -44],
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: white;
        border: 2.5px solid ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
  })
}

// User location marker (blue pulsing dot like Google Maps)
export function createUserLocationMarker() {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute; inset: 0;
          background: rgba(66,133,244,0.2);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 14px; height: 14px;
          background: #4285F4;
          border: 2.5px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(66,133,244,0.5);
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
  })
}

// Route waypoint marker (smaller, for intermediate stops)
export function createWaypointMarker(color = '#E8391A') {
  return L.divIcon({
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `
      <div style="
        width: 14px; height: 14px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      "></div>
    `,
  })
}
