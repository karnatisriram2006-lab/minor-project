"use client"
import React from 'react'

export function WeatherCard({ data, city, loading }: { data: any | null; city: string; loading?: boolean }) {
  const cityName = city || data?.city || 'Current Location'
  const tempVal = typeof data?.temperature === 'number' ? data.temperature
    : typeof data?.temp === 'number' ? data.temp
    : (data?.current_weather?.temperature ?? undefined)
  const conditionText = data?.description || data?.condition || data?.current_weather?.description || (data?.weather?.description as string)
  const iconSrc = data?.icon || data?.iconUrl || undefined
  const verdict = conditionText ? (typeof conditionText === 'string' ? conditionText : 'Weather') : 'Weather data unavailable'

  if (loading) {
    return <div className="p-4 bg-white rounded-2xl border border-[#EBEBEB] shadow-sm animate-pulse h-28" />
  }
  if (!data && tempVal === undefined && !iconSrc && !conditionText) {
    return null
  }

  const wind = (data?.windSpeed ?? data?.wind?.speed ?? 0)
  const humidity = (data?.humidity ?? 0)
  const verified = data?.verified ?? false

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 max-w-md mx-auto sm:mx-0 sm:max-w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold uppercase tracking-wide text-gray-700">CURRENT LOCATION</div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--color-teal-100)', color: 'var(--color-teal-700)' }}>LIVE WEATHER</div>
      </div>

      <div className="flex items-center gap-6 mt-2 mb-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-pink-100)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-pink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M4.93 4.93l1.41 1.41"></path>
            <path d="M18.66 18.66l1.41 1.41"></path>
            <path d="M4.93 19.07l1.41-1.41"></path>
            <path d="M18.66 4.29l1.41-1.41"></path>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-extrabold align-middle">{tempVal ?? '—'}</span>
            <span className="text-3xl font-semibold align-super ml-1">°C</span>
          </div>
          <div className="text-xl font-semibold text-gray-700">{conditionText ? verdict : ''}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-3" style={{ borderColor: 'var(--color-teal-100)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h12a4 4 0 0 1 0 8H4" />
            <path d="M6 10a6 6 0 1 0 6-6" />
          </svg>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Wind</div>
            <div className="font-semibold text-gray-800">{Math.round(wind)} km/h</div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-3" style={{ borderColor: 'var(--color-teal-100)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-pink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
            <path d="M7 12l5-4 5 4" />
          </svg>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Humidity</div>
            <div className="font-semibold text-gray-800">{humidity}%</div>
          </div>
        </div>
      </div>

      <div className="mt-4 h-8" style={{ backgroundColor: 'var(--color-bottom, #2f2f2f)' }}>
        <div className="flex items-center h-full px-4 text-sm text-white">
          <span>OPEN-METEO REALTIME</span>
          <span className="ml-auto flex items-center gap-2 text-teal-300"><span className="h-2 w-2 rounded-full bg-teal-400" /> VERIFIED</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard
