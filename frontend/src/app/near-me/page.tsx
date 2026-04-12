"use client"
/* Forced update marker: v2.0.0 - Leaflet Redesign */

import React, { useState, useEffect, useRef, useMemo } from "react"
import { MapPin, Phone, Clock, Star, Navigation, Shield, Hospital, Utensils, Building2, Landmark, Flame, Pill, Wallet, Search, Map as MapIcon, LayoutList } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getMultiModeRoute, type MultiModeRoute } from "@/services/routeService"
import ItineraryRoute from "@/components/ItineraryRoute"

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f5f3ef] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-[#E8391A] border-t-transparent animate-spin" />
    </div>
  ),
})

const CATEGORIES = [
  { value: "restaurant", label: "Restaurants", icon: Utensils, emoji: '🍽', color: "#E8391A" },
  { value: "tourist-info", label: "Tourist Spots", icon: Landmark, emoji: '🏛', color: "#8B5CF6" },
  { value: "hostel", label: "Hotels", icon: Building2, emoji: '🏨', color: "#0EA5E9" },
  { value: "atm", label: "ATMs", icon: Wallet, emoji: '🏧', color: "#10B981" },
  { value: "hospital", label: "Hospitals", icon: Hospital, emoji: '🏥', color: "#EF4444" },
  { value: "pharmacy", label: "Pharmacies", icon: Pill, emoji: '💊', color: "#F59E0B" },
  { value: "police", label: "Police", icon: Shield, emoji: '👮', color: "#3B82F6" },
]

interface NearbyPlace {
  id: string | number
  name: string
  category: string
  address: string
  phone: string
  distance: number
  open24Hours: boolean
  verified: boolean
  rating: number
  lat: number
  lng: number
  description?: string
}

