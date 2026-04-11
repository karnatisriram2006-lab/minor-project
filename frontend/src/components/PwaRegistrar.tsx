'use client';

import { useEffect } from 'react';
import { syncOfflineActions } from '@/utils/storageService';

export default function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered successfully:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              console.log('[PWA] New service worker available');
              notifyUpdate();
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    };

    // Register on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Handle online event - sync offline changes
    const handleOnline = async () => {
      console.log('[PWA] App came online, syncing...');
      try {
        await syncOfflineActions(fetch);
        // Dispatch event for app-level sync
        window.dispatchEvent(new CustomEvent('app-sync-complete'));
      } catch (error) {
        console.error('[PWA] Sync error:', error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}

/**
 * Notify user that a new version of the app is available
 */
function notifyUpdate() {
  // Check if there's a notification API available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('YĀTRĀ Update Available', {
      body: 'A new version of the app is ready. Refresh to update.',
      icon: '/icon-192.svg',
      tag: 'update-notification',
      requireInteraction: true,
    });
  }

  // Dispatch custom event so app can show in-app update banner
  window.dispatchEvent(
    new CustomEvent('sw-update-available', {
      detail: { updateAvailable: true },
    })
  );
}

/**
 * Request notification permission
 */
export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    return;
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('[PWA] Notification permission granted');
      }
    });
  }
}

