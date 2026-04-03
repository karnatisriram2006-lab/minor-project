"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WifiOff, Download, Map, BookOpen, FileText, CheckCircle2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

const offlineFeatures = [
  {
    icon: Map,
    title: "Offline Maps",
    desc: "Download city maps with key landmarks, hospitals, and transit stations."
  },
  {
    icon: BookOpen,
    title: "Travel Guides",
    desc: "Access curated guides for heritage sites, local food, and hidden gems."
  },
  {
    icon: FileText,
    title: "Saved Itineraries",
    desc: "View your planned trips day-by-day even without internet."
  },
  {
    icon: Smartphone,
    title: "AI Chat (Cached)",
    desc: "Previously asked AI responses remain available offline."
  }
]

export default function OfflinePage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = (city: string) => {
    setDownloading(city)
    setTimeout(() => setDownloading(null), 2000)
  }

  const cities = ["Goa", "Jaipur", "Kerala", "Delhi", "Agra", "Varanasi"]

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00A699] bg-[#00A699]/8 px-3 py-1 rounded-full border border-[#00A699]/15">
              <WifiOff className="h-3.5 w-3.5" />
              Works Offline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Travel without <span className="text-[#00A699]">internet</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Download essential travel data before your trip. Everything works even in remote areas with no connectivity.
          </p>
        </div>

        {/* What works offline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offlineFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00A699]/8 flex items-center justify-center text-[#00A699]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[#484848]">{f.title}</h3>
              <p className="text-xs text-[#767676] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Download city packs */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EBEBEB]">
            <h2 className="text-base font-bold text-[#484848] tracking-tight">Download city packs</h2>
            <p className="text-xs text-[#767676] mt-0.5">Each pack includes maps, guides, and saved itineraries</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cities.map((city) => {
                const isDownloading = downloading === city
                return (
                  <Button
                    key={city}
                    variant="outline"
                    onClick={() => handleDownload(city)}
                    disabled={isDownloading}
                    className="h-14 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] flex flex-col items-center gap-1"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#FF5A5F]/30 border-t-[#FF5A5F] rounded-full animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>{city}</span>
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* PWA Install prompt */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#FF5A5F]/5 to-[#00A699]/5 rounded-2xl border border-[#EBEBEB] p-8 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
            <Smartphone className="h-6 w-6 text-[#FF5A5F]" />
          </div>
          <h3 className="text-lg font-bold text-[#484848]">Install YĀTRĀ as an app</h3>
          <p className="text-sm text-[#767676] max-w-md mx-auto">
            Add YĀTRĀ to your home screen for instant offline access. Works like a native app on Android and iOS.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-[#767676]">
            {["No app store needed", "Works on any device", "Full offline support"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00A699]" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
