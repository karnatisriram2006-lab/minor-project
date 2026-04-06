'use client'
import { useMap } from 'react-leaflet'

export default function MapControls({
  onLayerToggle,
  showDark,
}: {
  onLayerToggle?: () => void
  showDark?: boolean
}) {
  const map = useMap()

  return (
    <>
      {/* Zoom controls — top right, like Google Maps */}
      <div style={{
        position: 'absolute',
        right: 12,
        bottom: 100,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <button
          onClick={() => map.zoomIn()}
          style={{
            width: 40, height: 40,
            background: 'white',
            border: 'none',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontSize: 20,
            fontWeight: 300,
            color: '#444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >+</button>
        <button
          onClick={() => map.zoomOut()}
          style={{
            width: 40, height: 40,
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            fontWeight: 300,
            color: '#444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >−</button>
      </div>

      {/* My location button — bottom right, like Google Maps */}
      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition(pos => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, {
              animate: true, duration: 1.2,
            })
          })
        }}
        style={{
          position: 'absolute',
          right: 12, bottom: 48,
          zIndex: 1000,
          width: 40, height: 40,
          background: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        title="My location"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2"/>
        </svg>
      </button>

      {/* Map type toggle — top right */}
      {onLayerToggle && (
        <button
          onClick={onLayerToggle}
          style={{
            position: 'absolute',
            right: 12, top: 12,
            zIndex: 1000,
            padding: '6px 14px',
            background: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: '#444',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/>
            <path d="M9 3v15M15 6v15"/>
          </svg>
          {showDark ? 'Default' : 'Dark'}
        </button>
      )}

      {/* Scale indicator — bottom left, like Google Maps */}
      <div style={{
        position: 'absolute',
        left: 12, bottom: 24,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        padding: '3px 8px',
        fontSize: 11,
        color: '#555',
        border: '1px solid rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
      }}>
        © CARTO · OpenStreetMap
      </div>
    </>
  )
}
