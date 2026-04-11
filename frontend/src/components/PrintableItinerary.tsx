"use client"

import React from 'react';
import { Clock as ClockIcon, MapPin, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ItineraryStop {
  name: string;
  type?: string;
  category?: string;
  description?: string;
  time?: string;
  lat: number;
  lng: number;
  status?: string;
  schedule?: {
    arrival: string;
    stayDuration: number;
    departure: string;
    travelTime?: number;
  };
}

type ItineraryType = Record<string, ItineraryStop[]>;

interface PrintableItineraryProps {
  city: string;
  itinerary: ItineraryType | null;
  days: string;
}

export function PrintableItinerary({ city, itinerary, days }: PrintableItineraryProps) {
  const t = useTranslations("Print")
  if (!itinerary) return null;

  return (
    <div id="printable-itinerary-content" className="absolute opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto bg-white text-[#484848] font-sans w-[210mm] min-h-[297mm] print:relative print:left-0 print:top-0 left-[-9999px] top-[-9999px]">
      
      {/* ── Page 1/Cover & Intro Header ───────────────────────── */}
      <div className="p-16 border-b-2 border-[#EBEBEB]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#FF5A5F]/10 rounded-2xl flex items-center justify-center text-[#FF5A5F]">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold tracking-widest uppercase text-[#767676]">{t("personalizedItinerary")}</p>
        </div>
        
        <h1 className="text-6xl font-black text-[#484848] tracking-tighter leading-tight mb-4">
          {t("explore")} <span className="text-[#FF5A5F]">{city}</span>
        </h1>
        <p className="text-xl font-medium text-[#767676] max-w-lg">
          {t("journey", { days })}
        </p>
      </div>

      {/* ── The Itinerary Timeline ────────────────────────────── */}
      <div className="p-16 space-y-16">
        {Object.entries(itinerary).map(([day, activities]: [string, ItineraryStop[]], idx) => (
          <div key={day} className="relative">
            
            {/* Day Header */}
            <div className="flex items-center gap-6 mb-8 pb-4 border-b border-[#EBEBEB]">
              <div className="w-16 h-16 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                {idx + 1}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#484848] uppercase">{day.replace('Day', t('day'))}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-[#767676]" />
                  <p className="text-sm font-bold text-[#767676] uppercase tracking-wider">{city} {t("exploration")}</p>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-8 pl-8">
              {activities.map((act, aIdx) => (
                <div key={aIdx} className="relative pl-8 border-l-2 border-[#EBEBEB]">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#00A699]" />
                  
                  <div className="flex items-baseline gap-4 mb-2">
                    <div className="flex items-center gap-1.5 text-[#FF5A5F] font-bold shrink-0">
                      <ClockIcon className="h-4 w-4" />
                      <span>{act.schedule?.arrival || act.time} — {act.schedule?.departure || 'End'}</span>
                    </div>
                    {(act.category || act.type) && (
                      <span className="text-[10px] font-bold text-[#767676] bg-[#F7F7F7] px-2 py-0.5 rounded-md uppercase tracking-widest border border-[#EBEBEB]">
                        {act.category || act.type}
                      </span>
                    )}
                    {act.schedule?.stayDuration && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        {act.schedule.stayDuration} {t("minStay")}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#484848] mb-2 leading-snug">{act.name}</h3>
                  <p className="text-sm text-[#767676] leading-relaxed max-w-xl pb-4">{act.description}</p>

                  {/* Travel Indicator (PDF specific) */}
                  {act.schedule?.travelTime && aIdx < activities.length - 1 && (
                    <div className="mt-2 mb-6 py-2 px-4 rounded-lg bg-[#F7F7F7] border border-[#EBEBEB] inline-flex items-center gap-2">
                      <Compass className="h-3 w-3 text-[#FF5A5F]" />
                      <span className="text-[10px] font-bold text-[#767676] uppercase tracking-widest">
                        {act.schedule.travelTime} {t("travelToNext")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* ── Footer Branding ───────────────────────────────────── */}
      <div className="p-16 pt-8 text-center border-t border-[#EBEBEB] mt-16 bg-[#F7F7F7]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BBBBBB] mb-2">{t("generatedBy")}</p>
        <p className="text-xl font-black text-[#484848] tracking-widest">YĀTRĀ</p>
        <p className="text-xs text-[#767676] mt-2">{t("tagline")}</p>
      </div>

    </div>
  );
}
