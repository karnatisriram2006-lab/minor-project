"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { WifiOff, Download, Map as MapIcon, BookOpen, FileText, CheckCircle2, Smartphone, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const offlineFeatures = [
  {
    icon: MapIcon,
    title: "Offline Maps",
    desc: "Download city maps with key landmarks, hospitals, and transit stations."
  },
  {
    icon: BookOpen,
    title: "Travel Guides",
    desc: "Access curated guides for heritage sites, local food, and hidden gems."
  },
  {
    icon: FileText,
    title: "Saved Itineraries",
    desc: "View your planned trips day-by-day even without internet."
  },
  {
    icon: Smartphone,
    title: "AI Chat (Cached)",
    desc: "Previously asked AI responses remain available offline."
  }
]

type OfflineTrip = {
  id: string
  title: string
  destination: string
  days: number
  source: "saved" | "cache" | "itinerary"
}

type OfflineStop = {
  id: string
  name: string
  time?: string
  lat?: number
  lng?: number
}

type OfflineDay = {
  day: string
  stops: OfflineStop[]
}

type OfflineTripDetail = {
  id: string
  days: OfflineDay[]
}

const CITY_PACK_INDEX_KEY = "yatra_city_pack_index"

export default function OfflinePage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadedPacks, setDownloadedPacks] = useState<Record<string, { places: number; downloadedAt: string }>>({})
  const [downloadMessage, setDownloadMessage] = useState("")
  const [offlineTrips, setOfflineTrips] = useState<OfflineTrip[]>([])
  const [offlineStopsCount, setOfflineStopsCount] = useState(0)
  const [offlineDays, setOfflineDays] = useState<OfflineDay[]>([])
  const [offlineTripDetails, setOfflineTripDetails] = useState<OfflineTripDetail[]>([])

  const handleClearStorage = () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith("yatra_city_pack_") || key === CITY_PACK_INDEX_KEY) {
          localStorage.removeItem(key)
        }
      })
      if ("caches" in window) {
        caches.delete("yatra-city-packs-v1")
      }
      setDownloadedPacks({})
      setDownloadMessage("Storage cleared. You can now download fresh city packs.")
    } catch (err) {
      console.error("Failed to clear storage:", err)
    }
  }

  const handleDownload = async (city: string) => {
    setDownloading(city)
    setDownloadMessage("")
    try {
      // Add a small delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800))

      const placesRes = await fetch(`/places.json?t=${Date.now()}`)
      const places = placesRes.ok ? await placesRes.json() : []
      const cityPlaces = Array.isArray(places)
        ? places.filter((p: any) => String(p?.city || "").toLowerCase() === city.toLowerCase())
        : []

      const packPayload = {
        city,
        downloadedAt: new Date().toISOString(),
        places: cityPlaces,
      }
      
      // Try to save, catch quota error
      try {
        localStorage.setItem(`yatra_city_pack_${city.toLowerCase()}`, JSON.stringify(packPayload))

        const currentIndex = JSON.parse(localStorage.getItem(CITY_PACK_INDEX_KEY) || "{}")
        currentIndex[city] = {
          places: cityPlaces.length,
          downloadedAt: packPayload.downloadedAt,
        }
        localStorage.setItem(CITY_PACK_INDEX_KEY, JSON.stringify(currentIndex))
        setDownloadedPacks(currentIndex)
      } catch (storageErr: any) {
        if (storageErr.name === 'QuotaExceededError' || storageErr.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          throw new Error("STORAGE_FULL")
        }
        throw storageErr
      }

      if ("caches" in window) {
        try {
          const cache = await caches.open("yatra-city-packs-v1")
          const assetsToCache = [
            "/offline",
            "/trip-planner?offline=true",
            "/near-me",
            "/map",
            "/places.json",
            "/leaflet/marker-icon.png",
            "/leaflet/marker-icon-2x.png",
            "/leaflet/marker-shadow.png",
          ]
          await Promise.all(assetsToCache.map((url) => cache.add(url).catch(() => null)))
        } catch (cacheErr) {
          console.warn("Cache API failed, but manifest remains in localStorage", cacheErr)
        }
      }

      setDownloadMessage(`Success! ${city} pack is now available offline.`)
    } catch (err: any) {
      console.error("Download failed:", err)
      if (err.message === "STORAGE_FULL") {
        setDownloadMessage("Storage is full! Please clear old city packs using the Manage Storage button.")
      } else {
        setDownloadMessage(`Could not download ${city} pack. Please check your connection.`)
      }
    } finally {
      setDownloading(null)
    }
  }

  const cities = ["Goa", "Jaipur", "Kerala", "Delhi", "Agra", "Varanasi"]

  useEffect(() => {
    try {
      const existingIndex = JSON.parse(localStorage.getItem(CITY_PACK_INDEX_KEY) || "{}")
      setDownloadedPacks(existingIndex)
      const queued = JSON.parse(localStorage.getItem("offline-trips") || "[]")
      const cached = JSON.parse(localStorage.getItem("last_trips_cache") || "[]")
      const itinerary = JSON.parse(localStorage.getItem("offline-itinerary") || "null")
      const normalizeDays = (rawDays: any) => {
        if (Array.isArray(rawDays)) return rawDays
        if (rawDays && typeof rawDays === "object") {
          return Object.entries(rawDays).map(([dayKey, activities]) => ({
            day: Number(String(dayKey).replace(/\D/g, "")) || dayKey,
            activities: Array.isArray(activities) ? activities : [],
          }))
        }
        return []
      }

      const normalizedQueued: OfflineTrip[] = (queued || []).map((trip: any, idx: number) => ({
        id: `queued-${idx}`,
        title: trip?.title || trip?.destination || "Saved trip",
        destination: trip?.destination || trip?.title || "Unknown destination",
        days: Number(trip?.duration || trip?.days?.length || 0) || 0,
        source: "saved",
      }))
      const queuedDetails: OfflineTripDetail[] = (queued || []).map((trip: any, idx: number) => {
        const rawDays = normalizeDays(trip?.days)
        const days = rawDays.map((d: any, dayIdx: number) => ({
          day: `Day ${d?.day ?? dayIdx + 1}`,
          stops: Array.isArray(d?.activities)
            ? d.activities.map((a: any, stopIdx: number) => ({
                id: String(a?._id || a?.id || `queued-${idx}-d${dayIdx}-s${stopIdx}`),
                name: a?.name || "Unnamed stop",
                time: a?.time,
                lat: Number.isFinite(Number(a?.lat)) ? Number(a?.lat) : undefined,
                lng: Number.isFinite(Number(a?.lng)) ? Number(a?.lng) : undefined,
              }))
            : [],
        }))
        return { id: `queued-${idx}`, days }
      })

      const normalizedCached: OfflineTrip[] = (cached || []).map((trip: any, idx: number) => ({
        id: String(trip?._id || `cache-${idx}`),
        title: trip?.title || trip?.destination || "Saved trip",
        destination: trip?.destination || trip?.city || "Unknown destination",
        days: Number(trip?.duration || trip?.days?.length || 0) || 0,
        source: "cache",
      }))
      const cachedDetails: OfflineTripDetail[] = (cached || []).map((trip: any, idx: number) => {
        const id = String(trip?._id || `cache-${idx}`)
        const rawDays = normalizeDays(trip?.days)
        const days = rawDays.map((d: any, dayIdx: number) => ({
          day: `Day ${d?.day ?? dayIdx + 1}`,
          stops: Array.isArray(d?.activities)
            ? d.activities.map((a: any, stopIdx: number) => ({
                id: String(a?._id || a?.id || `${id}-d${dayIdx}-s${stopIdx}`),
                name: a?.name || "Unnamed stop",
                time: a?.time,
                lat: Number.isFinite(Number(a?.lat)) ? Number(a?.lat) : undefined,
                lng: Number.isFinite(Number(a?.lng)) ? Number(a?.lng) : undefined,
              }))
            : [],
        }))
        return { id, days }
      })

      const itineraryDays = itinerary && typeof itinerary === "object" ? Object.keys(itinerary).length : 0
      const normalizedItinerary: OfflineTrip[] =
        itineraryDays > 0
          ? [{
              id: "offline-itinerary",
              title: "Offline itinerary",
              destination: "Last planned route",
              days: itineraryDays,
              source: "itinerary",
            }]
          : []
      const itineraryDetail: OfflineTripDetail[] =
        itinerary && typeof itinerary === "object"
          ? [{
              id: "offline-itinerary",
              days: Object.entries(itinerary).map(([dayKey, stops]) => ({
                day: dayKey,
                stops: Array.isArray(stops)
                  ? stops.map((s: any, idx: number) => ({
                      id: String(s?.id ?? `${dayKey}-${idx}`),
                      name: s?.name || "Unnamed stop",
                      time: s?.time || s?.schedule?.departure || s?.schedule?.arrival,
                      lat: Number.isFinite(Number(s?.lat)) ? Number(s?.lat) : undefined,
                      lng: Number.isFinite(Number(s?.lng)) ? Number(s?.lng) : undefined,
                    }))
                  : [],
              })),
            }]
          : []

      const merged = [...normalizedQueued, ...normalizedCached, ...normalizedItinerary]
      const deduped = merged.filter((trip, index, arr) => {
        return arr.findIndex((t) => t.id === trip.id || (t.title === trip.title && t.destination === trip.destination)) === index
      })

      setOfflineTrips(deduped)

      const totalStops = itinerary && typeof itinerary === "object"
        ? Object.values(itinerary).reduce((sum: number, day: any) => sum + (Array.isArray(day) ? day.length : 0), 0)
        : 0
      setOfflineStopsCount(totalStops)

      const parsedDays: OfflineDay[] =
        itinerary && typeof itinerary === "object"
          ? Object.entries(itinerary).map(([dayKey, stops]) => ({
              day: dayKey,
              stops: Array.isArray(stops)
                ? stops.map((s: any, idx: number) => ({
                    id: String(s?.id ?? `${dayKey}-${idx}`),
                    name: s?.name || "Unnamed stop",
                    time: s?.time || s?.schedule?.departure || s?.schedule?.arrival,
                    lat: Number.isFinite(Number(s?.lat)) ? Number(s?.lat) : undefined,
                    lng: Number.isFinite(Number(s?.lng)) ? Number(s?.lng) : undefined,
                  }))
                : [],
            }))
          : []
      setOfflineDays(parsedDays)
      const mergedDetails = [...queuedDetails, ...cachedDetails, ...itineraryDetail].filter(
        (d, idx, arr) => arr.findIndex((x) => x.id === d.id) === idx,
      )
      setOfflineTripDetails(mergedDetails)
    } catch {
      setDownloadedPacks({})
      setOfflineTrips([])
      setOfflineStopsCount(0)
      setOfflineDays([])
      setOfflineTripDetails([])
    }
  }, [])

  const hasOfflineData = useMemo(() => offlineTrips.length > 0 || offlineStopsCount > 0, [offlineTrips, offlineStopsCount])

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-3 py-1 rounded-full border border-[#00A699]/15">
              <WifiOff className="h-3.5 w-3.5" />
              Works Offline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Travel without <span className="text-[#00A699]">internet</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Download essential travel data before your trip. Everything works even in remote areas with no connectivity.
          </p>
        </div>

        {/* What works offline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offlineFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00A699]/8 flex items-center justify-center text-[#00A699]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[#484848]">{f.title}</h3>
              <p className="text-xs text-[#767676] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Saved Offline Data */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EBEBEB]">
            <h2 className="text-base font-bold text-[#484848] tracking-tight">Saved trip plans on this device</h2>
            <p className="text-xs text-[#767676] mt-0.5">
              {hasOfflineData
                ? `Found ${offlineTrips.length} saved trip entries${offlineStopsCount ? ` and ${offlineStopsCount} mapped stops` : ""}.`
                : "No offline trip data found yet. Open planner while online to cache your routes and stops."}
            </p>
          </div>
          <div className="p-6">
            {offlineTrips.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {offlineTrips.map((trip) => (
                    <div key={trip.id} className="rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-4 space-y-2">
                      <p className="text-sm font-bold text-[#484848]">{trip.title}</p>
                      <p className="text-xs text-[#767676]">{trip.destination}</p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#00A699]">
                        <span className="px-2 py-0.5 rounded-md bg-[#00A699]/10 border border-[#00A699]/20">{trip.days || 1} day plan</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 uppercase">{trip.source}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {offlineTripDetails.length > 0 && (
                  <div className="rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-4 space-y-3">
                    <p className="text-sm font-bold text-[#484848]">Cached trip details</p>
                    <div className="space-y-3 max-h-72 overflow-auto pr-1">
                      {offlineTrips.map((trip) => {
                        const detail = offlineTripDetails.find((d) => d.id === trip.id)
                        if (!detail || detail.days.length === 0) return null
                        return (
                          <div key={`detail-${trip.id}`} className="rounded-lg border border-[#E9E9E9] bg-white p-3 space-y-2">
                            <p className="text-xs font-bold text-[#484848]">{trip.title}</p>
                            {detail.days.map((day) => (
                              <div key={`${trip.id}-${day.day}`} className="space-y-1.5">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#767676]">{day.day}</p>
                                {day.stops.slice(0, 5).map((stop) => (
                                  <div key={stop.id} className="flex items-center justify-between gap-2 text-xs">
                                    <span className="font-medium text-[#484848]">{stop.name}</span>
                                    <span className="text-[#767676]">{stop.time || "--:--"}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {offlineDays.length > 0 && (
                  <div className="rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#484848]">Offline itinerary details</p>
                      <Link href="/trip-planner?offline=true">
                        <Button size="sm" className="h-8 px-3 text-xs rounded-lg">
                          Open in Planner
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-auto pr-1">
                      {offlineDays.map((day) => (
                        <div key={day.day} className="rounded-lg border border-[#E9E9E9] bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#767676]">{day.day}</p>
                          <div className="mt-2 space-y-1.5">
                            {day.stops.length > 0 ? (
                              day.stops.map((stop) => (
                                <div key={stop.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="font-medium text-[#484848]">{stop.name}</span>
                                  <span className="text-[#767676]">{stop.time || "--:--"}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-[#999]">No stops cached for this day.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#EBEBEB] bg-[#FAFAFA] p-5 text-xs text-[#767676]">
                You can still browse previously opened pages and cached assets, but no user trip data has been cached yet.
              </div>
            )}
          </div>
        </div>

        {/* Download city packs */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EBEBEB] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#484848] tracking-tight">Download city packs</h2>
              <p className="text-xs text-[#767676] mt-0.5">Each pack includes maps, guides, and saved itineraries</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearStorage}
              className="h-9 px-3 text-[11px] font-bold text-[#FF5A5F] border-[#FF5A5F]/20 hover:bg-[#FF5A5F]/5 hover:border-[#FF5A5F]/30 rounded-xl flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Storage
            </Button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cities.map((city) => {
                const isDownloading = downloading === city
                const isDownloaded = !!downloadedPacks[city]
                return (
                  <div key={city} className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(city)}
                      disabled={isDownloading}
                      className="h-14 rounded-xl text-xs font-semibold w-full transition-all active:scale-[0.97] flex flex-col items-center gap-1"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#FF5A5F]/30 border-t-[#FF5A5F] rounded-full animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          {isDownloaded ? <CheckCircle2 className="h-4 w-4 text-[#00A699]" /> : <Download className="h-4 w-4" />}
                          <span>{city}</span>
                        </>
                      )}
                    </Button>
                    
                    {isDownloaded && (
                      <Link href={`/near-me?city=${city}&offline=true`} className="w-full">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full h-8 text-[10px] font-bold text-[#00A699] hover:bg-[#00A699]/5 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <MapIcon className="h-3 w-3" />
                          View Map
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
            {downloadMessage && (
              <p className="text-xs text-[#767676] mt-3">{downloadMessage}</p>
            )}
          </div>
        </div>

        {/* PWA Install prompt */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#FF5A5F]/5 to-[#00A699]/5 rounded-2xl border border-[#EBEBEB] p-8 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
            <Smartphone className="h-6 w-6 text-[#FF5A5F]" />
          </div>
          <h3 className="text-lg font-bold text-[#484848]">Install YĀTRĀ as an app</h3>
          <p className="text-sm text-[#767676] max-w-md mx-auto">
            Add YĀTRĀ to your home screen for instant offline access. Works like a native app on Android and iOS.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-[#767676]">
            {["No app store needed", "Works on any device", "Full offline support"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00A699]" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
