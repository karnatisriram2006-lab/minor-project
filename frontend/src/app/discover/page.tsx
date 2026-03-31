"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Heart, Sparkles, Search, SlidersHorizontal, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

interface DiscoveryItem {
  id?: string;
  name: string;
  image?: string;
  type?: string;
  rating?: string;
  location?: string;
  description?: string;
  price?: string | number;
}

export default function Discover() {
  const [city, setCity] = useState("Goa")
  const [tempCity, setTempCity] = useState("Goa")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("hostels")
  const [items, setItems] = useState<DiscoveryItem[]>([])

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      let endpoint = activeTab
      if (activeTab === "hostels") endpoint = "discover/hostels"
      else if (activeTab === "restaurants") endpoint = "discover/restaurants"
      else if (activeTab === "popular") endpoint = "discover/popular"

      const { data } = await api.get(`${endpoint}${activeTab !== "popular" ? `?city=${city}` : ""}`)

      if (activeTab === "popular") {
        setItems(data.places || [])
      } else {
        setItems(data[activeTab] || [])
      }
    } catch (err) {
      console.error("Discovery search error:", err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, city])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-0 pb-24 sm:pt-4 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
                <Sparkles className="h-3.5 w-3.5" />
                AI-curated
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
              Discover <span className="text-[#FF5A5F]">{city}</span>
            </h1>
            <p className="text-[#767676] text-base leading-relaxed">
              Hostels, restaurants and must-see spots — all in one place.
            </p>
          </div>

          {/* City search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
              <Input
                className="h-11 pl-10 pr-4 rounded-xl bg-white border-[#EBEBEB] shadow-sm focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all"
                placeholder="Search a city..."
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCity(tempCity)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-[#EBEBEB] bg-white shadow-sm hover:bg-[#F7F7F7] transition-all"
              onClick={() => setCity(tempCity)}
            >
              <SlidersHorizontal className="h-4 w-4 text-[#484848]" />
            </Button>
          </div>
        </div>

        {/* ── Tabs + Grid ──────────────────────────────────── */}
        <Tabs defaultValue="hostels" className="w-full flex flex-col" onValueChange={setActiveTab}>
          <div className="w-full overflow-hidden mb-6">
            <TabsList className="bg-white border border-[#EBEBEB] shadow-sm p-1 h-auto rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="popular"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#767676] data-[state=active]:bg-[#484848] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all shrink-0"
              >
                Popular
              </TabsTrigger>
              <TabsTrigger
                value="hostels"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#767676] data-[state=active]:bg-[#484848] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all shrink-0"
              >
                Stays
              </TabsTrigger>
              <TabsTrigger
                value="restaurants"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#767676] data-[state=active]:bg-[#484848] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all shrink-0"
              >
                Restaurants
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#767676] data-[state=active]:bg-[#FF5A5F] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Picks
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {loading ? (
                /* Skeleton cards */
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[4/5] rounded-2xl bg-[#EBEBEB] animate-pulse" />
                  ))}
                </motion.div>
              ) : activeTab === "ai" ? (
                /* AI curator panel */
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-10 text-center space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF5A5F]/8 flex items-center justify-center mx-auto">
                      <Sparkles className="h-7 w-7 text-[#FF5A5F]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-[#484848] tracking-tight">AI recommendations</h3>
                      <p className="text-sm text-[#767676] leading-relaxed max-w-md mx-auto">
                        Tell us what you&apos;re looking for and we&apos;ll suggest the best spots in {city}.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. cozy cafes, heritage temples, night markets..."
                        className="flex-1 h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all px-4"
                        id="pref-input"
                      />
                      <Button
                        variant="premium"
                        className="h-12 px-5 rounded-xl text-sm font-semibold shrink-0 transition-all active:scale-[0.97]"
                        onClick={async () => {
                          setLoading(true)
                          const prefInput = document.getElementById('pref-input') as HTMLInputElement
                          const pref = prefInput?.value
                          try {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
                            const res = await fetch(`${apiUrl}/ai/recommend`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ preferences: pref, location: city })
                            })
                            const data = await res.json()
                            setItems(((data.recommendations || []) as { name: string; reason: string; popularity: string }[]).map((r) => ({
                              name: r.name,
                              description: r.reason,
                              type: r.popularity,
                              location: city,
                              price: "N/A"
                            })))
                            setActiveTab("results")
                          } catch (e) {
                            console.error(e)
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Cards grid */
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {items.slice(0, 6).map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="group cursor-pointer"
                      >
                        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

                          {/* Image */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                              src={item.image || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800`}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Favourite */}
                            <button className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-[#484848] hover:text-[#FF5A5F] transition-colors active:scale-95 z-10">
                              <Heart className="h-4 w-4" />
                            </button>
                            {/* Type badge */}
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#484848] px-2.5 py-1 rounded-lg shadow-sm">
                              {item.type || (activeTab === "hostels" ? "Stay" : "Restaurant")}
                            </div>
                          </div>

                          {/* Card body */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-[#484848] leading-tight group-hover:text-[#FF5A5F] transition-colors">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-1 shrink-0">
                                <Star className="h-3.5 w-3.5 fill-[#484848] text-[#484848]" />
                                <span className="text-xs font-bold text-[#484848]">{item.rating || "4.9"}</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#767676] line-clamp-2 leading-relaxed">
                              {item.description || `A great spot for your stay in ${city}`}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-sm font-bold text-[#484848]">
                                ₹{item.price || (activeTab === "hostels" ? "4,500" : "2,200")}
                                <span className="text-xs font-normal text-[#767676] ml-1">/ night</span>
                              </span>
                              <Button
                                variant="premium"
                                className="h-8 px-4 rounded-lg text-xs font-semibold group/btn transition-all active:scale-[0.97]"
                              >
                                View
                                <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {items.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#EBEBEB] text-center space-y-4">
                      <Search className="h-8 w-8 text-[#BBBBBB]" />
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-[#484848]">No results found</p>
                        <p className="text-xs text-[#767676]">Try searching for a different city.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>

        {/* ── CTA strip ────────────────────────────────────── */}
        <div className="bg-[#484848] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-white">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold tracking-tight">Ready to start planning?</h3>
            <p className="text-sm text-white/60">Turn your discoveries into a complete AI itinerary.</p>
          </div>
          <Link href="/trip-planner">
            <Button
              variant="premium"
              className="h-11 px-6 rounded-xl text-sm font-semibold shrink-0 group transition-all active:scale-[0.97] bg-white text-[#484848] hover:bg-[#F7F7F7]"
            >
              Plan my trip
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-[#FF5A5F]" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
