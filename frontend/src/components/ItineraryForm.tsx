"use client"

import React, { useState, useRef, useCallback } from "react"
import {
  Calendar,
  MapPin,
  Compass,
  Wallet,
  ChevronRight,
  Mic,
  MicOff,
  Info,
  LocateFixed
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ItineraryFormProps {
  onGenerate: (data: any) => void
  loading: boolean
}

export function ItineraryForm({ onGenerate, loading }: ItineraryFormProps) {
  const [formData, setFormData] = useState({
    city: "Jaipur",
    days: "3",
    budget: "Luxury"
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Culture", "History", "Food"])
  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "processing">("idle")
  const recognitionRef = useRef<any>(null)

  const INTEREST_CHIPS = [
    "History", "Food", "Adventure", "Beaches", "Temples",
    "Wildlife", "Shopping", "Yoga", "Nightlife", "Art",
    "Trekking", "Photography"
  ]

  const toggleInterest = (chip: string) => {
    setSelectedInterests(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "hi-IN"
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => setVoiceState("recording")
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
      setFormData(prev => ({ ...prev, city: transcript }))
    }
    recognition.onend = () => setVoiceState("idle")
    recognition.onerror = () => setVoiceState("idle")

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop()
    setVoiceState("idle")
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      ...formData,
      interests: selectedInterests.join(", ") || "general"
    })
  }

  const handleGeolocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'User-Agent': 'YATRA-planner' } })
          const data = await res.json()
          const city = data?.address?.city || data?.address?.town || data?.address?.state || 'My Location'
          setFormData(prev => ({ ...prev, city }))
        } catch { setFormData(prev => ({ ...prev, city: 'My Location' })) }
      }, () => alert('Unable to get your location'))
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Form heading */}
      <div className="space-y-1.5">
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
          transition={{ delay: 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-[13px] text-[#767676] leading-relaxed max-w-sm"
        >
          Tell us where you&apos;re headed — we&apos;ll build a personalized day-by-day itinerary.
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold text-[#767676] uppercase tracking-[0.1em] ml-1">
            Destination
          </Label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF5A5F] transition-transform group-focus-within:scale-110" />
            <input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-white h-14 rounded-2xl pl-11 pr-24 font-semibold text-[15px] text-[#484848] border border-[#DDDDDD] outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all placeholder:text-[#BBBBBB] shadow-sm"
              placeholder="City or region, e.g. Jaipur"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-1">
              {/* Geolocation Button inside input */}
              <button 
                type="button" 
                onClick={handleGeolocation} 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#767676] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10 transition-colors tooltip relative group/loc"
                title="Use my location"
              >
                <LocateFixed className="h-4 w-4" />
              </button>

              {/* Voice Input Button inside input */}
              <button
                type="button"
                onClick={voiceState === "recording" ? stopVoiceInput : startVoiceInput}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  voiceState === "recording"
                    ? "bg-[#FF5A5F] text-white shadow-lg shadow-[#FF5A5F]/30"
                    : "text-[#767676] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10"
                }`}
                aria-label={voiceState === "recording" ? "Stop voice input" : "Start voice input"}
              >
                {voiceState === "recording" ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {voiceState === "recording" && (
            <motion.p 
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] text-[#FF5A5F] font-bold uppercase tracking-wider mt-1 ml-1 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5F] animate-ping" />
              Listening to you...
            </motion.p>
          )}
        </div>

        {/* Days + Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-[#767676] uppercase tracking-[0.1em] ml-1">
              Duration
            </Label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676] group-focus-within:text-[#FF5A5F] transition-colors" />
              <input
                type="number"
                min="1"
                max="21"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                className="w-full bg-white h-14 rounded-2xl pl-11 pr-4 font-semibold text-[15px] text-[#484848] border border-[#DDDDDD] outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-[#767676] uppercase tracking-[0.1em] ml-1">
              Budget
            </Label>
            <div className="relative group">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676] group-focus-within:text-[#FF5A5F] transition-colors" />
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-white h-14 rounded-2xl pl-11 pr-10 font-semibold text-[15px] text-[#484848] border border-[#DDDDDD] outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option>Economy</option>
                <option>Classic</option>
                <option>Luxury</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BBBBBB] pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {/* Interests - Chip Selector */}
        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-[#767676] uppercase tracking-[0.1em] ml-1">
            Trip Interests
          </Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_CHIPS.map((chip) => {
              const isSelected = selectedInterests.includes(chip)
              return (
                <motion.button
                  key={chip}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleInterest(chip)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-[#FF5A5F] text-white border-[#FF5A5F] shadow-md shadow-[#FF5A5F]/20"
                      : "bg-white text-[#484848] border-[#EBEBEB] hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
                  }`}
                >
                  {chip}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          type="submit"
          disabled={loading}
          variant="premium"
          className="w-full h-15 rounded-2xl text-[14px] font-bold tracking-tight shadow-lg shadow-[#FF5A5F]/15 transition-all active:scale-[0.98] group"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
              />
              <span className="font-semibold">Curating your experience...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 transition-transform group-hover:rotate-45" />
              <span>Plan my trip</span>
            </div>
          )}
        </Button>
      </form>

      {/* Info note */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#484848]/[0.03] border border-[#484848]/[0.05]">
        <Info className="h-4 w-4 text-[#767676] shrink-0" />
        <p className="text-[11px] text-[#767676] font-medium leading-tight">
          AI-powered itineraries are highly personalized based on location and interests.
        </p>
      </div>
    </div>
  )
}
