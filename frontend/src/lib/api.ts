import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { auth } from "@/lib/firebase"

// Extend axios config to support suppressing the global 401 redirect
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _suppressRedirect?: boolean;
    _authRetried?: boolean;
  }
}

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Dev-safe fallback: avoid HTTPS localhost certificate issues causing Axios "Network Error".
if (typeof window !== "undefined") {
  const isLocalFrontend =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalFrontend && /https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(rawApiUrl)) {
    rawApiUrl = rawApiUrl.replace(/^https:/i, "http:");
  }
}

// Strip any trailing slashes or /api segments completely
const cleanApiUrl = rawApiUrl.replace(/(?:\/api|\/)+$/, '');
const apiUrl = cleanApiUrl + '/api';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request interceptor: always attach a fresh Firebase token.
// Firebase caches the token and only refreshes when near expiry (~1hr),
// so this is fast and eliminates all 401 race conditions on page mount.
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const freshToken = await currentUser.getIdToken();
        if (config.headers) {
          config.headers.Authorization = `Bearer ${freshToken}`;
        }
        // Keep localStorage in sync for any code that reads it directly
        localStorage.setItem('token', freshToken);
      }
    } catch (e) {
      // If token fetch fails (e.g. user logged out), fall back to localStorage
      const cached = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (cached && config.headers) {
        config.headers.Authorization = `Bearer ${cached}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors (Unauthorized)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const request = error.config;
      const currentUser = auth.currentUser;

      // A cached Firebase token can be rejected after revocation or backend key changes.
      // Refresh it once before surfacing the unauthorized response.
      if (request && !request._authRetried && currentUser) {
        request._authRetried = true;
        try {
          const freshToken = await currentUser.getIdToken(true);
          request.headers.Authorization = `Bearer ${freshToken}`;
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', freshToken);
          }
          return api.request(request);
        } catch {
          // Keep the original 401 as the actionable failure.
        }
      }

      // Log the unauthorized error but do NOT auto-redirect.
      // Individual pages should handle auth state — the global redirect
      // was causing login loops when tokens weren't ready yet on mount.
      console.warn("API 401 Unauthorized:", error.config?.url, error.response.data);
    }
    return Promise.reject(error);
  }
);


export default api;
