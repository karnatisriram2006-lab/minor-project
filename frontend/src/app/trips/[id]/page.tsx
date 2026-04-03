"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Wallet, Clock, Share2, Copy, Check, ArrowLeft, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import api from "@/lib/api"

interface TripActivity {
  name: string
  description: string
  time: string
  type: string
  lat: number
  lng: number
  visitDuration?: string
}

interface TripDay {
  day: number
  activities: TripActivity[]
}

interface Trip {
  _id: string
  title: string
  destination: string
  duration: number
  budget: string
  isPublic: boolean
  days: TripDay[]
  createdAt: string
  userId?: string
}

const CITY_IMAGES: Record<string, string> = {
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop&q=80",
  goa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80",
  agra: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80",
  varanasi: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80",
  ladakh: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
}

function getCityImage(city: string) {
  const key = city.toLowerCase()
  return CITY_IMAGES[key] || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80"
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await api.get(`/trips/${id}`)
        setTrip(data)
      } catch {
        setError("This trip is private or doesn't exist.")
      } finally {
        setLoading(false)
      }
    }
    fetchTrip()
  }, [id])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#FF5A5F] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-xl p-10 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#FF5A5F]/8 flex items-center justify-center mx-auto">
            <MapPin className="h-7 w-7 text-[#FF5A5F]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#484848] dark:text-[#E0E0E0]">Trip not found</h2>
            <p className="text-sm text-[#767676] dark:text-[#888]">{error || "This trip may be private or has been removed."}</p>
          </div>
          <Link href="/dashboard">
            <Button variant="premium" className="h-12 px-6 rounded-xl text-sm font-semibold">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const budgetLabel = trip.budget === "Luxury" ? "₹₹₹" : trip.budget === "Classic" ? "₹₹" : "₹"
  const totalActivities = trip.days.reduce((sum: number, d: TripDay) => sum + (d.activities?.length || 0), 0)
  const createdDate = new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] font-sans">

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <Image
          src={getCityImage(trip.destination)}
          alt={trip.destination}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{trip.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{trip.destination}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{trip.duration} days</span>
            <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4" />{budgetLabel}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{totalActivities} activities</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-3xl py-8 space-y-8">

        {/* Share bar */}
        <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full border border-[#EBEBEB] dark:border-[#2A2A2A]">
              <AvatarFallback className="text-xs font-bold bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#FF5A5F]">
                {trip.destination.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold text-[#484848] dark:text-[#E0E0E0]">Created {createdDate}</p>
              <p className="text-[10px] text-[#767676] dark:text-[#888]">{trip.isPublic ? "Public trip" : "Private trip"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg text-xs font-semibold"
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-[#00A699]" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Link href="/trip-planner">
              <Button variant="premium" size="sm" className="h-9 px-3 rounded-lg text-xs font-semibold">
                <Navigation className="h-3.5 w-3.5 mr-1.5" />
                Plan similar
              </Button>
            </Link>
          </div>
        </div>

        {/* Day-by-day */}
        {trip.days?.map((day: TripDay, dayIdx: number) => (
          <motion.div
            key={dayIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIdx * 0.08, duration: 0.4 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${dayIdx === 0 ? '' : 'bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#484848] dark:text-[#E0E0E0]'}`} style={dayIdx === 0 ? { backgroundColor: '#FF5A5F' } : {}}>
                <div className="text-center leading-none">
                  <div className="text-[9px] opacity-70">DAY</div>
                  <div className="text-base font-extrabold -mt-0.5">{day.day || dayIdx + 1}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">Day {day.day || dayIdx + 1}</h3>
                <p className="text-xs text-[#767676] dark:text-[#888]">{day.activities?.length || 0} activities</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {day.activities?.map((act: TripActivity, actIdx: number) => (
                <div key={actIdx} className="flex items-start gap-4">
                  <span className="text-xs font-mono font-medium text-[#767676] dark:text-[#888] w-14 shrink-0 pt-0.5">{act.time || "--:--"}</span>
                  <div className="w-2 h-2 rounded-full bg-[#FF5A5F] shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0]">{act.name}</p>
                    {act.description && <p className="text-xs text-[#767676] dark:text-[#888] mt-0.5">{act.description}</p>}
                    {act.visitDuration && <p className="text-[10px] text-[#BBBBBB] dark:text-[#666] mt-1">{act.visitDuration}</p>}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF5A5F]/60 bg-[#FF5A5F]/5 dark:bg-[#FF5A5F]/10 px-2 py-0.5 rounded-md shrink-0">
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-[#FF5A5F]/5 to-[#00A699]/5 rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] p-8 text-center space-y-4">
          <h3 className="text-lg font-bold text-[#484848] dark:text-[#E0E0E0]">Inspired by this trip?</h3>
          <p className="text-sm text-[#767676] dark:text-[#888] max-w-md mx-auto">
            Create your own AI-powered itinerary for {trip.destination} or explore a new destination.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/trip-planner">
              <Button variant="premium" className="h-11 px-6 rounded-xl text-sm font-semibold">
                Plan my trip
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" className="h-11 px-6 rounded-xl text-sm font-semibold">
                Explore destinations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