export default function NearMe() {
  const [category, setCategory] = useState("restaurant")
  const [radius, setRadius] = useState("5000")
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState("")
  const [activePlaceId, setActivePlaceId] = useState<string | number | null>(null)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | number | null>(null)
  const [activeRoute, setActiveRoute] = useState<MultiModeRoute | null>(null)
  const [showSearchArea, setShowSearchArea] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629])
  const [showMobileMap, setShowMobileMap] = useState(false)
  const [mapZoom, setMapZoom] = useState(12)

  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string | number, HTMLDivElement | null>>({})

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLoc({ lat: coords[0], lng: coords[1] })
        setMapCenter(coords)
        setError("")
      },
      () => setError("Location access denied. Please enable location services."),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  useEffect(() => {
    if (userLoc) searchNearby()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoc, category, radius])

  const searchNearby = async () => {
    if (!userLoc) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/nearby?lat=${userLoc.lat}&lng=${userLoc.lng}&category=${category}&radius=${radius}`
      )
      const data = await res.json()
      const processed = (data.places || [])
        .map((p: any, idx: number) => ({
          ...p,
          id: p.id || `place-${idx}`,
          lat: Number(p.lat),
          lng: Number(p.lng),
          description: p.address
        }))
        .filter((p: any) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      setPlaces(processed)
      setShowSearchArea(false)
    } catch (err) {
      setError("Failed to fetch nearby places.")
    } finally {
      setLoading(false)
    }
  }

  const selectedCat = CATEGORIES.find(c => c.value === category)
  const Icon = selectedCat?.icon || MapPin

  const mapPoints = useMemo(() => {
    return places.filter(p => !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng)).map(p => ({
      ...p,
      category: selectedCat?.label || 'Place'
    }))
  }, [places, selectedCat])

  const activePlace = useMemo(() => {
    return places.find(p => p.id === activePlaceId) || null
  }, [places, activePlaceId])

  const routingLeg = useMemo(() => {
    if (!userLoc || !activePlace) return null
    return {
      from: [userLoc.lat, userLoc.lng] as [number, number],
      to: [activePlace.lat, activePlace.lng] as [number, number]
    }
  }, [userLoc, activePlace])

  const scrollToItem = async (id: string | number) => {
    setActivePlaceId(id)
    const place = places.find(p => p.id === id)
    if (place && Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      setMapCenter([place.lat, place.lng])
      setMapZoom(16)
      
      // Fetch Multi-Mode Route if user location is available
      if (userLoc) {
        try {
          const route = await getMultiModeRoute([userLoc.lat, userLoc.lng], [place.lat, place.lng])
          setActiveRoute(route)
        } catch (err) {
          console.error("Failed to fetch multi-mode route:", err)
          setActiveRoute(null)
        }
      }
    }
    itemRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handlePlaceHover = (place: NearbyPlace | null) => {
    setHoveredPlaceId(place?.id || null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-white">
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Results List (2fr) */}
        <div className={cn(
          "w-full lg:w-[400px] xl:w-[420px] shrink-0 h-full border-r border-[#f0ede8] flex flex-col z-10 bg-white overflow-y-auto no-scrollbar transition-all duration-300",
          showMobileMap ? "hidden lg:flex" : "flex"
        )}>
          
          <div className="pt-6 pb-5 px-6 border-b border-[#f0ede8] bg-white sticky top-0 z-20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a]">Explore <span className="text-[#E8391A]">Nearby</span></h1>
                <p className="text-[11px] text-[#767676] font-medium mt-0.5">Find essentials and local favorites</p>
              </div>
            </div>

            {/* Category Chips - Scrolling */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.value
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border shrink-0",
                      isSelected 
                        ? "bg-[#E8391A] text-white border-[#E8391A] shadow-md shadow-[#E8391A]/20 scale-[1.02]"
                        : "bg-white text-[#484848] border-[#EBEBEB] hover:border-[#E8391A] hover:text-[#E8391A] shadow-sm"
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white rounded-full px-4 py-2 border border-[#EBEBEB] flex items-center gap-3 shadow-sm hover:border-[#E8391A]/30 transition-colors">
                <span className="text-[11px] font-extrabold text-[#767676] uppercase tracking-wider">Radius:</span>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="h-5 border-none bg-transparent text-[11px] font-extrabold p-0 focus:ring-0 focus:ring-offset-0 w-20 text-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#f0ede8] z-[3000] shadow-xl">
                    <SelectItem value="2000" className="text-[11px] font-semibold">2 KM</SelectItem>
                    <SelectItem value="5000" className="text-[11px] font-semibold">5 KM</SelectItem>
                    <SelectItem value="10000" className="text-[11px] font-semibold">10 KM</SelectItem>
                    <SelectItem value="20000" className="text-[11px] font-semibold">20 KM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-4 py-2 bg-[#FEE2E2] rounded-full border border-[#FECACA] shadow-sm">
                <span className="text-[11px] font-extrabold text-[#E8391A] whitespace-nowrap uppercase tracking-tighter">
                  {places.length} results
                </span>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[10px] font-bold text-[#EF4444] flex items-center gap-2">
                <Shield className="h-3 w-3" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Results scrolling area */}
          <div className="flex-1 px-0 no-scrollbar" ref={listRef}>
            {loading && places.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                 <div className="w-8 h-8 rounded-full border-4 border-[#E8391A]/20 border-t-[#E8391A] animate-spin" />
                 <p className="text-[11px] font-bold text-[#767676] uppercase tracking-[0.2em] animate-pulse">Searching Destinations...</p>
              </div>
            ) : places.length > 0 ? (
              <div className="divide-y divide-[#f0ede8]">
                {places.map((place) => (
                  <React.Fragment key={place.id}>
                    <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    ref={el => { itemRefs.current[place.id] = el }}
                    onMouseEnter={() => handlePlaceHover(place)}
                    onMouseLeave={() => handlePlaceHover(null)}
                    onClick={() => scrollToItem(place.id)}
                    className={cn(
                      "p-6 group cursor-pointer transition-all flex gap-5 items-start relative border-l-[3px]",
                      activePlaceId === place.id ? "bg-[#FFF8F7] border-[#E8391A]" : 
                      hoveredPlaceId === place.id ? "bg-gray-50 border-[#E8391A]/30" : "bg-white border-transparent"
                    )}
                  >

                    <div 
                      className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/[0.03] transition-transform group-hover:scale-105"
                      style={{ 
                        background: `linear-gradient(135deg, ${selectedCat?.color || '#E8391A'}20, ${selectedCat?.color || '#E8391A'}05)`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: selectedCat?.color || '#E8391A' }} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[15px] font-extrabold text-[#1a1a1a] leading-tight group-hover:text-[#E8391A] transition-colors">{place.name}</h3>
                        <div className="flex items-center gap-1 shrink-0 bg-[#FF6B47]/10 px-2 py-0.5 rounded-full border border-[#FF6B47]/20">
                          <Star className="h-2.5 w-2.5 text-[#FF6B47] fill-[#FF6B47]" />
                          <span className="text-[10px] font-extrabold text-[#FF6B47]">{place.rating || '4.0'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[12px] text-[#767676] font-medium leading-normal flex items-start gap-1.5 opacity-80">
                          <MapPin className="h-3.5 w-4 text-[#767676] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{place.address}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-lg shrink-0">
                             <div className="w-1 h-1 rounded-full bg-[#E8391A]" />
                             <span className="text-[10px] font-bold text-[#484848] uppercase tracking-wider">
                               {(place.distance / 1000).toFixed(1)} km away
                             </span>
                          </div>
                          {place.open24Hours && (
                            <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-lg border border-[#22C55E]/20 shrink-0">Open 24/7</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-3">
                        {place.phone && (
                          <Button 
                            asChild
                            variant="outline" 
                            className="h-9 flex-1 bg-white border-[#EBEBEB] text-[#484848] text-[11px] font-bold rounded-xl hover:bg-gray-50 hover:border-[#DDDDDD] transition-all"
                          >
                            <a href={`tel:${place.phone}`}>
                              <Phone className="h-3.5 w-3.5 mr-2" />
                              Call Now
                            </a>
                          </Button>
                        )}
                        <Button 
                          asChild
                          className="h-9 flex-1 bg-[#1a1a1a] text-white text-[11px] font-bold rounded-xl hover:bg-black transition-all shadow-md shadow-black/10"
                        >
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`} target="_blank">
                            <Navigation className="h-3.5 w-3.5 mr-2" />
                            Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Enhanced Routing Card (Show when this place is active and has a route) */}
                  <AnimatePresence>
                    {activePlaceId === place.id && activeRoute && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 px-1 overflow-hidden"
                      >
                        <ItineraryRoute 
                           route={activeRoute} 
                           startName="Current Location" 
                           endName={place.name} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </div>
            ) : (
              <div className="p-12 text-center text-[#999] text-sm">No places found in this area.</div>
            )}
          </div>
        </div>

        {/* Right Side: Map (3fr) */}
        <div className={cn(
          "flex-1 relative h-full transition-all duration-300",
          !showMobileMap ? "hidden lg:block" : "fixed inset-0 z-20 bg-white"
        )}>
          <div className="absolute inset-0 pt-[80px] lg:pt-0">
            <InteractiveMap 
              key={`near-map-${showMobileMap ? "map" : "list"}`}
              points={mapPoints as any} 
              center={mapCenter}
              zoom={mapZoom}
              followCenter={true}
              routingLeg={null}
              multiModeRoute={activeRoute}
              onGetLocation={getLocation}
              showMultiRoute={false}
            />
          </div>

          {/* Search this area button */}
          {showSearchArea && (
            <motion.button 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              onClick={searchNearby}
              className="absolute top-24 lg:top-6 left-1/2 z-[1000] bg-white text-[#1a1a1a] px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#f0ede8] font-bold text-[13px] flex items-center gap-2.5 transition-all hover:bg-gray-50 hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] active:scale-95 group"
            >
              <Search className="h-4 w-4 text-[#E8391A] transition-transform group-hover:rotate-12" />
              Search this area
            </motion.button>
          )}
        </div>
      </div>

      {/* Floating Toggle Button (Mobile Only) */}
      <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] active:scale-95 transition-transform">
        <button
          onClick={() => setShowMobileMap(!showMobileMap)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-[#1a1a1a] text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10"
        >
          {showMobileMap ? (
            <>
              <LayoutList size={20} className="text-[#E8391A]" />
              <span className="text-[13px] font-bold tracking-tight uppercase">Show List</span>
            </>
          ) : (
            <>
              <MapIcon size={20} className="text-[#E8391A]" />
              <span className="text-[13px] font-bold tracking-tight uppercase">Show Map</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
