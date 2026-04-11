"use client";
import React, { useEffect, useState, useMemo } from "react";
import { fetchRoute } from "@/services/routeService";
import { fetchCoordinates } from "@/services/geoService";
import { suggestTransport } from "@/utils/transportSuggestion";
import {
  Car,
  Bus,
  Footprints,
  Clock as ClockIcon,
  IndianRupee,
  Navigation,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

type Stop = { name: string; lat?: number; lng?: number; time?: string };
type DayGroup = { dayLabel: string; stops: Stop[] };

interface LegData {
  from: string;
  to: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  baseDistanceKm?: number; // From OSRM driving
  baseDurationMin?: number; // From OSRM driving
  suggestedMode?: string;
  isDayStart?: boolean; // Whether 'from' is the start of a new day
  dayLabel?: string; // The label (e.g. "Day 1")
}

const MODES = [
  {
    id: "car",
    icon: <Car className="w-3.5 h-3.5" />,
    label: "Car",
    rate: 12,
    speedMult: 1.8,
    bufferMin: 10,
  },
  {
    id: "bus",
    icon: <Bus className="w-3.5 h-3.5" />,
    label: "Bus",
    rate: 4,
    speedMult: 2.5,
    bufferMin: 15,
  },
  {
    id: "walk",
    icon: <Footprints className="w-3.5 h-3.5" />,
    label: "Walk",
    rate: 0,
    speedMult: 8,
    bufferMin: 2,
  },
];

export function ItineraryRoutes({
  days,
  onFocusLeg,
  modePreferences: externalModePrefs,
  onModeChange: onExternalModeChange,
}: {
  days: DayGroup[];
  onFocusLeg?: (leg: { from: [number, number]; to: [number, number] }) => void;
  modePreferences?: Record<number, string>;
  onModeChange?: (idx: number, mode: string) => void;
}) {
  const t = useTranslations("Routes");
  const [legs, setLegs] = useState<LegData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Internal fallback state if props not provided
  const [internalModePrefs, setInternalModePrefs] = useState<
    Record<number, string>
  >({});
  const modePreferences = externalModePrefs || internalModePrefs;
  const setModePreferences = onExternalModeChange || setInternalModePrefs;

  useEffect(() => {
    let mounted = true;
    const compute = async () => {
      setLoading(true);
      const results: LegData[] = [];
      const prefs: Record<number, string> = {};
      let legIndex = 0;

      const flattenedStops: {
        stop: Stop;
        dayLabel: string;
        isStart: boolean;
      }[] = [];
      days.forEach((day, dIdx) => {
        day.stops.forEach((s, sIdx) => {
          flattenedStops.push({
            stop: s,
            dayLabel: day.dayLabel,
            isStart: sIdx === 0,
          });
        });
      });

      for (let i = 0; i < flattenedStops.length - 1; i++) {
        const a = flattenedStops[i].stop;
        const b = flattenedStops[i + 1].stop;

        let from: any = { lat: a.lat ?? NaN, lon: a.lng ?? NaN };
        let to: any = { lat: b.lat ?? NaN, lon: b.lng ?? NaN };

        if (Number.isNaN(from.lat)) {
          const ca = await fetchCoordinates(a.name);
          if (ca) from = { lat: ca.lat, lon: ca.lon };
        }
        if (Number.isNaN(to.lat)) {
          const cb = await fetchCoordinates(b.name);
          if (cb) to = { lat: cb.lat, lon: cb.lon };
        }

        let legData: LegData = {
          from: a.name,
          to: b.name,
          fromLat: from.lat,
          fromLng: from.lon,
          toLat: to.lat,
          toLng: to.lon,
          isDayStart: flattenedStops[i].isStart,
          dayLabel: flattenedStops[i].dayLabel,
        };

        if (Number.isFinite(from?.lat) && Number.isFinite(to?.lat)) {
          const route = await fetchRoute(
            { lat: from.lat, lon: from.lon },
            { lat: to.lat, lon: to.lon },
          );
          if (route && route.distanceKm > 0) {
            legData.baseDistanceKm = route.distanceKm;
            legData.baseDurationMin = route.durationMin;
            legData.suggestedMode = suggestTransport(route.distanceKm);
            prefs[legIndex] =
              legData.suggestedMode === "train" ||
              legData.suggestedMode === "flight"
                ? "car"
                : legData.suggestedMode;
          } else {
            prefs[legIndex] = "car";
          }
        } else {
          prefs[legIndex] = "car";
        }
        results.push(legData);
        legIndex++;
      }
      if (mounted) {
        setLegs(results);

        // Update preferences correctly
        if (onExternalModeChange) {
          // For external, we might need to batch or just update one by one for now if needed.
          // However, it's better if page.tsx initializes these.
          // For now, let's just update the internal state if no external prefs are provided for these keys.
          Object.entries(prefs).forEach(([idx, mode]) => {
            if (!externalModePrefs?.[Number(idx)]) {
              onExternalModeChange(Number(idx), mode);
            }
          });
        } else {
          setInternalModePrefs(prefs);
        }

        setLoading(false);
      }
    };
    compute();
    return () => {
      mounted = false;
    };
  }, [days]);

  const calculateLegDetails = (leg: LegData, idx: number) => {
    const modeId = modePreferences[idx] || "car";
    const modeConfig = MODES.find((m) => m.id === modeId) || MODES[0];

    const distance = leg.baseDistanceKm || 0;
    const cost = Math.round(distance * modeConfig.rate);
    const timeMin = Math.round(
      (leg.baseDurationMin || 0) * (modeConfig as any).speedMult +
        (modeConfig as any).bufferMin,
    );

    return { modeConfig, distance, cost, timeMin };
  };

  const handleModeChange = (idx: number, modeId: string) => {
    if (onExternalModeChange) {
      onExternalModeChange(idx, modeId);
    } else {
      setInternalModePrefs((prev) => ({ ...prev, [idx]: modeId }));
    }
  };

  const { totalDistance, totalCost, totalTime } = useMemo(() => {
    let d = 0,
      c = 0,
      t = 0;
    legs.forEach((leg, idx) => {
      const details = calculateLegDetails(leg, idx);
      d += details.distance;
      c += details.cost;
      t += details.timeMin;
    });
    return { totalDistance: d, totalCost: c, totalTime: t };
  }, [legs, modePreferences]);

  if (!loading && legs.length === 0) return null;

  return (
    <div className="flex flex-col bg-white border-t border-[#EBEBEB]">
      {/* Header / Toggle */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F7F7F7] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center text-[#FF5A5F]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#484848] tracking-tight">
              {t("title")}
            </h3>
            <p className="text-[11px] text-[#767676] font-medium">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-[#BBBBBB] transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </div>

      {isExpanded && (
        <>
          {/* Container */}
          <div className="px-6 py-4 border-t border-[#EBEBEB]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-[#767676] animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-[#FF5A5F] border-t-transparent animate-spin mb-4" />
                {t("calculating")}
              </div>
            ) : legs.length === 0 ? (
              <div className="text-sm text-[#767676]">{t("noLegs")}</div>
            ) : (
              <div className="space-y-0 relative">
                {legs.map((leg, idx) => {
                  const { modeConfig, distance, cost, timeMin } =
                    calculateLegDetails(leg, idx);
                  const isLast = idx === legs.length - 1;

                  return (
                    <div key={idx} className="relative group">
                      {/* Day Header injection */}
                      {leg.isDayStart && (
                        <div className="flex items-center gap-2 mb-4 mt-6">
                          <div className="h-px flex-1 bg-[#EBEBEB]" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#767676] bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#EBEBEB]">
                            {(leg.dayLabel || `${t("time.day")} 1`).replace(
                              "Day",
                              t("time.day") || "Day",
                            )}
                          </span>
                          <div className="h-px flex-1 bg-[#EBEBEB]" />
                        </div>
                      )}

                      {/* Stop A */}
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-white border-[5px] border-[#FF5A5F] relative z-10 shrink-0 shadow-md" />
                        <div className="flex flex-col">
                          <span className="font-bold text-[15px] text-[#484848] tracking-tight leading-none mb-1">
                            {leg.from}
                          </span>
                          <span className="text-[10px] font-bold text-[#767676] uppercase tracking-wider">
                            {t("milestone")} {idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Connector & Route Info */}
                      <div className="ml-[7.5px] border-l-2 border-dashed border-[#DDDDDD] pl-8 py-5 relative group-hover:border-[#FF5A5F]/40 transition-colors">
                        {/* Mode Switcher */}
                        <div className="flex bg-[#F7F7F7] p-1 rounded-xl w-max border border-[#EBEBEB] mb-3 shadow-sm">
                          {MODES.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => handleModeChange(idx, m.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modePreferences[idx] === m.id ? "bg-white shadow-sm text-[#484848] border border-[#DDDDDD]" : "text-[#767676] hover:text-[#484848]"}`}
                            >
                              {m.icon}
                              <span>{t(`modes.${m.id}`)}</span>
                            </button>
                          ))}
                        </div>

                        {/* Segment Details */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#767676] font-semibold mb-4 bg-white/50 rounded-xl p-3 border border-[#EBEBEB] w-fit shadow-sm">
                          <div className="flex items-center gap-1.5 shrink-0 text-[#484848]">
                            {modeConfig.icon}
                            <span>{distance.toFixed(1)} km</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[#DDDDDD]" />
                          <div className="flex items-center gap-1.5 shrink-0 text-[#484848]">
                            <ClockIcon className="w-3.5 h-3.5 text-[#00A699]" />
                            <span>
                              {timeMin >= 60
                                ? `${Math.floor(timeMin / 60)}${t("time.h")} ${timeMin % 60}${t("time.m")}`
                                : `${timeMin} ${t("time.mins")}`}
                            </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[#DDDDDD]" />
                          <div className="flex items-center gap-1.5 shrink-0 text-[#484848]">
                            <IndianRupee className="w-3.5 h-3.5 text-[#FF5A5F]" />
                            <span>{cost === 0 ? t("free") : `₹${cost}`}</span>
                          </div>

                          {modeConfig.id === "car" && distance > 0 && (
                            <span className="text-[10px] text-[#00A699] font-bold tracking-wider uppercase ml-1 bg-[#00A699]/10 px-2 py-0.5 rounded-md border border-[#00A699]/20">
                              {t("fastest")}
                            </span>
                          )}
                        </div>

                        {/* Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (
                              onFocusLeg &&
                              leg.fromLat &&
                              leg.fromLng &&
                              leg.toLat &&
                              leg.toLng
                            ) {
                              onFocusLeg({
                                from: [leg.fromLng, leg.fromLat],
                                to: [leg.toLng, leg.toLat],
                              });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF5A5F] hover:text-white transition-colors bg-white hover:bg-[#FF5A5F] px-4 py-2 rounded-xl border border-[#FF5A5F]/20 shadow-sm"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          {t("navigate")}
                        </button>
                      </div>

                      {/* Final Stop (only render on last leg) */}
                      {isLast && (
                        <div className="flex items-center gap-4 mt-1">
                          <div className="w-5 h-5 rounded-full bg-white border-[5px] border-[#484848] relative z-10 shrink-0 shadow-md" />
                          <div className="flex flex-col">
                            <span className="font-bold text-[15px] text-[#484848] tracking-tight leading-none mb-1">
                              {leg.to}
                            </span>
                            <span className="text-[10px] font-bold text-[#767676] uppercase tracking-wider">
                              {t("tripFinish")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Card */}
          {!loading && legs.length > 0 && (
            <div className="px-6 py-6 bg-[#F7F7F7] border-t border-[#EBEBEB]">
              <h4 className="text-xs font-bold text-[#767676] uppercase tracking-widest mb-4">
                {t("summaryTitle")}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-[#EBEBEB] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#FF5A5F]/30 transition-colors">
                  <span className="text-xl font-bold text-[#484848] tracking-tight">
                    {totalDistance.toFixed(0)}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#767676] mt-1">
                    {t("totalKm")}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#EBEBEB] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#00A699]/30 transition-colors">
                  <span className="text-xl font-bold text-[#484848] tracking-tight">
                    {totalTime >= 60
                      ? `${Math.floor(totalTime / 60)}${t("time.h")} ${totalTime % 60}${t("time.m")}`
                      : `${Math.floor(totalTime)}${t("time.m")}`}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#767676] mt-1">
                    {t("totalTime")}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#EBEBEB] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#FF5A5F]/30 transition-colors">
                  <span className="text-xl font-bold text-[#FF5A5F] tracking-tight">
                    ₹{totalCost}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#FF5A5F]/70 mt-1">
                    {t("estCost")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-red-600 text-sm p-6">{error}</div>}
        </>
      )}
    </div>
  );
}
