'use client'

import React from 'react'
import { Car, MapPin, Footprints, ChevronDown, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistance, formatDuration } from '@/utils/distance'
import type { MultiModeRoute } from '@/services/routeService'

interface ItineraryRouteProps {
  route: MultiModeRoute
  startName?: string
  endName?: string
}

export default function ItineraryRoute({ route, startName = 'Current Location', endName = 'Destination' }: ItineraryRouteProps) {
  const { driving, walkingLastMile, hasLastMile, totalDistance, totalDuration } = route

  return (
    <div className="w-full bg-white rounded-3xl border border-[#F3F4F6] p-6 shadow-sm font-sans">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-[#111827]">Route details</h3>
        <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          <span>{formatDistance(totalDistance)}</span>
          <span className="w-1 h-1 rounded-full bg-[#D1D5DB] mt-1.5" />
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      <div className="relative space-y-1">
        {/* Step 1: Start */}
        <div className="flex gap-5 relative group">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111827] group-hover:bg-[#E8391A] group-hover:text-white transition-colors duration-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="w-[1.5px] h-12 bg-gradient-to-b from-[#E5E7EB] to-[#F3F4F6] my-1" />
          </div>
          <div className="pt-2">
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Start</div>
            <div className="text-[15px] font-semibold text-[#111827] line-clamp-1">{startName}</div>
          </div>
        </div>

        {/* Step 2: Driving */}
        {driving && (
          <div className="flex gap-5 relative group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4] group-hover:bg-[#4285F4] group-hover:text-white transition-all duration-300 animate-in fade-in zoom-in">
                <Car className="w-5 h-5" />
              </div>
              <div className={`w-[1.5px] bg-gradient-to-b from-[#F3F4F6] to-[#E5E7EB] my-1 ${hasLastMile ? 'h-16' : 'h-12'}`} />
            </div>
            <div className="pt-1.5 pb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#4285F4]/10 text-[#4285F4] text-[9px] font-bold uppercase tracking-wider">Drive</span>
                <span className="text-[11px] font-medium text-[#6B7280]">{formatDistance(driving.distance)} • {formatDuration(driving.duration)}</span>
              </div>
              <div className="text-[13.5px] font-medium text-[#4B5563]">Drive towards main road access point</div>
              <div className="mt-2 text-[11.5px] font-semibold text-[#4285F4] flex items-center gap-1 cursor-default">
                Drive till here
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Walking (Optional Last Mile) */}
        {hasLastMile && walkingLastMile && (
          <div className="flex gap-5 relative group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white transition-all duration-300 animate-in fade-in zoom-in">
                <Footprints className="w-5 h-5" />
              </div>
              <div className="w-[1.5px] h-12 bg-gradient-to-b from-[#E5E7EB] to-[#F3F4F6] my-1" />
            </div>
            <div className="pt-1.5 pb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-bold uppercase tracking-wider">Walk</span>
                <span className="text-[11px] font-medium text-[#6B7280]">{formatDistance(walkingLastMile.distance)} • {formatDuration(walkingLastMile.duration)}</span>
              </div>
              <div className="text-[13.5px] font-medium text-[#4B5563]">Walk from road to exact destination</div>
              <div className="mt-2 text-[11.5px] font-semibold text-[#F59E0B] flex items-center gap-1 cursor-default">
                Walk from here
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Destination */}
        <div className="flex gap-5 relative group">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all duration-300">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2">
            <div className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-0.5">Destination</div>
            <div className="text-[15px] font-semibold text-[#111827] line-clamp-1">{endName}</div>
          </div>
        </div>
      </div>
      
      {hasLastMile && (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6] flex items-center gap-3"
         >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#F59E0B]">
               <Footprints className="w-4 h-4" />
            </div>
            <p className="text-[12px] text-[#4B5563] font-medium leading-normal">
               Vehicle access ends at the main road. <span className="text-[#111827] font-bold">Walk {formatDistance(walkingLastMile?.distance || 0)}</span> to reach the destination.
            </p>
         </motion.div>
      )}
    </div>
  )
}
