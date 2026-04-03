"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function CompanionsLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search panel skeleton */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm">
              <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Results skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] p-6 flex items-center gap-5">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-6 w-16 rounded-lg" />
                    ))}
                  </div>
                </div>
                <Skeleton className="w-24 h-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
