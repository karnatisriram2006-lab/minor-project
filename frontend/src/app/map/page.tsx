"use client"

import dynamic from "next/dynamic"
import { useCallback, useState } from "react"
import { ArrowUpRight, Compass, MapPin, Search } from "lucide-react"
import { motion } from "framer-motion"

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false })

const destinations = [
  { name: "Jaipur", region: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Delhi", region: "North India", lat: 28.6139, lng: 77.209 },
  { name: "Varanasi", region: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Mumbai", region: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Kochi", region: "Kerala", lat: 9.9312, lng: 76.2673 },
]

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState("India")
  const [cityToFocus, setCityToFocus] = useState<(typeof destinations)[number] | null>(null)
  const handleCitySelect = useCallback((city: { name: string }) => setSelectedCity(city.name), [])

  const handleFocusCity = (city: (typeof destinations)[number]) => {
    setSelectedCity(city.name)
    setCityToFocus({ ...city })
  }

  return (
    <div className="relative h-[calc(100dvh-80px)] min-h-[560px] overflow-hidden bg-[#eef1ef] font-sans">
      <div className="absolute inset-0">
        <InteractiveMap focusCity={cityToFocus} onCitySelect={handleCitySelect} />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-4 top-4 z-[1001] flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_8px_28px_rgba(29,45,38,0.12)] backdrop-blur-xl sm:left-6 sm:top-5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f2ed] text-[#27664f]">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#668174]">Yātrā map</p>
          <h1 className="text-base font-semibold leading-5 text-[#1f3028] sm:text-lg">Explore {selectedCity}</h1>
        </div>
      </motion.header>

      <motion.aside
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 }}
        className="absolute bottom-24 left-3 right-3 z-[1001] max-h-[38vh] overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_12px_36px_rgba(29,45,38,0.14)] backdrop-blur-xl sm:bottom-auto sm:left-auto sm:right-5 sm:top-24 sm:max-h-[calc(100%-150px)] sm:w-[300px] sm:p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3 sm:mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#789084]">Start exploring</p>
            <h2 className="mt-1 text-lg font-semibold text-[#1f3028]">Popular places</h2>
          </div>
          <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-semibold text-[#37634f]">India</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-1.5">
          {destinations.map((city, index) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleFocusCity(city)}
              className="group flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#e5eee8] hover:bg-[#f4f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f7d60]"
              aria-label={`Show ${city.name} on the map`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f2] text-[#537765] transition-colors group-hover:bg-white">
                {index === 0 ? <MapPin className="h-4 w-4" /> : <span className="text-xs font-semibold">{String(index + 1).padStart(2, "0")}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#26372f]">{city.name}</span>
                <span className="block text-xs text-[#718078]">{city.region}</span>
              </span>
              <ArrowUpRight className="hidden h-4 w-4 text-[#91a69a] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
            </button>
          ))}
        </div>
        <div className="mt-3 hidden items-center gap-2 border-t border-[#edf0ee] pt-3 text-xs text-[#6f7e75] sm:flex">
          <Search className="h-3.5 w-3.5" />
          Search any destination above
        </div>
      </motion.aside>

      <div className="pointer-events-none absolute bottom-24 left-4 z-[999] hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-2 text-xs font-medium text-[#53645b] shadow-sm backdrop-blur-md sm:flex sm:bottom-5 sm:left-6">
        <span className="h-2 w-2 rounded-full bg-[#4a8a68]" />
        Drag to explore · Select a place to zoom in
      </div>
    </div>
  )
}
