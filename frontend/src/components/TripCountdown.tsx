'use client'
interface Trip { destination: string; startDate?: string; duration: number; itinerary?: any }

export default function TripCountdown({ trips }: { trips: Trip[] }) {
  const upcoming = trips
    .filter(t => t.startDate && new Date(t.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())[0]

  if (!upcoming) return null

  const daysUntil = Math.ceil((new Date(upcoming.startDate!).getTime() - Date.now()) / 86400000)
  const stopsPlanned = upcoming.itinerary?.days?.flatMap((d: any) => d.stops || []).length || 0

  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
      <div className="text-center min-w-16">
        <div className="text-3xl font-semibold text-orange-500">{daysUntil}</div>
        <div className="text-xs text-muted-foreground">days to go</div>
      </div>
      <div className="flex-1">
        <div className="font-medium">{upcoming.destination} awaits</div>
        <div className="text-sm text-muted-foreground">
          {stopsPlanned} stops planned · {upcoming.duration} days total
        </div>
        {stopsPlanned < 3 && (
          <a href="/trip-planner" className="text-xs text-orange-500 hover:underline">
            Complete your itinerary →
          </a>
        )}
      </div>
    </div>
  )
}
