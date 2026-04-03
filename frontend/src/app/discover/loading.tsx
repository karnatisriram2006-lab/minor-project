"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-12 w-80 rounded-xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
              <Skeleton className="w-full aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded-lg" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <div className="flex justify-between pt-2 border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
                  <Skeleton className="h-3 w-8 rounded" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
