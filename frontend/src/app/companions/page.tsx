"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Users, UserPlus, MapPin, Calendar, Percent, Sparkles, ArrowRight, ShieldCheck, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanionMatch {
  id: string;
  name: string;
  match: string;
  destination: string;
  avatar: string;
  similarityScore: number;
  dates: string;
  interests: string[];
}

export default function Companions() {
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<CompanionMatch[]>([])
  const [isAuthorized, setIsAuthorized] = useState(true)

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const budget = (document.getElementById('budget-select') as HTMLSelectElement)?.value || "medium"
      const res = await api.post("/companion/match", {
        destination,
        travelDate: (document.querySelector('input[type="date"]') as HTMLInputElement)?.value,
        budgetRange: budget,
        interests: ""
      })
      setMatches(res.data.matches || res.data)
    } catch (err: unknown) {
      console.error("Match error:", err)
      const error = err as { response?: { status: number } }
      if (error.response?.status === 401) setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchInitial = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) { setIsAuthorized(false); return }
      try {
        const res = await api.get("/companion/matches")
        setMatches(res.data)
        setIsAuthorized(true)
      } catch (err: unknown) {
        console.error("Initial fetch error:", err)
        const error = err as { response?: { status: number } }
        if (error.response?.status === 401) setIsAuthorized(false)
      }
    }
    fetchInitial()
  }, [])

  /* ── Not signed in ────────────────────────────────────── */
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-12 text-center max-w-md w-full space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FF5A5F]/8 flex items-center justify-center mx-auto text-[#FF5A5F]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#484848] tracking-tight">Sign in required</h2>
            <p className="text-sm text-[#767676] leading-relaxed">
              You need to be signed in to find and connect with travel companions.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/login'}
            variant="premium"
            className="h-12 px-8 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97] w-full"
          >
            Sign in
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    )
  }

  /* ── Authorized view ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* ── Page header ──────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Sparkles className="h-3.5 w-3.5" />
              AI-matched
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Find travel <span className="text-[#FF5A5F]">companions</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Discover like-minded travelers heading to the same destinations as you.
          </p>
        </div>

        {/* ── Main grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Filter panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden sticky top-28">
              <div className="px-6 py-5 border-b border-[#EBEBEB]">
                <h2 className="text-base font-bold text-[#484848] tracking-tight">Search filters</h2>
                <p className="text-xs text-[#767676] mt-0.5">Find travelers matching your preferences</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleMatch} className="space-y-4">

                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
                      <Input
                        placeholder="e.g. Spiti Valley"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Travel date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Travel date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
                      <Input
                        type="date"
                        className="pl-11 h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Budget level */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] uppercase tracking-wide">Budget range</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger
                        id="budget-select"
                        className="h-12 rounded-xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] px-4 transition-all"
                      >
                        <SelectValue placeholder="Budget level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[#EBEBEB] shadow-lg bg-white">
                        <SelectItem value="low" className="text-sm font-medium text-[#484848] py-3">Budget traveler</SelectItem>
                        <SelectItem value="medium" className="text-sm font-medium text-[#484848] py-3">Mid-range</SelectItem>
                        <SelectItem value="high" className="text-sm font-medium text-[#484848] py-3">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="premium"
                    className="w-full h-12 rounded-xl text-sm font-semibold group shadow-sm transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Find companions</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Results panel */}
          <div className="lg:col-span-8 space-y-4">

            {/* Results header */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-base font-bold text-[#484848]">Travelers</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBEBEB] shadow-sm">
                <div className="h-2 w-2 rounded-full bg-[#FF5A5F] animate-pulse" />
                <span className="text-xs font-semibold text-[#767676]">{matches.length} available</span>
              </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                /* Skeleton */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-[#EBEBEB] animate-pulse border border-[#E0E0E0]" />
                  ))}
                </motion.div>
              ) : matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 5).map((match, idx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#FF5A5F]/20 transition-all duration-300 overflow-hidden group">
                        <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">

                          {/* Avatar */}
                          <Avatar className="h-14 w-14 rounded-2xl border border-[#EBEBEB] shrink-0">
                            <AvatarFallback className="text-lg font-bold bg-[#F7F7F7] text-[#484848] rounded-2xl">
                              {match.avatar}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-base font-bold text-[#484848] tracking-tight group-hover:text-[#FF5A5F] transition-colors">
                                {match.name}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-2.5 py-1 rounded-full border border-[#00A699]/15">
                                <Percent className="h-3 w-3" />
                                {match.similarityScore}% match
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-[#767676] font-medium">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-[#FF5A5F]" />
                                {match.destination}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#FF5A5F]" />
                                {match.dates}
                              </span>
                            </div>

                            {/* Interest tags */}
                            {(match.interests || []).length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {(match.interests || []).slice(0, 4).map((interest: string, k: number) => (
                                  <span
                                    key={k}
                                    className="text-[11px] font-medium text-[#767676] bg-[#F7F7F7] px-2.5 py-1 rounded-lg border border-[#EBEBEB]"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Connect button */}
                          <Button
                            variant="premium"
                            className="h-10 px-5 rounded-xl text-xs font-semibold shrink-0 group/btn transition-all active:scale-[0.97]"
                          >
                            <UserPlus className="h-4 w-4 mr-1.5" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#EBEBEB] text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] flex items-center justify-center border border-[#EBEBEB]">
                    <Users className="h-7 w-7 text-[#BBBBBB]" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-[#484848]">No companions found yet</p>
                    <p className="text-xs text-[#767676] max-w-xs">
                      Use the filters to search for travelers heading to your destination.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
