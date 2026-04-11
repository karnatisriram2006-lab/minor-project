import { useEffect, useState } from 'react';
import { storageService } from '@/utils/storageService';

/**
 * Hook to manage itinerary persistence for offline access
 * Automatically saves to localStorage and loads from cache
 */
export function useOfflineItinerary(tripId?: string) {
  const [itinerary, setItinerary] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load itinerary from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const loadItinerary = () => {
      if (tripId) {
        const saved = storageService.getTrip(tripId);
        if (saved?.data) {
          setItinerary(saved.data);
          setIsSaved(true);
        }
      } else {
        // Load current/active itinerary
        const saved = storageService.getItinerary();
        if (saved?.data) {
          setItinerary(saved.data);
          setIsSaved(true);
        }
      }
      setIsLoading(false);
    };

    loadItinerary();
  }, [tripId]);

  // Save itinerary to localStorage
  const saveItinerary = (newItinerary: any) => {
    if (!storageService.isAvailable()) {
      console.warn('localStorage not available');
      return false;
    }

    try {
      if (tripId) {
        storageService.saveTrip(tripId, newItinerary);
      } else {
        storageService.saveItinerary(newItinerary);
      }
      setItinerary(newItinerary);
      setIsSaved(true);
      return true;
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      return false;
    }
  };

  // Clear itinerary from localStorage
  const clearItinerary = () => {
    try {
      storageService.clearItinerary();
      setItinerary(null);
      setIsSaved(false);
    } catch (error) {
      console.error('Failed to clear itinerary:', error);
    }
  };

  return {
    itinerary,
    saveItinerary,
    clearItinerary,
    isSaved,
    isLoading,
  };
}

/**
 * Hook for managing offline operations queue
 * Automatically syncs when app comes back online
 */
export function useOfflineQueue() {
  const [queuedItems, setQueuedItems] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Load queued items on mount
  useEffect(() => {
    const queue = storageService.getSyncQueue();
    setQueuedItems(queue);

    // Listen for update events
    const handleSync = () => {
      const updatedQueue = storageService.getSyncQueue();
      setQueuedItems(updatedQueue);
    };

    window.addEventListener('app-sync-complete', handleSync);
    return () => window.removeEventListener('app-sync-complete', handleSync);
  }, []);

  // Add new action to queue
  const queueAction = (action: any) => {
    storageService.queueAction(action);
    const queue = storageService.getSyncQueue();
    setQueuedItems(queue);
  };

  // Remove action from queue
  const removeFromQueue = (actionId: string) => {
    storageService.removeFromSyncQueue(actionId);
    const queue = storageService.getSyncQueue();
    setQueuedItems(queue);
  };

  return {
    queuedItems,
    queueAction,
    removeFromQueue,
    syncing,
    itemCount: queuedItems.length,
  };
}

/**
 * Hook to get storage quota information
 */
export function useStorageQuota() {
  const [quota, setQuota] = useState<any>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setQuota({
            usage: estimate.usage,
            quota: estimate.quota,
            percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
          });
        }
      });
    }
  }, []);

  return quota;
}
