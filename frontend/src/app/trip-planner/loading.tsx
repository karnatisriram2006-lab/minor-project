"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function TripPlannerLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] font-sans">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left panel skeleton */}
        <div className="w-full lg:w-[420px] xl:w-[480px] bg-white dark:bg-[#1A1A1A] border-r border-[#EBEBEB] dark:border-[#2A2A2A] flex flex-col">
          <div className="flex flex-col p-8 pt-0 sm:p-10 space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 rounded-xl" />
              <Skeleton className="h-4 w-56 rounded-lg" />
            </div>
            <div className="space-y-5">
              <Skeleton className="h-14 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#2A2A2A]">
              <Skeleton className="w-4 h-4 rounded shrink-0 mt-0.5" />
              <Skeleton className="h-3 flex-1 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right panel (map) skeleton */}
        <div className="flex-1 bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#FF5A5F] border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  )
}
