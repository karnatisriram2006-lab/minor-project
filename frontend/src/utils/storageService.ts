/**
 * Local Storage utilities for offline data persistence
 * Stores itinerary, trips, and sync queue for offline capability
 */

const STORAGE_KEYS = {
  CURRENT_ITINERARY: 'yatra_current_itinerary',
  SAVED_TRIPS: 'yatra_saved_trips',
  SYNC_QUEUE: 'yatra_sync_queue',
  OFFLINE_CACHE: 'yatra_offline_cache',
  LAST_SYNC: 'yatra_last_sync',
};

export const storageService = {
  /**
   * Save current itinerary to local storage
   */
  saveItinerary: (itinerary: any) => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_ITINERARY,
        JSON.stringify({
          data: itinerary,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    }
  },

  /**
   * Retrieve saved itinerary from local storage
   */
  getItinerary: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ITINERARY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve itinerary:', error);
      return null;
    }
  },

  /**
   * Clear cached itinerary
   */
  clearItinerary: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ITINERARY);
    } catch (error) {
      console.error('Failed to clear itinerary:', error);
    }
  },

  /**
   * Save a trip for offline access
   */
  saveTrip: (tripId: string, trip: any) => {
    try {
      const trips = storageService.getAllTrips() || {};
      trips[tripId] = {
        data: trip,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    } catch (error) {
      console.error('Failed to save trip:', error);
    }
  },

  /**
   * Get a specific trip
   */
  getTrip: (tripId: string) => {
    try {
      const trips = storageService.getAllTrips();
      return trips?.[tripId] || null;
    } catch (error) {
      console.error('Failed to retrieve trip:', error);
      return null;
    }
  },

  /**
   * Get all saved trips
   */
  getAllTrips: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to retrieve trips:', error);
      return {};
    }
  },

  /**
   * Add action to sync queue for when app goes back online
   */
  queueAction: (action: {
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: any;
  }) => {
    try {
      const queue = storageService.getSyncQueue() || [];
      queue.push({
        ...action,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  },

  /**
   * Get pending sync actions
   */
  getSyncQueue: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve sync queue:', error);
      return [];
    }
  },

  /**
   * Clear sync queue after successful sync
   */
  clearSyncQueue: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  },

  /**
   * Remove action from sync queue by ID
   */
  removeFromSyncQueue: (actionId: string) => {
    try {
      const queue = storageService.getSyncQueue() || [];
      const filtered = queue.filter((item: any) => item.id !== actionId);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  },

  /**
   * Update last sync timestamp
   */
  setLastSync: () => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  },

  /**
   * Get last sync timestamp
   */
  getLastSync: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to retrieve last sync timestamp:', error);
      return null;
    }
  },

  /**
   * Check localStorage availability
   */
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },
};

/**
 * Hook to sync queued actions when app comes back online
 */
export async function syncOfflineActions(fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  const queue = storageService.getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} offline actions...`);

  for (const action of queue) {
    try {
      const response = await fetch(action.endpoint, {
        method: action.type === 'delete' ? 'DELETE' : action.type === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.data),
      });

      if (response.ok) {
        storageService.removeFromSyncQueue(action.id);
        console.log(`Synced action: ${action.type} ${action.endpoint}`);
      } else {
        console.warn(`Failed to sync action: ${action.type} ${action.endpoint}`);
      }
    } catch (error) {
      console.error(`Error syncing action: ${action.type} ${action.endpoint}`, error);
    }
  }

  storageService.setLastSync();
}
