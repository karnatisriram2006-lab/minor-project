"use client";
/* Forced update marker: v2.0.1 - Fix Syntax Errors */

import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Clock,
  Navigation,
  Wallet,
  ChevronRight,
  Download,
  CheckCircle2,
  Map as MapIcon,
  List
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { exportElementToPDF } from "@/lib/pdfExport"
import { PrintableItinerary } from "@/components/PrintableItinerary"
import { ItineraryRoutes } from '@/components/ItineraryRoutes'
import { ItineraryForm } from "@/components/ItineraryForm"
import { fetchCoordinates } from '@/services/geoService'

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f5f3ef] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#E8391A] border-t-transparent animate-spin" style={{ animationDuration: '0.6s' }} />
    </div>
  ),
})

interface ItineraryStop {
  id: string | number;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  time?: string;
  duration?: string;
  cost?: number;
  lat: number;
  lng: number;
  status?: string;
  index: number;
}

type ItineraryType = Record<string, ItineraryStop[]>

export default function TripPlanner() {
  const [loading, setLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  const [activeStop, setActiveStop] = useState<string | number | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const [focusLeg, setFocusLeg] = useState<{ from: [number, number]; to: [number, number] } | null>(null)
  const [formData, setFormData] = useState({ city: "Jaipur", days: "3", budget: "Luxury" }) 

  const handleGenerate = async (genData: any) => {
    setFormData({ city: genData.city, days: genData.days, budget: genData.budget })
    setLoading(true)

    try {
      const { data } = await api.post("/ai/itinerary", genData)
      const rawItinerary = data.itinerary || data
      
      const processed: ItineraryType = {}
      let globalIdx = 0
      Object.keys(rawItinerary).forEach((dayKey) => {
        processed[dayKey] = rawItinerary[dayKey].map((stop: any) => ({
          ...stop,
          id: stop.name + globalIdx, 
          index: globalIdx++,
          category: stop.type || 'Culture'
        }))
      })
      setItinerary(processed)
    } catch (err) {
      console.error("[Curation Error]", err)
      const dynamicMock: ItineraryType = {}
      const dayCount = parseInt(genData.days) || 3
      const baseLat = genData.city.toLowerCase().includes("agra") ? 27.1751 : 26.9124
      const baseLng = genData.city.toLowerCase().includes("agra") ? 78.0421 : 75.7873

      let globalIdx = 0
      for (let i = 1; i <= dayCount; i++) {
        dynamicMock[`Day ${i}`] = [
          {
            id: `stop-${globalIdx}`,
            index: globalIdx++,
            time: "09:00",
            name: `${genData.city} Heritage Discovery ${i}`,
            type: "Cultural",
            category: "Culture",
            description: `AI curated sequence for travelers in ${genData.city}. Exploring local heritage sites.`,
            lat: baseLat + (Math.random() - 0.5) * 0.05,
            lng: baseLng + (Math.random() - 0.5) * 0.05,
            status: "Suggested"
          }
        ]
      }
      setItinerary(dynamicMock)
    } finally {
      setLoading(false)
    }
  }

  const allStops = useMemo(() => {
    if (!itinerary) return []
    return Object.values(itinerary).flat().filter(stop => !!stop && typeof stop.lat === 'number')
  }, [itinerary])

  const totalBudget = useMemo(() => {
    return allStops.reduce((sum, stop) => sum + (stop.cost || 0), 0) || (parseInt(formData.days) * 5000)
  }, [allStops, formData.days])

  const daysLabels = useMemo(() => {
    return itinerary ? Object.keys(itinerary) : []
  }, [itinerary])

  // Data shape needed by ItineraryRoutes
  const daysForRoutes = useMemo(() => {
    if (!itinerary) return []
    return Object.entries(itinerary).map(([dayLabel, stops]) => ({
      dayLabel,
      stops: stops.map(s => ({ name: s.name, lat: s.lat, lng: s.lng, time: s.time }))
    }))
  }, [itinerary])

  const flyToMarker = (lat: number, lng: number) => {
    setFocusLeg({ from: [lng, lat], to: [lng, lat] })
  }

  function getCategoryStyle(type: string) {
    const defaultColor = { color: '#6B7280', bg: '#F3F4F6' } // Fallback Gray
    if (!type) return defaultColor
    
    // Normalize string (e.g. 'Historical Site' -> 'historical site')
    const lower = type.toLowerCase()

    if (lower.includes('culture') || lower.includes('historical') || lower.includes('heritage') || lower.includes('temple')) {
      return { color: '#B45309', bg: '#FEF3C7' } // Amber/Orange
    }
    if (lower.includes('nature') || lower.includes('park') || lower.includes('garden')) {
      return { color: '#047857', bg: '#D1FAE5' } // Emerald Green
    }
    if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe')) {
      return { color: '#BE123C', bg: '#FFE4E6' } // Rose Red
    }
    if (lower.includes('shopping') || lower.includes('market') || lower.includes('bazaar')) {
      return { color: '#4338CA', bg: '#E0E7FF' } // Indigo Blue
    }
    if (lower.includes('museum') || lower.includes('art') || lower.includes('gallery')) {
      return { color: '#6D28D9', bg: '#EDE9FE' } // Violet
    }
    
    return defaultColor
  }

  const handleSave = async () => {
    if (!itinerary) return
    try {
      setSaveStatus("saving")
      const daysArray = Object.entries(itinerary).map(([dayKey, activities]) => ({
        day: parseInt(dayKey.replace(/\D/g, "") || "1"),
        activities: activities.map(a => ({
          name: a.name,
          description: a.description || "",
          time: a.time || "",
          type: a.type || "",
          lat: a.lat,
          lng: a.lng,
        }))
      }))

      const { data } = await api.post("/trips", {
        title: `${formData.city} Trip`,
        destination: formData.city,
        duration: parseInt(formData.days),
        budget: totalBudget,
        isPublic: true,
        days: daysArray,
      })
      setSaveStatus("saved")
      setSavedTripId(data._id)
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden bg-white text-[#1a1a1a]">
      <div className="flex flex-col md:flex-row h-full relative">
        {/* Sidebar Panel */}
        <div 
          className={cn(
            "flex-shrink-0 bg-white overflow-hidden z-20 relative transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            panelOpen ? "w-full h-full md:w-[380px]" : "w-full h-0 md:w-0 md:h-full"
          )}
          style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.08)' }}
        >
          {panelOpen && (
            <div className="flex flex-col h-full w-full md:w-[380px]">
              {!itinerary ? (
                <div className="flex flex-col p-8 space-y-8 h-full overflow-y-auto">
                  <ItineraryForm onGenerate={handleGenerate} loading={loading} />
                </div>
              ) : (
                <>
                  {/* ── Panel Header ── */}
                  <div style={{
                    padding: '18px 20px 0',
                    background: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    borderBottom: '1px solid #F3F4F6',
                  }}>
                    {/* Title Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}>
                      <div>
                        <div style={{
                          fontSize: 20, fontWeight: 700, color: '#111827',
                          letterSpacing: '-0.3px', lineHeight: 1.2,
                        }}>
                          {formData.city}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          marginTop: 4, fontSize: 12, color: '#6B7280',
                        }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#22C55E',
                            boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                            animation: 'pulse 2s infinite',
                          }}/>
                          Trip Itinerary
                          <span style={{
                            background: '#FEF2F2',
                            color: '#E8391A',
                            fontWeight: 600,
                            fontSize: 11,
                            padding: '1px 7px',
                            borderRadius: 99,
                          }}>
                            {allStops.length} stops
                          </span>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        style={{
                          background: saveStatus === 'saved'
                            ? 'linear-gradient(135deg,#22C55E,#16A34A)'
                            : saveStatus === 'error'
                            ? '#EF4444'
                            : 'linear-gradient(135deg,#E8391A,#FF6B47)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 99,
                          padding: '9px 20px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: saveStatus === 'saved'
                            ? '0 4px 12px rgba(34,197,94,0.3)'
                            : '0 4px 12px rgba(232,57,26,0.3)',
                          transition: 'all 0.2s ease',
                          letterSpacing: '0.1px',
                        }}
                      >
                        {saveStatus === 'saving' ? (
                          <div style={{
                            width: 13, height: 13, border: '2px solid white',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                          }}/>
                        ) : saveStatus === 'saved' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Navigation className="h-3.5 w-3.5" />
                        )}
                        {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                      </button>
                    </div>

                    {/* Day Tabs — pill style */}
                    <div style={{
                      display: 'flex', gap: 6, overflowX: 'auto',
                      paddingBottom: 14, scrollbarWidth: 'none',
                    }}>
                      {daysLabels.map((day, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDay(i)}
                          style={{
                            padding: '6px 14px',
                            border: 'none',
                            borderRadius: 99,
                            cursor: 'pointer',
                            fontSize: 12.5,
                            fontWeight: activeDay === i ? 700 : 500,
                            color: activeDay === i ? 'white' : '#6B7280',
                            background: activeDay === i ? '#E8391A' : '#F3F4F6',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                            boxShadow: activeDay === i
                              ? '0 2px 8px rgba(232,57,26,0.35)'
                              : 'none',
                          }}
                        >
                          {day.replace('Day ', 'Day ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Stop Cards (Timeline Layout) ── */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 20px' }}>
                    {itinerary[daysLabels[activeDay]]?.map((stop: ItineraryStop, i: number) => {
                      const dayStops = itinerary[daysLabels[activeDay]] || []
                      const isLast = i === dayStops.length - 1
                      const isActive = activeStop === stop.id
                      const catStyle = getCategoryStyle(stop.category || stop.type || '')

                      return (
                        <div
                          key={stop.id}
                          onClick={() => { setActiveStop(stop.id); flyToMarker(stop.lat, stop.lng) }}
                          style={{
                            display: 'flex',
                            padding: '0 16px',
                            gap: 0,
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                        >
                          {/* Timeline column */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 36,
                            flexShrink: 0,
                          }}>
                            {/* Connector line above dot */}
                            <div style={{
                              width: 2,
                              height: 12,
                              background: i === 0 ? 'transparent' : '#E5E7EB',
                              flexShrink: 0,
                            }}/>
                            {/* Numbered dot */}
                            <div style={{
                              width: 30, height: 30,
                              borderRadius: '50%',
                              background: isActive
                                ? 'linear-gradient(135deg,#E8391A,#FF6B47)'
                                : 'white',
                              border: isActive ? 'none' : '2px solid #E8391A',
                              color: isActive ? 'white' : '#E8391A',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700,
                              flexShrink: 0,
                              boxShadow: isActive
                                ? '0 4px 10px rgba(232,57,26,0.35)'
                                : '0 1px 4px rgba(0,0,0,0.06)',
                              transition: 'all 0.2s ease',
                              zIndex: 1,
                              position: 'relative',
                            }}>
                              {stop.index + 1}
                            </div>
                            {/* Connector line below dot */}
                            {!isLast && (
                              <div style={{
                                width: 2,
                                flex: 1,
                                minHeight: 16,
                                background: 'linear-gradient(to bottom, #E8391A22, #E5E7EB)',
                                flexShrink: 0,
                              }}/>
                            )}
                          </div>

                          {/* Card body */}
                          <div style={{
                            flex: 1,
                            marginLeft: 12,
                            marginBottom: isLast ? 0 : 8,
                            marginTop: 0,
                            padding: '12px 14px',
                            background: isActive ? '#FFF8F7' : 'white',
                            borderRadius: 14,
                            border: isActive ? '1.5px solid #FFD5CC' : '1.5px solid #F3F4F6',
                            boxShadow: isActive
                              ? '0 4px 16px rgba(232,57,26,0.10)'
                              : '0 1px 4px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s ease',
                          }}>
                            {/* Time + Category row */}
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                            }}>
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: '#FFF0EE',
                                color: '#E8391A',
                                fontSize: 11, fontWeight: 600,
                                padding: '3px 9px', borderRadius: 99,
                                letterSpacing: '0.2px',
                              }}>
                                <Clock className="h-3 w-3" />
                                {stop.time || 'Any time'}
                              </div>
                              <span style={{
                                fontSize: 10.5, fontWeight: 700,
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase',
                                color: catStyle.color,
                                background: catStyle.bg,
                                padding: '3px 9px',
                                borderRadius: 99,
                              }}>
                                {stop.category || stop.type || 'Stop'}
                              </span>
                            </div>

                            {/* Name */}
                            <div style={{
                              fontSize: 15, fontWeight: 700,
                              color: '#111827',
                              lineHeight: 1.3,
                              marginBottom: 3,
                              letterSpacing: '-0.2px',
                            }}>
                              {stop.name}
                            </div>

                            {/* Description */}
                            {stop.description && (
                              <div style={{
                                fontSize: 12.5, color: '#9CA3AF',
                                lineHeight: 1.45,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical' as any,
                              }}>
                                {stop.description}
                              </div>
                            )}

                            {/* Cost row */}
                            {stop.cost ? (
                              <div style={{
                                marginTop: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                                <span style={{
                                  fontSize: 13, fontWeight: 700, color: '#111827',
                                }}>
                                  ₹{stop.cost.toLocaleString('en-IN')}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </div>
                            ) : (
                              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* ── Route Details (Transit) ── */}
                    {daysForRoutes.length > 0 && (
                      <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 8 }}>
                        <ItineraryRoutes
                          days={daysForRoutes}
                          onFocusLeg={(leg) => setFocusLeg(leg)}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Footer Export ── */}
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #F3F4F6',
                    background: 'white',
                  }}>
                    <button
                      onClick={() => {
                        setIsExporting(true)
                        exportElementToPDF("printable-itinerary-content", `${formData.city}-Itinerary.pdf`, `${formData.city} Trip`)
                          .finally(() => setIsExporting(false))
                      }}
                      disabled={isExporting}
                      style={{
                        width: '100%',
                        padding: '11px',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: 12,
                        background: isExporting ? '#F9FAFB' : 'white',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 600,
                        color: '#374151',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!isExporting) e.currentTarget.style.borderColor = '#E8391A'; e.currentTarget.style.color = '#E8391A' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
                    >
                      <Download className="h-4 w-4" />
                      {isExporting ? 'Exporting...' : 'Export as PDF'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
        
        {/* Mobile View Toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-[2000] bg-gray-900 text-white px-5 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.3)] font-medium text-[13px] flex items-center gap-2"
        >
          {panelOpen ? (
            <>
              <MapIcon className="w-4 h-4" /> Map
            </>
          ) : (
            <>
              <List className="w-4 h-4" /> List
            </>
          )}
        </button>

        {/* Map Area */}
        <div className="flex-1 relative w-full border-t md:border-t-0 border-[#E5E7EB]">
          <div className="absolute inset-0">
            <InteractiveMap points={allStops as any} focusLeg={focusLeg} />
          </div>

          {itinerary && (
            <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-6 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.14)] items-center gap-4 text-[13px] whitespace-nowrap select-none">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#E8391A" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ color: '#6B7280' }}>Duration</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {formData.days} days
                </span>
              </div>

              <div style={{ width: 1, height: 16, background: '#E5E7EB' }}/>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#E8391A" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ color: '#6B7280' }}>Stops</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {allStops.length}
                </span>
              </div>

              <div style={{ width: 1, height: 16, background: '#E5E7EB' }}/>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#E8391A" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span style={{ color: '#6B7280' }}>Budget</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  ₹{totalBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={cn(
            "hidden md:flex absolute top-1/2 -translate-y-1/2 z-[9999] w-10 h-10 bg-white border border-[#E5E7EB] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] items-center justify-center text-gray-500 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#E8391A] hover:border-[#E8391A] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)]",
            panelOpen ? "left-[360px]" : "left-[8px]"
          )}
        >
          <ChevronRight className={cn("h-5 w-5 transition-transform duration-300", panelOpen && "rotate-180")} />
        </button>
      </div>

      <PrintableItinerary city={formData.city} itinerary={itinerary} days={formData.days} />
    </div>
  )
}
