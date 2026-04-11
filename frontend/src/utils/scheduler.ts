/**
 * Utility to generate a time-based schedule for an itinerary.
 */

export interface ScheduledStop {
  id: string | number;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  placeImage?: string;
  lat: number;
  lng: number;
  index: number;
  cost?: number;
  schedule: {
    arrival: string;     // HH:mm format
    stayDuration: number; // in minutes
    departure: string;   // HH:mm format
    travelTime?: number; // travel time to NEXT stop in minutes
  };
}

const DEFAULT_STAY_TIMES: Record<string, number> = {
  monument: 60,
  temple: 30,
  park: 45,
  museum: 90,
  historical: 60,
  culture: 60,
  restaurant: 60,
  cafe: 45,
  shopping: 90,
  nature: 60,
  default: 40,
};

/**
 * Gets stay duration based on category or type
 */
export const getStayDuration = (typeOrCategory?: string): number => {
  if (!typeOrCategory) return DEFAULT_STAY_TIMES.default;
  
  const lower = typeOrCategory.toLowerCase();
  for (const [key, value] of Object.entries(DEFAULT_STAY_TIMES)) {
    if (lower.includes(key)) return value;
  }
  
  return DEFAULT_STAY_TIMES.default;
};

/**
 * Formats minutes from midnight to HH:mm string (AM/PM optional but here using 24h for calculations)
 */
const formatTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converts HH:mm string to minutes from midnight
 */
const parseTime = (timeStr: string): number => {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
};

/**
 * Generates schedule for a list of stops and travel times
 */
export const generateItinerarySchedule = (
  stops: any[],
  startTimeStr: string = "09:00",
  legDurations: number[] = [] // Duration in minutes between stop i and i+1
): ScheduledStop[] => {
  let currentTime = parseTime(startTimeStr);
  
  return stops.map((stop, i) => {
    const arrival = formatTime(currentTime);
    const stay = getStayDuration(stop.category || stop.type);
    const departure = formatTime(currentTime + stay);
    
    const travelTime = legDurations[i] || 0;
    
    // Update current time for NEXT stop's arrival
    // Arrival(i+1) = Departure(i) + Travel(i to i+1)
    const scheduledStop: ScheduledStop = {
      ...stop,
      schedule: {
        arrival,
        stayDuration: stay,
        departure,
        travelTime: i < stops.length - 1 ? travelTime : undefined
      }
    };
    
    currentTime += stay + travelTime;
    
    return scheduledStop;
  });
};
