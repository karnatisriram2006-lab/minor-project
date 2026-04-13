"use client";
/* Forced update marker: v2.0.2 - Rename Clock Icon to ClockIcon */

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock as ClockIcon,
  Navigation,
  Wallet,
  ChevronRight,
  Download,
  CheckCircle2,
  Map as MapIcon,
  Image as ImageIcon,
  List,
  Plus,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { exportElementToPDF } from "@/lib/pdfExport";
import { PrintableItinerary } from "@/components/PrintableItinerary";
import { fetchCoordinates } from "@/services/geoService";
import { generateItinerarySchedule, ScheduledStop } from "@/utils/scheduler";
import { fetchRoute } from "@/services/routeService";
import { ItineraryForm } from "@/components/ItineraryForm";
import { ItineraryRoutes } from "@/components/ItineraryRoutes";
const ItineraryRoutesDynamic = dynamic(() => import('@/components/ItineraryRoutes').then((mod) => {
  const c = (mod as any).default ?? (mod as any).ItineraryRoutes;
  return typeof c === 'function' ? c : (() => { if (typeof console !== 'undefined') console.warn('[ItineraryRoutes] Invalid export; rendering nothing.'); return null; });
}), { ssr: false, loading: () => <div className="h-8 w-full bg-gray-100 animate-pulse" /> });
import { GenerationProgress } from "@/components/AI/GenerationProgress";
import { useItineraryStream } from "@/hooks/useItineraryStream";
import { imageService } from "@/services/imageService";
import Image from "next/image";
import { useOfflineItinerary } from "@/hooks/useOfflineStorage";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f5f3ef] flex items-center justify-center">
      <div
        className="w-12 h-12 rounded-full border-4 border-[#E8391A] border-t-transparent animate-spin"
        style={{ animationDuration: "0.6s" }}
      />
    </div>
  ),
});

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
  placeImage?: string;
}

type ItineraryType = Record<string, ItineraryStop[]>;

import { useTranslations } from "next-intl";

