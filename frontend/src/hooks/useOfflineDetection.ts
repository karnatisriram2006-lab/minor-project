import { useState, useEffect } from 'react';

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set initial state based on navigator
    const online = typeof navigator !== 'undefined' && navigator.onLine;
    setIsOnline(online);
    setIsChecking(false);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Attempt to sync any pending data when coming back online
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('app-online'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('app-offline'));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isChecking };
}
