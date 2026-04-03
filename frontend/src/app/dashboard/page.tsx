"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Sparkles,
  Clock,
  Send,
  Route,
  Wallet,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle2,
  Calculator
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import { WeatherCard } from "@/components/WeatherCard"
import { PlacesExplorer } from "@/components/PlacesExplorer"
import { useWeather } from "@/hooks/useWeather"
import { geocodeCity } from "@/lib/geocodingService"

import { auth } from "@/lib/firebase"
import { User as FirebaseUser } from "firebase/auth"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
  translation?: string
  isTranslating?: boolean
  showTranslation?: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const { weather, loading: weatherLoading, getWeather } = useWeather()

  useEffect(() => {
    const fetchTrips = async (currentUser: FirebaseUser) => {
      try {
        const { data } = await api.get("/trips")
        const userTrips = data.trips || []
        setTrips(userTrips)
        
        if (userTrips.length > 0) {
          const first = userTrips[0]
          const cityName = first.city || first.destination
          if (cityName) {
            getWeather(cityName)
            geocodeCity(cityName).then(res => {
              if (res) setCoords({ lat: res.lat, lng: res.lng })
            })
          }
        }
      } catch (err) {
        console.error("Error fetching trips:", err)
      } finally {
        setLoadingTrips(false)
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await fetchTrips(currentUser)
      } else {
        setLoadingTrips(false)
      }
    })

    // Refresh trips when window regains focus (e.g., after saving a trip)
    const onFocus = () => {
      if (auth.currentUser) {
        fetchTrips(auth.currentUser)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      unsubscribe()
      window.removeEventListener('focus', onFocus)
    }
  }, [getWeather])

  const displayName = user?.displayName?.split(" ")[0] || "Traveler"

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Namaste! I'm your YĀTRĀ assistant. How can I help you explore India today?",
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useEffect(() => {
     const el = document.getElementById('dashboard-chat-scroll');
     if (el) el.scrollTop = el.scrollHeight;
  }, [messages])

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input
    if (!text.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const { data } = await api.post("/ai/chat", { message: text })
      setMessages(prev => [...prev, { role: "bot", content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I am having trouble connecting. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTranslation = async (index: number) => {
    const msg = messages[index]
    if (msg.role !== "bot") return

    if (msg.translation) {
      const newMessages = [...messages]
      newMessages[index] = { ...msg, showTranslation: !msg.showTranslation }
      setMessages(newMessages)
      return
    }

    const newMessages = [...messages]
    newMessages[index] = { ...msg, isTranslating: true }
    setMessages(newMessages)

    try {
      const { data } = await api.post("/ai/translate", { text: msg.content, lang: "Marathi" })
      const updatedMessages = [...messages]
      updatedMessages[index] = { 
        ...msg, 
        translation: data.translation, 
        showTranslation: true, 
        isTranslating: false 
      }
      setMessages(updatedMessages)
    } catch (err) {
      console.error(err)
      const errorMessages = [...messages]
      errorMessages[index] = { ...msg, isTranslating: false }
      setMessages(errorMessages)
    }
  }

  const quickActions = [
    { label: "Plan a trip", href: "/trip-planner", icon: <Sparkles className="h-4 w-4" />, color: "#FF5A5F" },
    { label: "Find companions", href: "/companions", icon: <Users className="h-4 w-4" />, color: "#00A699" },
    { label: "Cost Estimator", href: "/cost-estimator", icon: <Calculator className="h-4 w-4" />, color: "#484848" },
    { label: "Budget planner", href: "/budget", icon: <Wallet className="h-4 w-4" />, color: "#FC642D" },
  ]

  const latestTrip = trips[0] || null
  
  // Convert budget to number if it's a string
  const budgetValue = useMemo(() => {
    if (!latestTrip) return 0
    const b = latestTrip.budget
    
    // Handle numeric strings like "24000"
    if (typeof b === 'string' && b) {
      const parsed = parseInt(b.replace(/[^0-9]/g, ''))
      if (!isNaN(parsed) && parsed > 0) return parsed
      
      const lower = b.toLowerCase()
      if (lower.includes('luxury') || lower === 'high') return 24000
      if (lower.includes('classic') || lower.includes('mid') || lower === 'medium') return 12000
      if (lower.includes('economy') || lower.includes('budget') || lower === 'low') return 6000
    }
    if (typeof b === 'number' && b > 0) return b
    
    return 12000
  }, [latestTrip])
  
  // Build itinerary from real trip data or show empty state
  const itinerary = latestTrip?.days?.[0]?.activities?.map((act: any, i: number) => ({
    time: act.time || `${9 + i * 3}:00`,
    title: act.name || "Activity",
    done: false
  })) || [
    { time: "--:--", title: "No activities planned yet", done: false },
  ]

  const tripLocation = latestTrip?.destination || latestTrip?.city || "Discovery Mode"
  const tripDate = latestTrip?.createdAt 
    ? new Date(latestTrip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : "No upcoming trip"

  const nearbyCompanions = [
    { name: "Aditi Rao", status: "Heading to Jaipur tomorrow", match: "98%", avatar: "AR" },
    { name: "Rohan Mehta", status: "Currently at Amer Fort", match: "85%", avatar: "RM" },
    { name: "Sana Khan", status: "Exploring Yoga retreats", match: "72%", avatar: "SK" },
  ]

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-7xl space-y-8">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-xs font-semibold text-[#767676] uppercase tracking-widest">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#484848] tracking-tight">
              Good morning, <span className="text-[#FF5A5F]">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-[#767676]">Your next adventure awaits. Here&apos;s your travel overview.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[#EBEBEB] shadow-sm self-start sm:self-auto"
          >
            <div className="w-2 h-2 rounded-full bg-[#00A699] animate-pulse" />
            <span className="text-xs font-semibold text-[#767676]">
              {latestTrip ? `${latestTrip.destination || latestTrip.city} • Active` : "Exploring India"}
            </span>
          </motion.div>
        </div>

        {/* ── Quick actions ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={action.href}>
                <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}14`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#484848] group-hover:text-[#FF5A5F] transition-colors">{action.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Main grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left: AI Chat */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="xl:col-span-7 space-y-5"
          >
            {/* Chat panel */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden flex flex-col" style={{ height: '480px' }}>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-[#EBEBEB] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#FF5A5F]" style={{ backgroundColor: 'rgba(255,90,95,0.08)' }}>
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#484848]">AI Travel Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00A699]" />
                    <span className="text-[11px] text-[#767676] font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div id="dashboard-chat-scroll" className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
                  >
                    <div className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative",
                      msg.role === 'user'
                        ? "rounded-tr-sm text-white"
                        : "rounded-tl-sm border border-[#EBEBEB] text-[#484848] bg-[#F7F7F7]"
                    )} style={msg.role === 'user' ? { backgroundColor: '#484848' } : {}}>
                      {msg.showTranslation ? msg.translation : msg.content}
                      
                      {msg.role === 'bot' && (
                        <div className="mt-2 pt-2 border-t border-[#EBEBEB]">
                          <button
                            onClick={() => toggleTranslation(idx)}
                            disabled={msg.isTranslating}
                            className={cn(
                              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                              msg.showTranslation ? "text-[#FF385C]" : "text-[#00A699]"
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              msg.isTranslating ? "animate-spin border-t-transparent border-current bg-transparent border-[1.5px]" : (msg.showTranslation ? "bg-[#FF385C]" : "bg-[#00A699]")
                            )} />
                            {msg.isTranslating ? "Translating..." : (msg.showTranslation ? "Show English" : "Marathi translation available")}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex flex-col items-start gap-2">
                    <div className="px-4 py-3 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-1.5 rounded-tl-none">
                      <div className="w-1 h-1 rounded-full bg-[#FF5A5F] animate-bounce" />
                      <div className="w-1 h-1 rounded-full bg-[#FF5A5F] animate-bounce delay-100" />
                      <div className="w-1 h-1 rounded-full bg-[#FF5A5F] animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="px-5 py-2 flex flex-wrap gap-1.5 border-t border-[#EBEBEB]/50 bg-white">
                {["History", "Architecture", "Culture"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-bold text-[#767676] bg-[#F7F7F7] px-2.5 py-1 rounded-lg border border-[#EBEBEB] hover:bg-gray-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-[#EBEBEB] flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about your trip..."
                  className="flex-1 bg-[#F7F7F7] h-11 rounded-xl px-4 text-sm font-medium text-[#484848] border border-[#EBEBEB] focus:outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10 transition-all placeholder:text-[#BBBBBB]"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  variant="premium"
                  className="h-11 w-11 rounded-xl shrink-0 transition-all active:scale-95 p-0 flex items-center justify-center shadow-sm disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Budget card */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}>
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#484848]">Budget</h4>
                    <p className="text-xs text-[#767676]">Trip spending</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold text-[#484848]">
                      {budgetValue > 0 ? `₹${budgetValue.toLocaleString('en-IN')}` : "₹0"}
                    </span>
                    <span className="text-xs font-semibold text-[#00A699] bg-[#00A699]/8 px-2 py-0.5 rounded-full">On track</span>
                  </div>
                  <div className="w-full h-2 bg-[#F7F7F7] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: latestTrip ? "35%" : "0%" }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#FF5A5F' }}
                    />
                  </div>
                  <p className="text-xs text-[#767676]">
                    {latestTrip ? "35% of budget used" : "No active spending"}
                  </p>
                </div>
              </div>

              {/* Route card */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(72,72,72,0.08)', color: '#484848' }}>
                    <Route className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#484848]">Itinerary</h4>
                    <p className="text-xs text-[#767676]">Today&apos;s progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { label: "Transit", val: "40%", color: "#FF5A5F" },
                    { label: "Rest", val: "35%", color: "#00A699" },
                    { label: "Explore", val: "25%", color: "#484848" }
                  ].map(item => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-[11px] font-medium text-[#767676]">{item.label}</p>
                      <p className="text-sm font-bold text-[#484848]">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right sidebar */}
          <div className="xl:col-span-5 flex flex-col gap-6">

            {/* Live Weather Status */}
            <AnimatePresence mode="wait">
              {(weather || weatherLoading) && (
                <WeatherCard 
                  data={weather} 
                  city={trips[0]?.city || "Current Location"} 
                  loading={weatherLoading} 
                />
              )}
            </AnimatePresence>

            {/* Nearby travelers */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#484848]">Nearby travelers</h3>
                  <p className="text-xs text-[#767676] mt-0.5">Matched by destination & dates</p>
                </div>
                <Link href="/companions">
                  <Button variant="ghost" className="h-8 px-3 text-xs font-semibold text-[#FF5A5F] hover:bg-[#FF5A5F]/5 rounded-lg transition-colors">
                    See all <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {nearbyCompanions.map((companion: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-pointer group">
                    <Avatar className="h-10 w-10 border border-[#EBEBEB] rounded-xl shrink-0">
                      <AvatarFallback className="bg-[#F7F7F7] text-[#484848] font-bold text-xs rounded-xl">
                        {companion.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#484848] group-hover:text-[#FF5A5F] transition-colors truncate">{companion.name}</p>
                      <p className="text-xs text-[#767676] truncate mt-0.5">{companion.status}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-2 py-0.5 rounded-full border border-[#00A699]/15 shrink-0">
                      {companion.match}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Today's itinerary */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#484848]">Today — {tripDate}</h3>
                  <p className="text-xs text-[#767676] mt-0.5">{tripLocation}</p>
                </div>
                <MapPin className="h-4 w-4 text-[#FF5A5F]" />
              </div>

              <div className="space-y-1">
                {itinerary.map((item: any, i: number) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors",
                    item.done ? "opacity-50" : "hover:bg-[#F7F7F7]"
                  )}>
                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", item.done ? "text-[#00A699]" : "text-[#DDDDDD]")} />
                    <span className="text-xs font-medium text-[#767676] w-10 shrink-0">{item.time}</span>
                    <span className={cn("text-sm font-medium flex-1", item.done ? "line-through text-[#767676]" : "text-[#484848]")}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Place image card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-sm relative group cursor-pointer"
              style={{ height: '160px' }}
            >
              <Image
                src={latestTrip ? "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&auto=format&fit=crop&q=80"}
                alt={tripLocation}
                fill
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{tripLocation}</p>
                  <p className="text-white/70 text-xs">
                    {latestTrip ? `${latestTrip.destination || latestTrip.city} Adventure` : "Ready for your next journey?"}
                  </p>
                </div>
                <Link href={latestTrip ? "/map" : "/trip-planner"}>
                  <Button className="h-8 px-3 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold hover:bg-white/30 transition-all">
                    {latestTrip ? "View map" : "Start planning"}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Upcoming itinerary section ────────────────────── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#FF5A5F] uppercase tracking-widest mb-1">Itinerary</p>
              <h2 className="text-xl font-bold text-[#484848] tracking-tight">What&apos;s ahead</h2>
            </div>
            <Button variant="premium" className="h-10 px-5 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97]">
              View full plan
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {latestTrip && latestTrip.days && latestTrip.days.length > 0 ? (
              latestTrip.days.slice(0, 2).map((day: any, dayIdx: number) => (
                <div key={dayIdx} className={`bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden ${dayIdx > 0 ? 'opacity-60' : ''}`}>
                  <div className="px-5 py-4 border-b border-[#EBEBEB] flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${dayIdx === 0 ? '' : 'bg-[#F7F7F7] border border-[#EBEBEB] text-[#484848]'}`} style={dayIdx === 0 ? { backgroundColor: '#FF5A5F' } : {}}>
                      <div className="text-center leading-none">
                        <div className="text-[9px] opacity-70">DAY</div>
                        <div className="text-base font-extrabold -mt-0.5">{day.day || dayIdx + 1}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#484848]">Day {day.day || dayIdx + 1} — {latestTrip.destination}</h3>
                      <p className="text-xs text-[#767676]">{day.activities?.length || 0} activities planned</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {day.activities?.slice(0, 4).map((act: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#767676] w-12 shrink-0">{act.time || "--:--"}</span>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dayIdx === 0 ? 'bg-[#FF5A5F]' : 'bg-[#DDDDDD]'}`} />
                        <p className="text-sm font-medium text-[#484848]">{act.name}</p>
                      </div>
                    ))}
                    {(!day.activities || day.activities.length === 0) && (
                      <p className="text-xs text-[#BBBBBB]">No activities planned</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              /* Empty state — no trips */
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#EBEBEB] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] flex items-center justify-center border border-[#EBEBEB]">
                  <Route className="h-7 w-7 text-[#BBBBBB]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#484848]">No trips planned yet</p>
                  <p className="text-xs text-[#767676] max-w-xs">Start by planning your first AI-powered trip to any destination in India.</p>
                </div>
                <Link href="/trip-planner">
                  <Button variant="premium" className="h-10 px-6 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97]">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Plan my first trip
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Nearby Places Section ─────────────────────── */}
        {coords && (
          <div className="pt-8 border-t border-[#EBEBEB]">
            <PlacesExplorer 
              lat={coords.lat} 
              lon={coords.lng} 
              city={trips[0]?.city} 
            />
          </div>
        )}

      </div>
    </div>
  )
}