export default function TripPlanner() {
  let t: any;
  try {
    t = useTranslations("TripPlanner");
  } catch {
    t = (s: string) => s;
  }
  const [isExporting, setIsExporting] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeStop, setActiveStop] = useState<string | number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [focusLeg, setFocusLeg] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);
  const INITIAL_FORM = { city: "Jaipur", days: "3", budget: "Luxury", startTime: "09:00" } as const
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [modePreferences, setModePreferences] = useState<
    Record<number, string>
  >({});
  const [legDurations, setLegDurations] = useState<Record<number, number>>({});
  const [isSyncingRoutes, setIsSyncingRoutes] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");
  const isNewTrip = searchParams.get("new") === "true";
  const loadOffline = searchParams.get("offline") === "true";

  // Handle ?destination=X — pre-fill the form with a specific city
  useEffect(() => {
    const destination = searchParams.get("destination");
    if (destination) {
      console.log("[TRIP-PLANNER] Pre-filling destination:", destination);
      setFormData((prev) => ({
        ...prev,
        city: destination,
      }));
    }
  }, [searchParams]);

  // Handle ?new=true — reset everything to show fresh form
  useEffect(() => {
    if (isNewTrip) {
      console.log("[TRIP-PLANNER] Resetting for new trip");
      setItinerary(null);
      setFormData({
        city: "Jaipur",
        days: "3",
        budget: "Luxury",
        startTime: "09:00",
      });
      setActiveDay(0);
      setActiveStop(null);
      setSaveStatus("idle");
      setModePreferences({});
      setLegDurations({});
      setSavedTripId(null);
      setBudgetSummary(null);
      localStorage.removeItem("offline-itinerary");
      setPanelOpen(true);
    }
  }, [isNewTrip]);

  // Load cached itinerary explicitly when opened from offline page.
  useEffect(() => {
    if (!loadOffline || itinerary) return;
    try {
      const cached = localStorage.getItem("offline-itinerary");
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (!parsed || typeof parsed !== "object") return;
      const dayCount = Object.keys(parsed).length;
      if (dayCount === 0) return;

      setItinerary(parsed);
      setFormData((prev) => ({
        ...prev,
        days: String(dayCount),
      }));
      setPanelOpen(true);
    } catch {
      // ignore invalid cache
    }
  }, [loadOffline, itinerary]);

  // Load public trip on mount bypass auth if available
  useEffect(() => {
    if (loadId && !itinerary && !isStreaming) {
      const fetchPublicTrip = async () => {
        try {
          const res = await api.get(`/trips/${loadId}`);
          const fetchedTrip = res.data;

          setFormData({
            city: fetchedTrip.destination,
            days: String(fetchedTrip.duration),
            budget: fetchedTrip.budget,
            startTime: "09:00",
          });
          setSavedTripId(fetchedTrip._id);

          // Reconstruct the processed itinerary format from DB format
          const reconstructed: ItineraryType = {};

          if (Array.isArray(fetchedTrip.days)) {
            fetchedTrip.days.forEach((dayObj: any) => {
              reconstructed[`Day ${dayObj.day}`] = dayObj.activities.map(
                (act: any, idx: number) => ({
                  ...act,
                  id: act.name + idx,
                  index: idx,
                  category: act.type || "Culture",
                }),
              );
            });
          } else if (fetchedTrip.days && typeof fetchedTrip.days === "object") {
            // Support legacy object-based itinerary tracking
            Object.entries(fetchedTrip.days).forEach(
              ([dayKey, activities]: [string, any]) => {
                reconstructed[dayKey] = activities.map(
                  (act: any, idx: number) => ({
                    ...act,
                    id: act.name + idx,
                    index: idx,
                    category: act.type || act.category || "Culture",
                  }),
                );
              },
            );
          }

          setItinerary(reconstructed);
        } catch (err) {
          console.error("Failed to load requested trip:", err);
        }
      };
      fetchPublicTrip();
    }
  }, [loadId]);
  // Do not auto-load offline itinerary on initial load to prioritize showing the form.

  // Persist itinerary to localStorage for offline use
  useEffect(() => {
    if (!itinerary) return;
    try {
      localStorage.setItem("offline-itinerary", JSON.stringify(itinerary));
    } catch {
      // Quota exceeded or other storage error
      console.warn("Failed to save itinerary offline");
    }
  }, [itinerary]);
  // Fetch budget summary if trip is saved
  useEffect(() => {
    if (!savedTripId) {
      setBudgetSummary(null);
      return;
    }
    const fetchBudget = async () => {
      try {
        const { data } = await api.get(`/budget/trip/${savedTripId}`);
        setBudgetSummary(data);
      } catch (err) {
        console.error("Failed to fetch budget summary:", err);
      }
    };
    fetchBudget();
  }, [savedTripId]);
  // SSE streaming hook for AI generation
  const {
    progress,
    result,
    isStreaming,
    error: streamError,
    startStream,
  } = useItineraryStream();

  // Process SSE result into itinerary state
  useEffect(() => {
    if (!result) return;
    const rawItinerary = (result.itinerary || result) as Record<string, any[]>;
    const processed: ItineraryType = {};
    let globalIdx = 0;
    Object.keys(rawItinerary).forEach((dayKey) => {
      processed[dayKey] = rawItinerary[dayKey].map((stop: any) => ({
        ...stop,
        id: stop.name + globalIdx,
        index: globalIdx++,
        category: stop.type || "Culture",
      }));
    });
    setItinerary(processed);
  }, [result]);

  // New: Image Enrichment Loop
  useEffect(() => {
    if (!itinerary) return;

    const enrich = async () => {
      const dayKeys = Object.keys(itinerary);
      let needsEnrichment = false;

      // Check if any stop is missing an image
      for (const day of dayKeys) {
        if (itinerary[day].some((stop) => !stop.placeImage)) {
          needsEnrichment = true;
          break;
        }
      }

      if (needsEnrichment) {
        const newItinerary = { ...itinerary };
        for (const day of dayKeys) {
          newItinerary[day] = await Promise.all(
            itinerary[day].map(async (stop) => {
              if (stop.placeImage) return stop;
              const img = await imageService.getPlaceImage(
                stop.name,
                formData.city,
              );
              return { ...stop, placeImage: img };
            }),
          );
        }
        setItinerary(newItinerary);
      }
    };

    const timer = setTimeout(enrich, 100); // Small debounce
    return () => clearTimeout(timer);
  }, [itinerary]);

  const handleGenerate = (genData: any) => {
    setFormData({
      city: genData.city,
      days: genData.days,
      budget: genData.budget,
      startTime: genData.startTime || "09:00",
    });
    setItinerary(null);

    // Use SSE streaming for live progress UI
    startStream({
      city: genData.city,
      days: parseInt(genData.days) || 3,
      budget: (genData.budget || "medium").toLowerCase(),
      interests: genData.interests || "general",
    });
  };
  const loadOfflineSampleItinerary = async () => {
    try {
      const r = await fetch('/offline_sample.json')
      if (r.ok) {
        const data = await r.json()
        setItinerary(data)
      }
    } catch {
      // ignore
    }
  }

  // 1. Sync Leg Durations when itinerary changes (Debounced)
  useEffect(() => {
    if (!itinerary) return;

    const timeoutId = setTimeout(async () => {
      setIsSyncingRoutes(true);
      const newDurations: Record<number, number> = {};
      const stops = Object.values(itinerary).flat();

      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (a.lat && a.lng && b.lat && b.lng) {
          const route = await fetchRoute(
            { lat: a.lat, lon: a.lng },
            { lat: b.lat, lon: b.lng },
          );
          if (route) {
            // Apply mode-specific speed multiplier and buffer
            const modeId = modePreferences[i] || "car";
            const speedMult =
              modeId === "car" ? 1.8 : modeId === "bus" ? 2.5 : 8;
            const buffer = modeId === "car" ? 10 : modeId === "bus" ? 15 : 2;
            newDurations[i] = Math.round(
              route.durationMin * speedMult + buffer,
            );
          }
        }
      }
      setLegDurations(newDurations);
      setIsSyncingRoutes(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [itinerary, modePreferences]);

  // 2. Generate Scheduled Itinerary
  const scheduledItinerary = useMemo(() => {
    if (!itinerary) return null;

    const processed: Record<string, ScheduledStop[]> = {};
    const dayKeys = Object.keys(itinerary);
    let globalStopIdx = 0;

    dayKeys.forEach((dayKey) => {
      const dayStops = itinerary[dayKey];
      const durations = dayStops.map(
        (_, i) => legDurations[globalStopIdx + i] || 0,
      );

      processed[dayKey] = generateItinerarySchedule(
        dayStops,
        formData.startTime,
        durations,
      );

      globalStopIdx += dayStops.length;
    });

    return processed;
  }, [itinerary, legDurations, formData.startTime]);

  const allStops = useMemo(() => {
    if (!scheduledItinerary) return [];
    // Map ScheduledStop to match InteractiveMap's expected Location interface
    return Object.values(scheduledItinerary)
      .flat()
      .filter((stop) => !!stop && typeof stop.lat === "number")
      .map((stop) => ({
        ...stop,
        description: stop.description || "",
        time: stop.schedule.arrival,
        duration: `${stop.schedule.stayDuration} min`,
      }));
  }, [scheduledItinerary]);

  const totalBudget = useMemo(() => {
    return (
      allStops.reduce((sum, stop) => sum + (stop.cost || 0), 0) ||
      parseInt(formData.days) * 5000
    );
  }, [allStops, formData.days]);

  const daysLabels = useMemo(() => {
    return scheduledItinerary ? Object.keys(scheduledItinerary) : [];
  }, [scheduledItinerary]);

  // Data shape needed by ItineraryRoutes
  const daysForRoutes = useMemo(() => {
    if (!scheduledItinerary) return [];
    return Object.entries(scheduledItinerary).map(([dayLabel, stops]) => ({
      dayLabel,
      stops: stops.map((s) => ({
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        time: s.schedule.arrival,
      })),
    }));
  }, [scheduledItinerary]);

  const flyToMarker = (lat: number, lng: number) => {
    setFocusLeg({ from: [lat, lng], to: [lat, lng] });
  };

  function getCategoryStyle(type: string) {
    const defaultColor = { color: "#6B7280", bg: "#F3F4F6" }; // Fallback Gray
    if (!type) return defaultColor;

    // Normalize string (e.g. 'Historical Site' -> 'historical site')
    const lower = type.toLowerCase();

    if (
      lower.includes("culture") ||
      lower.includes("historical") ||
      lower.includes("heritage") ||
      lower.includes("temple")
    ) {
      return { color: "#B45309", bg: "#FEF3C7" }; // Amber/Orange
    }
    if (
      lower.includes("nature") ||
      lower.includes("park") ||
      lower.includes("garden")
    ) {
      return { color: "#047857", bg: "#D1FAE5" }; // Emerald Green
    }
    if (
      lower.includes("food") ||
      lower.includes("restaurant") ||
      lower.includes("cafe")
    ) {
      return { color: "#BE123C", bg: "#FFE4E6" }; // Rose Red
    }
    if (
      lower.includes("shopping") ||
      lower.includes("market") ||
      lower.includes("bazaar")
    ) {
      return { color: "#4338CA", bg: "#E0E7FF" }; // Indigo Blue
    }
    if (
      lower.includes("museum") ||
      lower.includes("art") ||
      lower.includes("gallery")
    ) {
      return { color: "#6D28D9", bg: "#EDE9FE" }; // Violet
    }

    return defaultColor;
  }

  const handleSave = async () => {
    console.log("[SAVE] Button clicked - Starting save process");

    if (!itinerary) {
      console.warn("[SAVE] No itinerary to save");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    console.log("[SAVE] Itinerary found, processing...", {
      days: Object.keys(itinerary).length,
      city: formData.city,
      budget: totalBudget,
    });

    // Check if user is authenticated
    if (!formData.city) {
      console.warn("[SAVE] Cannot save: no trip data");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    try {
      setSaveStatus("saving");
      console.log("[SAVE] Status set to 'saving'");

      const daysArray = Object.entries(itinerary).map(
        ([dayKey, activities]) => ({
          day: parseInt(dayKey.replace(/\D/g, "") || "1"),
          activities: activities.map((a) => ({
            name: a.name,
            description: a.description || "",
            time: a.time || "",
            type: a.type || "",
            lat: a.lat,
            lng: a.lng,
          })),
        }),
      );

      console.log("[SAVE] Days array prepared:", daysArray.length, "days");

      // If offline, queue for later syncing instead of posting
      if (typeof window !== "undefined" && !navigator.onLine) {
        console.log("[SAVE] User is offline - saving locally");
        const offlineTrips = JSON.parse(
          localStorage.getItem("offline-trips") || "[]",
        );
        offlineTrips.push({
          city: formData.city,
          days: daysArray,
          budget: totalBudget,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem("offline-trips", JSON.stringify(offlineTrips));
        // Also cache itinerary for offline use
        localStorage.setItem("offline-itinerary", JSON.stringify(itinerary));

        console.log("[SAVE] ✅ Trip saved offline");
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }

      console.log("[SAVE] User is online - posting to API");
      console.log("[SAVE] Sending POST /trips with:", {
        title: `${formData.city} Trip`,
        destination: formData.city,
        duration: parseInt(formData.days),
        budget: totalBudget,
      });

      const { data } = await api.post("/trips", {
        title: `${formData.city} Trip`,
        destination: formData.city,
        duration: parseInt(formData.days),
        budget: totalBudget,
        isPublic: true,
        days: daysArray,
      });

      console.log("[SAVE] ✅ API Response:", data);
      setSaveStatus("saved");
      setSavedTripId(data._id);
      console.log("[SAVE] Trip saved successfully with ID:", data._id);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error("[SAVE] ❌ Save failed:", err);
      console.error("[SAVE] Error status:", err?.response?.status);
      console.error("[SAVE] Error data:", err?.response?.data);
      console.error("[SAVE] Error message:", err?.message);

      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to save trip";
      console.error("[SAVE] Final error message:", errorMsg);

      // Check for auth errors
      if (err?.response?.status === 401) {
        console.warn("[SAVE] ⚠️  Not authenticated - please log in");
      } else if (err?.response?.status === 500) {
        console.warn("[SAVE] ⚠️  Backend server error");
      } else if (!navigator.onLine) {
        console.warn("[SAVE] ⚠️  No internet connection");
      }

      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleNewTrip = () => {
    // Reset all state
    setItinerary(null);
    setFormData({
      city: "Jaipur",
      days: "3",
      budget: "Luxury",
      startTime: "09:00",
    });
    setActiveDay(0);
    setActiveStop(null);
    setSaveStatus("idle");
    setModePreferences({});
    setLegDurations({});
    setSavedTripId(null);
    setBudgetSummary(null);
    // Clear localStorage
    localStorage.removeItem("offline-itinerary");
    setPanelOpen(true);
  };

  const shouldRenderMap = !isMobileViewport || !panelOpen;

  if (!mounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden bg-white text-[#1a1a1a]">
        <div className="trip-planner-ui flex flex-col md:flex-row h-full relative">
          <div className="w-full h-full md:w-[380px] bg-white" />
          <div className="flex-1 bg-[#f5f3ef]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden print:h-auto print:overflow-visible bg-white text-[#1a1a1a]">
      <div className="trip-planner-ui flex flex-col md:flex-row h-full relative print:block print:h-auto print:overflow-visible">
        {/* Sidebar Panel */}
        <div
          className={cn(
            "flex-shrink-0 bg-white overflow-hidden z-20 relative transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            panelOpen
              ? "w-full h-full md:w-[380px]"
              : "w-full h-0 md:w-0 md:h-full",
          )}
          style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.08)" }}
        >
          {panelOpen && (
            <div className="flex flex-col h-full w-full md:w-[380px]">
              {!itinerary ? (
                <div className="flex flex-col p-8 space-y-8 h-full overflow-y-auto">
                  <ItineraryForm
                    onGenerate={handleGenerate}
                    loading={isStreaming}
                    initialData={formData}
                  />
                  {streamError && (
                    <button
                      onClick={loadOfflineSampleItinerary}
                      className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 border border-[#E5E7EB] rounded-md bg-white hover:bg-[#F3F4F6]"
                    >
                      Load sample itinerary
                    </button>
                  )}
                  {/* Live generation progress */}
                  {(isStreaming || streamError) && (
                    <>
                      <GenerationProgress
                        progress={progress}
                        isStreaming={isStreaming}
                        error={streamError}
                        city={formData.city}
                      />
                      {streamError && (
                        <button
                          onClick={() => {
                            // Retry generation with the same params
                            startStream({
                              city: formData.city,
                              days: parseInt(formData.days) || 3,
                              budget: (formData.budget || "medium").toLowerCase(),
                              interests: "general",
                            })
                          }}
                          className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 border border-[#E5E7EB] rounded-md bg-white hover:bg-[#F3F4F6]"
                        >
                          Retry generation
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* ── Panel Header ── */}
                  <div
                    style={{
                      padding: "18px 20px 0",
                      background: "white",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    {/* Title Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                          }}
                        >
                          {formData.city}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                            fontSize: 12,
                            color: "#6B7280",
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#22C55E",
                              boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                              animation: "pulse 2s infinite",
                            }}
                          />
                          {t("tripItinerary")}
                          <span
                            style={{
                              background: "#FEF2F2",
                              color: "#E8391A",
                              fontWeight: 600,
                              fontSize: 11,
                              padding: "1px 7px",
                              borderRadius: 99,
                            }}
                          >
                            {allStops.length} {t("stops")}
                          </span>
                        </div>
                      </div>

                      {/* Budget Quick Glance Widget */}
                      {budgetSummary && budgetSummary.budgetAllocation && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mx-5 mb-5 p-4 rounded-2xl bg-gradient-to-br from-[#F7F7F7] to-[#FFFFFF] border border-[#EBEBEB] shadow-sm relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Wallet className="w-12 h-12 rotate-12" />
                          </div>
                          <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-[#FF5A5F]" />
                              <span className="text-[11px] font-black uppercase text-[#767676] tracking-widest">
                                {t("budgetTracker")}
                              </span>
                            </div>
                            <Link
                              href={`/budget?tripId=${savedTripId}`}
                              className="text-[10px] font-bold text-[#E8391A] hover:underline flex items-center gap-1"
                            >
                              {t("details")}{" "}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>

                          <div className="flex items-end justify-between mb-2 relative z-10">
                            <div>
                              <p className="text-[10px] font-medium text-[#767676]">
                                {t("actualSpent")}
                              </p>
                              <p className="text-lg font-black text-[#1a1a1a]">
                                ₹
                                {budgetSummary.actualSpend.total.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-medium text-[#767676]">
                                {t("target")}
                              </p>
                              <p className="text-xs font-bold text-[#A0A0A0]">
                                ₹
                                {budgetSummary.budgetAllocation.total.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative z-10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min((budgetSummary.actualSpend.total / budgetSummary.budgetAllocation.total) * 100, 100)}%`,
                              }}
                              className={cn(
                                "h-full rounded-full transition-all",
                                budgetSummary.actualSpend.total >
                                  budgetSummary.budgetAllocation.total
                                  ? "bg-[#FF5A5F]"
                                  : "bg-[#00A699]",
                              )}
                            />
                          </div>

                          {budgetSummary.actualSpend.total >
                            budgetSummary.budgetAllocation.total && (
                            <p className="mt-2 text-[10px] font-bold text-[#FF5A5F] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{" "}
                              {t("budgetExceeded")}
                            </p>
                          )}
                        </motion.div>
                      )}

                      {/* New Trip Button */}
                      <button
                        onClick={handleNewTrip}
                        style={{
                          background: "transparent",
                          color: "#6B7280",
                          border: "1px solid #E5E7EB",
                          borderRadius: 99,
                          padding: "9px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.2s ease",
                          letterSpacing: "0.1px",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "#F9FAFB";
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "#D1D5DB";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "#E5E7EB";
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        New Trip
                      </button>

                      {/* Save Button */}
                      <button
                        onClick={handleSave}
                        disabled={saveStatus === "saving"}
                        style={{
                          background:
                            saveStatus === "saved"
                              ? "linear-gradient(135deg,#22C55E,#16A34A)"
                              : saveStatus === "error"
                                ? "#EF4444"
                                : "linear-gradient(135deg,#E8391A,#FF6B47)",
                          color: "white",
                          border: "none",
                          borderRadius: 99,
                          padding: "9px 20px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow:
                            saveStatus === "saved"
                              ? "0 4px 12px rgba(34,197,94,0.3)"
                              : "0 4px 12px rgba(232,57,26,0.3)",
                          transition: "all 0.2s ease",
                          letterSpacing: "0.1px",
                        }}
                      >
                        {saveStatus === "saving" && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {saveStatus === "saving"
                          ? t("saving")
                          : saveStatus === "saved"
                            ? t("saved")
                            : t("saveTrip")}
                      </button>
                    </div>

                    {/* Day Tabs — pill style */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        overflowX: "auto",
                        paddingBottom: 14,
                        scrollbarWidth: "none",
                      }}
                    >
                      {daysLabels.map((day, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDay(i)}
                          style={{
                            padding: "6px 14px",
                            border: "none",
                            borderRadius: 99,
                            cursor: "pointer",
                            fontSize: 12.5,
                            fontWeight: activeDay === i ? 700 : 500,
                            color: activeDay === i ? "white" : "#6B7280",
                            background: activeDay === i ? "#E8391A" : "#F3F4F6",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                            flexShrink: 0,
                            boxShadow:
                              activeDay === i
                                ? "0 2px 8px rgba(232,57,26,0.35)"
                                : "none",
                          }}
                        >
                          {day.replace("Day", t("day"))}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Stop Cards (Timeline Layout) ── */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {scheduledItinerary &&
                      scheduledItinerary[daysLabels[activeDay]]?.map(
                        (stop: any, i: number) => {
                          if (!stop || typeof stop !== 'object') return null;
                          const dayStops =
                            (scheduledItinerary &&
                              scheduledItinerary[daysLabels[activeDay]]) ||
                            [];
                          const isLast = i === dayStops.length - 1;
                          const isActive = activeStop === stop.id;
                          const catStyle = getCategoryStyle(
                            stop.category || stop.type || "",
                          );

                          return (
                            <div key={stop.id} className="relative">
                              {/* 1. Stop Card */}
                              <div
                                onClick={() => {
                                  setActiveStop(stop.id);
                                  flyToMarker(stop.lat, stop.lng);
                                }}
                                className={cn(
                                  "flex gap-4 p-5 rounded-3xl cursor-pointer transition-all duration-300 border",
                                  isActive
                                    ? "bg-[#FFF8F7] border-[#FFD5CC] shadow-lg shadow-red-500/5 scale-[1.01] sm:scale-[1.02] z-10 relative"
                                    : "bg-white border-[#F3F4F6] hover:border-[#E8391A]/30 hover:shadow-md",
                                )}
                              >
                                {/* Time/Status Column */}
                                <div className="flex flex-col items-center gap-2 pt-1 min-w-[70px]">
                                  <div className="text-base font-bold text-[#1a1a1a]">
                                    {stop.schedule.arrival}
                                  </div>
                                  <div className="h-12 w-1 bg-[#F3F4F6] rounded-full" />
                                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {stop.schedule.departure}
                                  </div>
                                </div>

                                {/* Image Thumbnail (Larger) */}
                                <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0 border-2 border-[#F3F4F6] shadow-sm">
                                  {stop.placeImage ? (
                                    <Image
                                      src={stop.placeImage}
                                      alt={stop.name}
                                      fill
                                      sizes="96px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                  )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 space-y-2">
                                  {/* Header: Cat + Duration */}
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span
                                      className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg"
                                      style={{
                                        color: catStyle.color,
                                        background: catStyle.bg,
                                      }}
                                    >
                                      {stop.category || stop.type || "Stop"}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
                                      <ClockIcon className="w-4 h-4" />
                                      {stop.schedule.stayDuration}m stay
                                    </div>
                                  </div>

                                  {/* Stop Name */}
                                  <h3 className="text-lg font-bold text-[#111827] leading-tight tracking-tight">
                                    {stop.name}
                                  </h3>

                                  {/* Description */}
                                  {stop.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                      {stop.description}
                                    </p>
                                  )}

                                  {/* Details: Cost */}
                                  <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2 text-base font-bold text-[#111827]">
                                      {stop.cost
                                        ? `₹${stop.cost.toLocaleString("en-IN")}`
                                        : "Free Entry"}
                                    </div>
                                    <div
                                      className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                                        isActive
                                          ? "bg-[#E8391A] text-white"
                                          : "text-gray-300",
                                      )}
                                    >
                                      <ChevronRight className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Travel Segment (if not last) */}
                              {!isLast && (
                                <div className="ml-9 my-2 py-4 pl-8 border-l-2 border-dashed border-[#F3F4F6] flex items-center gap-3 group/travel">
                                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-[#F3F4F6] group-hover/travel:border-[#E8391A]/20 transition-colors">
                                    <Navigation className="w-4 h-4 text-[#E8391A]" />
                                    <span className="text-sm font-bold text-gray-700">
                                      {stop.schedule.travelTime}m travel
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                      {modePreferences[i] || "Car"}
                                    </span>
                                  </div>

                                  {/* Simple Mode Switcher (Micro) */}
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover/travel:opacity-100 transition-opacity">
                                    {["car", "walk"].map((m) => (
                                      <button
                                        key={m}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setModePreferences((prev) => ({
                                            ...prev,
                                            [i]: m,
                                          }));
                                        }}
                                        className={cn(
                                          "px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all tracking-tighter",
                                          (modePreferences[i] || "car") === m
                                            ? "bg-[#E8391A] text-white"
                                            : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                                        )}
                                      >
                                        {m}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}

                    {/* Final Finish Indicator */}
                    {scheduledItinerary &&
                      scheduledItinerary[daysLabels[activeDay]] && (
                        <div className="flex items-center gap-4 px-4 py-10 mt-4">
                          <div className="w-12 h-12 rounded-full bg-gray-900 border-4 border-white shadow-md flex items-center justify-center text-white shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">
                              End of Day {activeDay + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              Relax and recharge
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* ── Route Details (Transit) ── */}
          {daysForRoutes.length > 0 && typeof ItineraryRoutesDynamic === 'function' && (
                    <div className="mt-4 border-t border-[#F3F4F6]">
                      <ItineraryRoutesDynamic
                        days={daysForRoutes}
                        onFocusLeg={(leg) => setFocusLeg(leg)}
                        modePreferences={modePreferences}
                        onModeChange={(idx: number, mode: string) =>
                          setModePreferences((prev) => ({
                            ...prev,
                            [idx]: mode,
                          }))
                        }
                      />
                    </div>
          )}
          {daysForRoutes.length > 0 && typeof ItineraryRoutesDynamic !== 'function' && (
                    <div className="mt-4 border-t border-[#F3F4F6] text-sm text-red-600">
                      Could not load route panel. See console for export/import issues.
                    </div>
          )}

                  {/* ── Footer Export ── */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderTop: "1px solid #F3F4F6",
                      background: "white",
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsExporting(true);
                        exportElementToPDF(
                          "printable-itinerary-content",
                          `${formData.city}-Itinerary.pdf`,
                          `${formData.city} Trip`,
                        ).finally(() => setIsExporting(false));
                      }}
                      disabled={isExporting}
                      style={{
                        width: "100%",
                        padding: "11px",
                        border: "1.5px solid #E5E7EB",
                        borderRadius: 12,
                        background: isExporting ? "#F9FAFB" : "white",
                        cursor: isExporting ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isExporting)
                          e.currentTarget.style.borderColor = "#E8391A";
                        e.currentTarget.style.color = "#E8391A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.color = "#374151";
                      }}
                    >
                      <Download className="h-4 w-4" />
                      {isExporting ? t("exporting") : t("exportAsPDF")}
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
              <MapIcon className="w-4 h-4" /> {t("map")}
            </>
          ) : (
            <>
              <List className="w-4 h-4" /> {t("list")}
            </>
          )}
        </button>

        {/* Map Area */}
        <div
          className={cn(
            "flex-1 relative w-full border-t md:border-t-0 border-[#E5E7EB]",
            panelOpen ? "hidden md:block" : "block",
          )}
        >
          {shouldRenderMap && (
            <div className="absolute inset-0">
              <InteractiveMap
                points={allStops}
                focusLeg={focusLeg}
                routingLeg={null}
                showMultiRoute={true}
              />
            </div>
          )}

          {itinerary && (
            <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-6 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.14)] items-center gap-4 text-[13px] whitespace-nowrap select-none">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8391A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{ color: "#6B7280" }}>{t("duration")}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {formData.days} {t("days")}
                </span>
              </div>

              <div style={{ width: 1, height: 16, background: "#E5E7EB" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8391A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ color: "#6B7280" }}>{t("stops")}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {allStops.length}
                </span>
              </div>

              <div style={{ width: 1, height: 16, background: "#E5E7EB" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8391A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span style={{ color: "#6B7280" }}>{t("budget")}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  ₹{totalBudget.toLocaleString("en-IN")}
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
            panelOpen ? "left-[360px]" : "left-[8px]",
          )}
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              panelOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      <PrintableItinerary
        city={formData.city}
        itinerary={scheduledItinerary as any}
        days={formData.days}
      />
    </div>
  );
}
