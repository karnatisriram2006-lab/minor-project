"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  Calendar,
  MapPin,
  Clock,
  Navigation,
  Compass,
  Wallet,
  MoreVertical,
  Maximize2,
  Info,
  Sparkles,
  ChevronRight,
  Search,
  Users,
  LayoutDashboard,
  List
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F7F7F7] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#FF5A5F] border-t-transparent animate-spin" style={{ animationDuration: '0.6s' }} />
    </div>
  ),
})

interface ItineraryStop {
  name: string;
  type?: string;
  description?: string;
  time?: string;
  lat: number;
  lng: number;
  status?: string;
}

type ItineraryType = Record<string, ItineraryStop[]>

export default function TripPlanner() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null)
  const [formData, setFormData] = useState({
    city: "Jaipur",
    days: "3",
    interests: "Culture, History, Food",
    budget: "Luxury"
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${apiUrl}/ai/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("API Response Error")

      const data = await res.json()
      setItinerary(data.itinerary || data)
    } catch (err) {
      console.error("[Curation Error]", err)

      const dynamicMock: ItineraryType = {}
      const dayCount = parseInt(formData.days) || 3
      const baseLat = formData.city.toLowerCase().includes("agra") ? 27.1751 : 26.9124
      const baseLng = formData.city.toLowerCase().includes("agra") ? 78.0421 : 75.7873

      for (let i = 1; i <= dayCount; i++) {
        dynamicMock[`Day ${i}`] = [
          {
            time: "09:00",
            name: `${formData.city} Heritage Discovery ${i}`,
            type: "Cultural",
            description: `AI curated sequence for ${formData.interests} in ${formData.city}. Exploring local heritage sites.`,
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1,
            status: "Suggested"
          },
          {
            time: "14:00",
            name: `Local Experience ${i}`,
            type: "Experiential",
            description: `A curated local experience tailored to your interest in ${formData.interests}.`,
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1
          }
        ]
      }
      setItinerary(dynamicMock)
    } finally {
      setLoading(false)
    }
  }

  const mapPoints = useMemo(() => {
    if (!itinerary) return []
    return Object.values(itinerary).flatMap((day: ItineraryStop[]) =>
      day.map((act: ItineraryStop) => ({
        id: act.name,
        name: act.name,
        lat: Number(act.lat) || 26.9124,
        lng: Number(act.lng) || 75.7873,
        description: act.description || ""
      }))
    )
  }, [itinerary])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-[#484848]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="h-16 border-b border-[#EBEBEB] bg-white px-8 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#484848] tracking-tight">Trip Planner</h2>
          <div className="h-5 w-px bg-[#EBEBEB]" />
          <span className="text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
            AI-powered
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <Avatar key={i} className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-[#F7F7F7] text-[#767676] text-xs font-semibold">U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button
            variant="premium"
            size="sm"
            className="px-5 h-9 text-[12px] font-semibold tracking-tight rounded-lg shadow-sm transition-all active:scale-[0.97]"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Invite friends
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative min-h-0">

        {/* ── Left Panel (List View) ───────────────────────────────── */}
        <div className={cn(
          "w-full lg:w-[420px] xl:w-[480px] bg-white border-r border-[#EBEBEB] flex flex-col z-10 overflow-y-auto",
          viewMode === "map" ? "hidden lg:flex" : "flex"
        )}>
          {!itinerary ? (
            <div className="flex flex-col p-8 pt-0 sm:p-10 space-y-8">

              {/* Form heading */}
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-3xl font-bold text-[#484848] tracking-tight leading-tight"
                >
                  Plan your trip to{" "}
                  <span className="text-[#FF5A5F]">{formData.city || "India"}.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm text-[#767676] leading-relaxed"
                >
                  Tell us where you&apos;re headed — we&apos;ll build a personalized day-by-day itinerary.
                </motion.p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">

                {/* Destination */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide ml-1">
                    Destination
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF5A5F]" />
                    <input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white h-14 rounded-xl pl-11 pr-4 font-medium text-[15px] text-[#484848] border border-[#DDDDDD] focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all placeholder:text-[#BBBBBB]"
                      placeholder="City or region, e.g. Jaipur"
                    />
                  </div>
                </div>

                {/* Days + Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide ml-1">
                      Duration
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
                      <input
                        type="number"
                        min="1"
                        max="21"
                        value={formData.days}
                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                        className="w-full bg-white h-14 rounded-xl pl-11 pr-4 font-medium text-[15px] text-[#484848] border border-[#DDDDDD] focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide ml-1">
                      Budget
                    </Label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-white h-14 rounded-xl pl-11 pr-10 font-medium text-[15px] text-[#484848] border border-[#DDDDDD] focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all appearance-none cursor-pointer"
                      >
                        <option>Economy</option>
                        <option>Classic</option>
                        <option>Luxury</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676] pointer-events-none rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide ml-1">
                    Interests
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
                    <input
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      className="w-full bg-white h-14 rounded-xl pl-11 pr-4 font-medium text-[15px] text-[#484848] border border-[#DDDDDD] focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all placeholder:text-[#BBBBBB]"
                      placeholder="Culture, Food, History..."
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="premium"
                  className="w-full h-14 rounded-xl text-[14px] font-semibold tracking-tight shadow-sm transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating itinerary...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      <span>Plan my trip</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Info note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                <Info className="h-4 w-4 text-[#767676] shrink-0 mt-0.5" />
                <p className="text-xs text-[#767676] leading-relaxed">
                  AI-powered itineraries are personalized based on your destination, trip duration, and interests.
                </p>
              </div>
            </div>

          ) : (

            /* ── Itinerary View ─────────────────────────────── */
            <div className="flex flex-col h-full bg-white">
              <div className="px-6 py-4 border-b border-[#EBEBEB] shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-[#484848] tracking-tight">Your Itinerary</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItinerary(null)}
                    className="text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] rounded-xl h-9 w-9 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF5A5F] animate-pulse" />
                  <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider">{formData.city}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                {Object.entries(itinerary).map(([day, activities]: [string, ItineraryStop[]], idx) => (
                  <div key={day} className="relative pl-10 border-l-2 border-[#EBEBEB]">
                    {/* Day badge */}
                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center z-10 font-bold text-xs shadow-sm">
                      {idx + 1}
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-[#767676] mb-4 ml-1">{day}</p>

                    <div className="space-y-3">
                      {activities.map((act: ItineraryStop, aIdx: number) => (
                        <motion.div
                          key={aIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: aIdx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-white border border-[#EBEBEB] rounded-2xl p-4 hover:shadow-md hover:border-[#FF5A5F]/20 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-[#FF5A5F]">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">{act.time}</span>
                            </div>
                            {act.status && (
                              <span className="text-[10px] font-semibold text-[#00A699] bg-[#00A699]/8 px-2.5 py-0.5 rounded-full border border-[#00A699]/15">
                                {act.status}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[15px] font-semibold text-[#484848] group-hover:text-[#FF5A5F] transition-colors leading-snug mb-1">{act.name}</h3>
                          <p className="text-xs text-[#767676] leading-relaxed line-clamp-2">{act.description}</p>

                          <div className="mt-3 flex items-center justify-between border-t border-[#F7F7F7] pt-2.5">
                            <span className="text-[10px] font-semibold text-[#484848]/40 uppercase tracking-wider">{act.type}</span>
                            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-[#BBBBBB] group-hover:text-[#767676] transition-colors hover:bg-[#F7F7F7]">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-[#EBEBEB] shrink-0">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-[#DDDDDD] text-[#484848] hover:bg-[#F7F7F7] font-semibold text-sm transition-all active:scale-[0.98]"
                >
                  Export as PDF
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Map Area (Map View) ─────────────────────────────────── */}
        <div className={cn(
          "flex-1 h-full bg-[#F7F7F7] relative overflow-hidden transition-all duration-500",
          viewMode === "list" ? "hidden lg:block" : "block"
        )}>
          <div className="absolute inset-0 z-0">
            <InteractiveMap points={mapPoints} />
          </div>

          {/* Map top-right overlay */}
          <div className="absolute top-4 right-4 z-20 space-y-2">
            <div className="bg-white p-4 rounded-2xl border border-[#EBEBEB] shadow-md flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#484848] flex items-center justify-center text-white shadow-sm">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#767676] uppercase tracking-wider mb-0.5">Focus Point</p>
                <p className="text-base font-bold text-[#484848] leading-none">{formData.city}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white w-10 h-10 rounded-xl border border-[#EBEBEB] shadow-sm text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] transition-all active:scale-95"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white w-10 h-10 rounded-xl border border-[#EBEBEB] shadow-sm text-[#767676] hover:text-[#484848] hover:bg-[#F7F7F7] transition-all active:scale-95"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Empty state overlay */}
          {!itinerary && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/85 backdrop-blur-xl p-10 rounded-3xl border border-[#EBEBEB] shadow-lg flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border-4 border-[#EBEBEB] flex items-center justify-center mb-6 relative">
                  <div className="w-10 h-10 rounded-full border-[3px] border-[#FF5A5F] border-t-transparent animate-spin" style={{ animationDuration: '0.7s' }} />
                </div>
                <h3 className="text-lg font-semibold text-[#484848]/50 tracking-tight">Awaiting your coordinates</h3>
                <div className="mt-3 flex gap-2">
                  <div className="h-1 w-10 rounded-full bg-[#EBEBEB]" />
                  <div className="h-1 w-5 rounded-full bg-[#FF5A5F]/30" />
                  <div className="h-1 w-10 rounded-full bg-[#EBEBEB]" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Sparkles hint */}
          {!itinerary && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-white border border-[#EBEBEB] shadow-sm px-4 py-2 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-[#FF5A5F]" />
                <span className="text-xs font-semibold text-[#767676]">Fill in the form to generate your itinerary</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile View Toggle ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[150]">
        <Button
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          variant="premium"
          className="h-12 px-6 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white min-w-[140px] whitespace-nowrap"
        >
          {viewMode === "list" ? (
            <>
              <Navigation className="h-4 w-4" />
              <span>Show Map</span>
            </>
          ) : (
            <>
              <List className="h-4 w-4" />
              <span>Show List</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function LayoutGrid({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
