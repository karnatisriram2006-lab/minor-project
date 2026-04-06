"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import api from "@/lib/api"
import { Users, UserPlus, MapPin, Calendar, Percent, Sparkles, ArrowRight, ShieldCheck, Search, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleCompanions, Companion } from "@/data/sampleCompanions"

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
  const [showConnectModal, setShowConnectModal] = useState<Companion | null>(null)
  const [connectMsg, setConnectMsg] = useState("")
  const [sampleData] = useState<Companion[]>(sampleCompanions)
  const [featuredTravelers] = useState<CompanionMatch[]>([
    {
      id: "feat-1",
      name: "Sanya Malhotra",
      match: "98%",
      destination: "Spiti Valley",
      avatar: "SM",
      similarityScore: 98,
      dates: "June 12 - June 20",
      interests: ["Trekking", "Photography", "Camping"]
    },
    {
      id: "feat-2",
      name: "Kabir Singh",
      match: "92%",
      destination: "Goa",
      avatar: "KS",
      similarityScore: 92,
      dates: "Dec 28 - Jan 5",
      interests: ["Nightlife", "Beach", "Surfing"]
    },
    {
      id: "feat-3",
      name: "Riya Sen",
      match: "85%",
      destination: "Jaipur",
      avatar: "RS",
      similarityScore: 85,
      dates: "Oct 14 - Oct 20",
      interests: ["Culture", "History", "Food"]
    }
  ])
  const [isAuthorized, setIsAuthorized] = useState(true)
  // Messaging status for companion connections (UI feedback)
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [firebaseUser, setFirebaseUser] = useState<any>(null)
  const continueGuest = () => {
    setIsAuthorized(true)
    setMatches(featuredTravelers)
  }

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
    // Subscribe to Firebase auth state to know if user is signed in
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setFirebaseUser(u)
      setIsAuthorized(!!u)
    })

    const fetchInitial = async () => {
      if (!firebaseUser) {
        // Show guest view if not signed in
        if (matches.length === 0) setMatches(featuredTravelers)
        return
      }
      try {
        const res = await api.get("/companion/matches")
        setMatches(res.data)
        setIsAuthorized(true)
      } catch (err: unknown) {
        console.error("Initial fetch error:", err)
        const error = err as { response?: { status: number } }
        if (error.response?.status === 401) setIsAuthorized(false)
        else {
          // Fallback: show featured travelers if API fails
          setMatches(featuredTravelers)
          setIsAuthorized(true)
        }
      }
    }
    fetchInitial()
    return unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  // Helper: convert a real match into a Companion-like object for the modal
  const handleConnectFromMatch = (match: any) => {
    const name = match.name || 'Traveler'
    const initials = (name.split(' ').map((p: string) => p[0]).slice(0, 2).join('') || 'TR')
    const comp: Companion = {
      id: match.id || 'm-' + Math.random().toString(36).slice(2, 7),
      name,
      initials: initials.toUpperCase(),
      destination: match.destination || '',
      travelDates: (match.travelDates || match.dates || ''),
      budgetRange: match.budgetRange || '',
      interests: match.interests || [],
      matchScore: match.similarityScore ?? match.matchScore ?? 0,
      bio: match.bio || '',
      verified: !!match.verified
    }
    setShowConnectModal(comp)
  }

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
          <Button
            onClick={continueGuest}
            variant="ghost"
            className="h-12 px-8 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97] w-full mt-2"
          >
            Continue as Guest
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
              <h2 className="text-base font-bold text-[#484848]">
                {matches.length > 0 ? "Your Matches" : "Travelers heading your way"}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBEBEB] shadow-sm">
                <div className="h-2 w-2 rounded-full bg-[#00A699] animate-pulse" />
                <span className="text-xs font-semibold text-[#767676]">
                  {matches.length > 0 ? `${matches.length} matches` : `${sampleData.length} suggested`}
                </span>
              </div>
            </motion.div>

            {/* Sample companions — shown when no search performed */}
            {matches.length === 0 && (
              <div className="space-y-4">
                {sampleData.slice(0, 6).map((companion, idx) => (
                  <motion.div
                    key={companion.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#FF5A5F]/20 transition-all duration-300 overflow-hidden group">
                      <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <Avatar className="h-14 w-14 rounded-2xl border border-[#EBEBEB] shrink-0">
                          <AvatarFallback className="text-lg font-bold bg-[#F7F7F7] text-[#484848] rounded-2xl">
                            {companion.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-bold text-[#484848] tracking-tight group-hover:text-[#FF5A5F] transition-colors flex items-center gap-2">
                              {companion.name}
                              {companion.verified && <ShieldCheck className="h-4 w-4 text-[#00A699]" />}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-2.5 py-1 rounded-full border border-[#00A699]/15">
                              <Percent className="h-3 w-3" />
                              {companion.matchScore}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-[#767676] font-medium">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#FF5A5F]" />
                              {companion.destination}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-[#FF5A5F]" />
                              {companion.travelDates}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#767676] leading-relaxed line-clamp-1">{companion.bio}</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {companion.interests.slice(0, 4).map((interest: string, k: number) => (
                              <span key={k} className="text-[11px] font-medium text-[#767676] bg-[#F7F7F7] px-2.5 py-1 rounded-lg border border-[#EBEBEB]">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="premium"
                          onClick={() => handleConnectFromMatch(companion as any)}
                          className="h-10 px-5 rounded-xl text-xs font-semibold shrink-0 group/btn transition-all active:scale-[0.97]"
                        >
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

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
              ) : (matches.length > 0 || featuredTravelers.length > 0) ? (
                <div className="space-y-4">
                  {(matches.length > 0 ? matches : featuredTravelers).map((match, idx) => (
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
                    <p className="text-sm font-semibold text-[#484848]">No specific matches found</p>
                    <p className="text-xs text-[#767676] max-w-xs">
                      Try adjusting your destination or dates to find more travelers.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
                onClick={() => setShowConnectModal(null)}
              >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-[#EBEBEB] shadow-2xl p-8 max-w-md w-full space-y-6"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-2xl border border-[#EBEBEB]">
                  <AvatarFallback className="text-base font-bold bg-[#F7F7F7] text-[#484848] rounded-2xl">
                    {showConnectModal.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold text-[#484848]">Message {showConnectModal.name}</h3>
                  <p className="text-xs text-[#767676]">Heading to {showConnectModal.destination}</p>
                </div>
              </div>

              <textarea
                value={connectMsg}
                onChange={(e) => setConnectMsg(e.target.value)}
                placeholder={`Hi ${showConnectModal.name.split(" ")[0]}! I'm also planning a trip to ${showConnectModal.destination}...`}
                className="w-full h-32 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all p-4 resize-none"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setShowConnectModal(null); setConnectMsg("") }}
                  className="flex-1 h-12 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  variant="premium"
                  onClick={async () => {
                    // Send message via API
                    if (!connectMsg || connectMsg.trim().length < 3) {
                      // simple inline validation feedback via console and no-op if too short
                      console.warn('Message too short')
                      return
                    }
                    try {
                      setSendStatus("sending")
                      const resp = await fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ toName: showConnectModal?.name, destination: showConnectModal?.destination, message: connectMsg }),
                      })
                      if (!resp.ok) throw new Error('Failed to send')
                      setSendStatus("sent")
                      setTimeout(() => {
                        setShowConnectModal(null)
                        setConnectMsg("")
                        setSendStatus("idle")
                      }, 1000)
                    } catch {
                      setSendStatus("error")
                    }
                  }}
                  className="flex-1 h-12 rounded-xl text-sm font-semibold"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  {sendStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
