"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Clock, Star, Navigation, Shield, Hospital, Utensils, Building2, Landmark, Flame, Pill, Wallet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIES = [
  { value: "hospital", label: "Hospitals", icon: Hospital, color: "#FF5A5F" },
  { value: "police", label: "Police", icon: Shield, color: "#00A699" },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, color: "#8B5CF6" },
  { value: "atm", label: "ATMs", icon: Wallet, color: "#F59E0B" },
  { value: "restaurant", label: "Restaurants", icon: Utensils, color: "#EF4444" },
  { value: "hostel", label: "Hostels", icon: Building2, color: "#3B82F6" },
  { value: "tourist-info", label: "Tourist Info", icon: Landmark, color: "#10B981" },
  { value: "fire-station", label: "Fire Station", icon: Flame, color: "#F97316" },
  { value: "embassy", label: "Embassy", icon: Landmark, color: "#6366F1" },
  { value: "general", label: "All Nearby", icon: MapPin, color: "#484848" },
]

interface NearbyPlace {
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
}

export default function NearMe() {
  const [category, setCategory] = useState("hospital")
  const [radius, setRadius] = useState("5000")
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState("")

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setError("")
      },
      () => {
        setError("Location access denied. Please enable location services.")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  const searchNearby = async () => {
    if (!userLoc) {
      setError("Please enable location access first")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/nearby?lat=${userLoc.lat}&lng=${userLoc.lng}&category=${category}&radius=${radius}`
      )
      const data = await res.json()
      setPlaces(data.places || [])
    } catch (err) {
      setError("Failed to fetch nearby places. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userLoc) searchNearby()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, userLoc])

  const selectedCat = CATEGORIES.find(c => c.value === category)
  const Icon = selectedCat?.icon || MapPin

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Navigation className="h-3.5 w-3.5" />
              AI-Powered
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Nearby <span className="text-[#FF5A5F]">{selectedCat?.label}</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Find essential services and places around your current location, powered by AI.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] transition-all">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EBEBEB] shadow-lg bg-white">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-sm font-medium text-[#484848]">
                      <span className="flex items-center gap-2"><cat.icon className="h-4 w-4" />{cat.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Radius */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Search Radius</Label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] transition-all">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EBEBEB] shadow-lg bg-white">
                  <SelectItem value="2000">2 km</SelectItem>
                  <SelectItem value="5000">5 km</SelectItem>
                  <SelectItem value="10000">10 km</SelectItem>
                  <SelectItem value="20000">20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Status + Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Location</Label>
              <div className="flex gap-2">
                <Button
                  onClick={getLocation}
                  variant="outline"
                  className="h-12 rounded-xl text-xs font-semibold flex-1"
                >
                  <Navigation className="h-4 w-4 mr-1.5" />
                  {userLoc ? "Update" : "Detect"}
                </Button>
                <Button
                  onClick={searchNearby}
                  variant="premium"
                  disabled={loading || !userLoc}
                  className="h-12 rounded-xl text-xs font-semibold flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4" />
                      <span>Search</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Location display */}
          {userLoc && (
            <p className="text-[11px] text-[#767676] font-mono">
              📍 {userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}
            </p>
          )}
          {error && (
            <p className="text-xs text-[#FF5A5F] font-medium">{error}</p>
          )}
        </div>

        {/* Results */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-[#EBEBEB] animate-pulse border border-[#E0E0E0]" />
              ))}
            </motion.div>
          ) : places.length > 0 ? (
            <div className="space-y-4">
              {places.map((place, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#FF5A5F]/20 transition-all duration-300 overflow-hidden group">
                    <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      {/* Icon */}
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${selectedCat?.color || '#484848'}15` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: selectedCat?.color || '#484848' }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-bold text-[#484848] tracking-tight group-hover:text-[#FF5A5F] transition-colors">
                            {place.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-2.5 py-1 rounded-full border border-[#00A699]/15">
                            <Star className="h-3 w-3" />
                            {place.rating}
                          </span>
                          {place.open24Hours && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#10B981]/8 px-2.5 py-1 rounded-full border border-[#10B981]/15">
                              <Clock className="h-3 w-3" />
                              24/7
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-[#767676] font-medium">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#FF5A5F]" />
                            {place.address}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Navigation className="h-3.5 w-3.5 text-[#FF5A5F]" />
                            {(place.distance / 1000).toFixed(1)} km away
                          </span>
                        </div>

                        {place.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[#767676] font-medium">
                            <Phone className="h-3.5 w-3.5 text-[#FF5A5F]" />
                            {place.phone}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {place.phone && (
                          <a href={`tel:${place.phone}`} className="inline-block">
                            <Button variant="premium" className="h-10 px-5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]">
                              <Phone className="h-4 w-4 mr-1.5" />
                              Call
                            </Button>
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button variant="outline" className="h-10 px-5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]">
                            <Navigation className="h-4 w-4 mr-1.5" />
                            Directions
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#EBEBEB] text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] flex items-center justify-center border border-[#EBEBEB]">
                <MapPin className="h-7 w-7 text-[#BBBBBB]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#484848]">No places found</p>
                <p className="text-xs text-[#767676] max-w-xs">
                  Try increasing the search radius or selecting a different category.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
