// TypeScript types for the Tourism Map module

export interface TouristPlace {
    id: number
    name: string
    city: string
    state: string
    lat: number
    lng: number
    category: PlaceCategory
    description: string
    image: string
    rating: number
    visits: number
    bestTime: string
    entryFee: string
}

export type PlaceCategory =
    | "monument"
    | "heritage"
    | "beach"
    | "temple"
    | "fort"
    | "nature"
    | "spiritual"
    | "hostel"
    | "restaurant"
    | "emergency"

export interface ItineraryStop {
    name: string
    lat: number
    lng: number
    day?: number
    description?: string
    time?: string
}

export interface ItineraryDay {
    day: number
    activities: string[]
    stops?: ItineraryStop[]
}

export interface RouteStop {
    id: string
    name: string
    lat: number
    lng: number
    order: number
}

export interface HeatmapPoint {
    lat: number
    lng: number
    intensity: number
}

export interface FilterState {
    monuments: boolean
    heritage: boolean
    beaches: boolean
    temples: boolean
    hostels: boolean
    restaurants: boolean
    emergency: boolean
}

export const CATEGORY_ICONS: Record<string, { emoji: string; color: string; label: string }> = {
    monument: { emoji: "🏛️", color: "#7c3aed", label: "Monuments" },
    heritage: { emoji: "🏰", color: "#b45309", label: "Heritage" },
    beach: { emoji: "🏖️", color: "#0891b2", label: "Beaches" },
    temple: { emoji: "⛩️", color: "#dc2626", label: "Temples" },
    fort: { emoji: "🏯", color: "#92400e", label: "Forts" },
    nature: { emoji: "🌿", color: "#16a34a", label: "Nature" },
    spiritual: { emoji: "🕉️", color: "#f59e0b", label: "Spiritual" },
    hostel: { emoji: "🏠", color: "#2563eb", label: "Hostels" },
    restaurant: { emoji: "🍽️", color: "#ea580c", label: "Restaurants" },
    emergency: { emoji: "🚨", color: "#ef4444", label: "Emergency" },
}
