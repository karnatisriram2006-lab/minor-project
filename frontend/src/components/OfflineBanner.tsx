"use client";

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Hide banner after 3 seconds when coming back online
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/90 text-white'
          : 'bg-red-500/90 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">You&apos;re back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">
            You&apos;re offline - some features may be limited
          </span>
        </>
      )}
    </div>
  );
}

