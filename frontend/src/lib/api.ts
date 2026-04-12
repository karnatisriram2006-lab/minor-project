import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { auth } from "@/lib/firebase"

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

const apiUrl = (rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl) + '/api';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Add a request interceptor to include the Firebase JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
