"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-7xl space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl self-start sm:self-auto" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] p-5 space-y-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Main grid skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Chat skeleton */}
          <div className="xl:col-span-7 space-y-5">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden" style={{ height: '480px' }}>
              <div className="px-5 py-4 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className={`h-16 rounded-2xl ${i % 2 === 0 ? 'ml-auto w-3/4' : 'w-3/4'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar skeleton */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 rounded-lg" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary skeleton */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-lg" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="h-3 w-10 rounded" />
                      <Skeleton className="w-1.5 h-1.5 rounded-full" />
                      <Skeleton className="h-4 flex-1 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
