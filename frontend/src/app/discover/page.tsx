"use client"

import { useState, useMemo } from "react"
import { Star, Heart, Sparkles, Search, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { places, Place } from "@/data/places"

const CITIES = ["Goa", "Jaipur", "Kerala", "Ladakh", "Varanasi"]
const AVAILABLE_CITIES = ["Goa", "Jaipur", "Kerala"]

const TAB_MAP: Record<string, Place["category"] | "all"> = {
  popular: "all",
  stays: "hotel",
  restaurants: "restaurant",
  ai_picks: "all",
}

function PlaceCard({ place, idx }: { place: Place; idx: number }) {
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
    >
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#FF5A5F]/20 transition-all duration-300 overflow-hidden group cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-90"
          >
            <Heart className={`h-4 w-4 ${liked ? 'text-[#FF5A5F] fill-[#FF5A5F]' : 'text-[#767676]'}`} />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
              {place.category}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#484848] tracking-tight group-hover:text-[#FF5A5F] transition-colors line-clamp-1">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#484848]">{place.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#767676]">
            <MapPin className="h-3.5 w-3.5 text-[#FF5A5F] shrink-0" />
            <span className="line-clamp-1">{place.city}</span>
          </div>

          <p className="text-[11px] text-[#767676] leading-relaxed line-clamp-2">
            {place.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#EBEBEB]">
            <span className="text-[11px] font-bold text-[#00A699]">{place.priceRange}</span>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-semibold text-[#FF5A5F] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/8">
              View details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState("popular")
  const [searchCity, setSearchCity] = useState("Goa")

  const filteredPlaces = useMemo(() => {
    let filtered = places.filter(p => p.city === searchCity)

    const tabFilter = TAB_MAP[activeTab]
    if (tabFilter && tabFilter !== "all") {
      filtered = filtered.filter(p => p.category === tabFilter)
    }

    if (activeTab === "popular") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (activeTab === "ai_picks") {
      // Top 4 across categories
      const categories = new Set(filtered.map(p => p.category))
      const picks: Place[] = []
      for (const cat of categories) {
        const best = filtered.filter(p => p.category === cat).sort((a, b) => b.rating - a.rating)[0]
        if (best) picks.push(best)
      }
      return picks.sort((a, b) => b.rating - a.rating).slice(0, 4)
    }

    return filtered
  }, [searchCity, activeTab])

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Sparkles className="h-3.5 w-3.5" />
              Curated
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Discover <span className="text-[#FF5A5F]">{searchCity}</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Handpicked stays, restaurants, and must-see spots — all in one place.
          </p>
        </div>

        {/* City switcher pills */}
        <div className="flex flex-wrap gap-2">
          {CITIES.map(city => {
            const active = city === searchCity
            const available = AVAILABLE_CITIES.includes(city)
            return (
              <button
                key={city}
                onClick={() => available && setSearchCity(city)}
                disabled={!available}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                  active
                    ? "bg-[#FF5A5F] text-white shadow-sm"
                    : available
                    ? "bg-white border border-[#EBEBEB] text-[#767676] hover:border-[#FF5A5F]/30 hover:text-[#484848]"
                    : "bg-[#EBEBEB]/50 text-[#BBBBBB] cursor-not-allowed"
                }`}
              >
                {city}
                {!available && <span className="ml-1 text-[9px] opacity-60">Soon</span>}
              </button>
            )
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-[#EBEBEB] rounded-xl p-1 h-12">
            <TabsTrigger value="popular" className="rounded-lg data-[state=active]:bg-[#FF5A5F] data-[state=active]:text-white">Popular</TabsTrigger>
            <TabsTrigger value="stays" className="rounded-lg data-[state=active]:bg-[#FF5A5F] data-[state=active]:text-white">Stays</TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-lg data-[state=active]:bg-[#FF5A5F] data-[state=active]:text-white">Restaurants</TabsTrigger>
            <TabsTrigger value="ai_picks" className="rounded-lg data-[state=active]:bg-[#FF5A5F] data-[state=active]:text-white">AI Picks</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        <AnimatePresence mode="popLayout">
          {filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlaces.map((place, idx) => (
                <PlaceCard key={place.id} place={place} idx={idx} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#EBEBEB] text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] flex items-center justify-center border border-[#EBEBEB]">
                <Search className="h-7 w-7 text-[#BBBBBB]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#484848]">No results for this category</p>
                <p className="text-xs text-[#767676] max-w-xs">
                  Try switching tabs or selecting a different city.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
