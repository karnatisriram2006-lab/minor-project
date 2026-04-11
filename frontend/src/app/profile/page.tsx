"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { User as FirebaseUser } from "firebase/auth"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, MapPin, Languages, Compass, Calendar, CheckCircle2, Loader2 } from "lucide-react"
import axios from 'axios'

const TRAVEL_STYLES = [
  { value: "backpacker", label: "Backpacker", desc: "Budget-friendly, off-the-beaten-path" },
  { value: "comfort", label: "Comfort", desc: "Balanced experience with nice stays" },
  { value: "luxury", label: "Luxury", desc: "Premium hotels and fine dining" },
]

const INTEREST_CHIPS = [
  "History", "Food", "Adventure", "Beaches", "Temples",
  "Wildlife", "Shopping", "Yoga", "Nightlife", "Art",
  "Trekking", "Photography"
]

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [homeCity, setHomeCity] = useState("")
  const [languages, setLanguages] = useState<string[]>(["English"])
  const [travelStyle, setTravelStyle] = useState("comfort")
  const [interests, setInterests] = useState<string[]>(["History", "Food", "Photography"])
  const [stats, setStats] = useState({ trips: 0, destinations: 0 })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get(`${apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({ trips: res.data.stats.tripsCount || 0, destinations: res.data.stats.publicTripsCount || 0 });
        // Assume interests/languages are part of profile
      } catch (err) {
        console.error('Failed to load profile from backend:', err);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setHomeCity(currentUser.displayName || "")
        await fetchProfile();
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const toggleInterest = (chip: string) => {
    setInterests(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = await user?.getIdToken();
      await axios.put(`${apiUrl}/profile`, {
        name: displayName,
        nationality: homeCity,
        language: languages[0],
        interests: JSON.stringify(interests)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#FF5A5F] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] dark:bg-[#1A1A1A] flex items-center justify-center mx-auto border border-[#EBEBEB] dark:border-[#2A2A2A]">
            <User className="h-7 w-7 text-[#BBBBBB]" />
          </div>
          <p className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0]">Sign in to view your profile</p>
        </div>
      </div>
    )
  }

  const displayName = user.displayName || "Traveler"
  const photoUrl = user.photoURL || ""
  const userInitial = displayName.charAt(0).toUpperCase()
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : "Recently joined"

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-2xl space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">Profile</h1>
          <p className="text-sm text-[#767676] dark:text-[#888]">Manage your travel preferences and account details.</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-8 text-center space-y-4"
        >
          <Avatar className="h-20 w-20 rounded-full border-2 border-[#EBEBEB] dark:border-[#2A2A2A] mx-auto shadow-sm">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="text-2xl font-bold bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#FF5A5F]">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-[#484848] dark:text-[#E0E0E0]">{displayName}</h2>
            <p className="text-sm text-[#767676] dark:text-[#888]">{user.email}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#767676] dark:text-[#888]">
            <Calendar className="h-3.5 w-3.5" />
            Member since {memberSince}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
            <div className="space-y-1">
              <p className="text-2xl font-black text-[#FF5A5F]">{stats.trips}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#767676] dark:text-[#888]">Trips</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-[#00A699]">{stats.destinations}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#767676] dark:text-[#888]">Destinations</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-[#F59E0B]">{interests.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#767676] dark:text-[#888]">Interests</p>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-6 space-y-6"
        >
          <h3 className="text-base font-bold text-[#484848] dark:text-[#E0E0E0]">Travel Preferences</h3>

          {/* Home City */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Home City
            </Label>
            <Input
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] dark:text-[#E0E0E0] placeholder:text-[#BBBBBB]"
            />
          </div>

          {/* Languages */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5" /> Languages
            </Label>
            <Select value={languages[0]} onValueChange={(v) => setLanguages([v, ...languages.slice(1)])}>
              <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] text-sm font-medium text-[#484848] dark:text-[#E0E0E0]">
                <SelectValue placeholder="Primary language" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white dark:bg-[#1A1A1A] border-[#EBEBEB] dark:border-[#2A2A2A]">
                {["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati"].map(lang => (
                  <SelectItem key={lang} value={lang} className="text-sm font-medium text-[#484848] dark:text-[#E0E0E0]">{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Travel Style */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" /> Travel Style
            </Label>
            <div className="space-y-2">
              {TRAVEL_STYLES.map(style => (
                <button
                  key={style.value}
                  onClick={() => setTravelStyle(style.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    travelStyle === style.value
                      ? "border-[#FF5A5F] bg-[#FF5A5F]/8 dark:bg-[#FF5A5F]/15"
                      : "border-[#EBEBEB] dark:border-[#2A2A2A] hover:border-[#FF5A5F]/30"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    travelStyle === style.value ? "border-[#FF5A5F]" : "border-[#DDDDDD] dark:border-[#444]"
                  }`}>
                    {travelStyle === style.value && <div className="w-2 h-2 rounded-full bg-[#FF5A5F]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0]">{style.label}</p>
                    <p className="text-[11px] text-[#767676] dark:text-[#888]">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleInterest(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.95] ${
                    interests.includes(chip)
                      ? "bg-[#FF5A5F] text-white border border-[#FF5A5F]"
                      : "bg-[#F7F7F7] dark:bg-[#222] text-[#767676] dark:text-[#888] border border-[#EBEBEB] dark:border-[#2A2A2A] hover:border-[#FF5A5F]/30"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="premium"
            className="w-full h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : saved ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved!</span>
              </div>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
