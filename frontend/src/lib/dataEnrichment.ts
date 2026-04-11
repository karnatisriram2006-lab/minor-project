import { imageService } from "@/services/imageService";

/**
 * Hydrates a list of trips with high-quality destination images.
 * @param trips Array of trip objects from the backend
 */
export async function enrichTripsWithImages(trips: any[]) {
  if (!trips || !Array.isArray(trips)) return [];
  
  return Promise.all(trips.map(async (trip) => {
    // Determine the best query for the image (Title or Destination)
    const query = trip.destination || trip.title.split(' ')[0] || '';
    const image = await imageService.getPlaceImage(query);
    
    return {
      ...trip,
      placeImage: image
    };
  }));
}

/**
 * Hydrates a list of itinerary activities with imagery.
 */
export async function enrichActivitiesWithImages(activities: any[]) {
  if (!activities || !Array.isArray(activities)) return [];

  return Promise.all(activities.map(async (activity) => {
    // If it's a specific landmark or bazaar, search specifically for it
    const image = await imageService.getPlaceImage(activity.name);
    return {
      ...activity,
      placeImage: image
    };
  }));
}
