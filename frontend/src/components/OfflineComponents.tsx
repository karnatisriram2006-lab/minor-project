'use client';

import { useEffect, useState } from 'react';
import { X, RefreshCw, Check } from 'lucide-react';

/**
 * Component that shows update available notification
 * Allows user to reload and get new service worker version
 */
export function UpdateAvailableBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = (event: any) => {
      if (event.detail?.updateAvailable) {
        setShowBanner(true);
      }
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('sw-update-available', handleUpdateAvailable);
  }, []);

  const handleUpdate = () => {
    setIsReloading(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-blue-200 p-4 z-40">
      <div className="flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Update Available</h3>
          <p className="text-sm text-gray-600 mt-1">
            A new version of YĀTRĀ is ready!
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              disabled={isReloading}
              className="text-sm font-medium px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isReloading ? 'Updating...' : 'Update Now'}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-sm font-medium px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Component showing sync status and queue count
 */
export function SyncStatusIndicator() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      // This would integrate with your sync system
      const queue = localStorage.getItem('yatra_sync_queue');
      const count = queue ? JSON.parse(queue).length : 0;
      setQueueCount(count);
    };

    const handleSyncStart = () => {
      setIsSyncing(true);
    };

    const handleSyncComplete = () => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
      updateStatus();
    };

    updateStatus();
    window.addEventListener('app-sync-start', handleSyncStart);
    window.addEventListener('app-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('app-sync-start', handleSyncStart);
      window.removeEventListener('app-sync-complete', handleSyncComplete);
    };
  }, []);

  if (queueCount === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 text-sm z-40">
      {isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-gray-700">Syncing...</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            {queueCount} item{queueCount !== 1 ? 's' : ''} queued
            {lastSync && ` • Last sync: ${lastSync}`}
          </span>
        </>
      )}
    </div>
  );
}
