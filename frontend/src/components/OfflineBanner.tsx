"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Valid paths that are allowed to be viewed without an internet connection
    const offlineValidPaths = ["/offline", "/near-me", "/map", "/trip-planner"];
    const handleRedirect = () => {
      if (!offlineValidPaths.includes(window.location.pathname)) {
        window.location.href = "/offline";
      }
    };

    // Set initial state - check if already offline
    const isCurrentlyOnline = navigator.onLine;
    setIsOnline(isCurrentlyOnline);
    if (!isCurrentlyOnline) {
      setShowBanner(true);
      handleRedirect();
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide banner after 3 seconds when coming back online
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      handleRedirect();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
        isOnline ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
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
