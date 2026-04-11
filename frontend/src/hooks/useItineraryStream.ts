'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface StreamProgress {
  step: number;
  total: number;
  message: string;
  percent: number;
}

export interface StreamState {
  /** Live progress update from the SSE stream */
  progress: StreamProgress | null;
  /** Final itinerary result once generation is complete */
  result: Record<string, unknown> | null;
  /** True while the stream is open */
  isStreaming: boolean;
  /** Error message if generation failed */
  error: string | null;
  /** Start streaming a new itinerary */
  startStream: (params: {
    city: string;
    days: number;
    budget?: string;
    interests?: string;
  }) => void;
  /** Abort the current stream */
  abort: () => void;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

/**
 * useItineraryStream
 * Custom React hook that opens an SSE connection to /api/ai/itinerary/stream
 * and provides real-time progress updates for the AI trip generation pipeline.
 *
 * Usage:
 *   const { progress, result, isStreaming, error, startStream } = useItineraryStream();
 */
export function useItineraryStream(): StreamState {
  const [progress, setProgress]       = useState<StreamProgress | null>(null);
  const [result,   setResult]         = useState<Record<string, unknown> | null>(null);
  const [isStreaming, setIsStreaming]  = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const abort = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => abort(), [abort]);

  const startStream = useCallback(({ city, days, budget = 'medium', interests = 'general' }: {
    city: string;
    days: number;
    budget?: string;
    interests?: string;
  }) => {
    // Close any existing stream
    abort();

    // Reset state
    setProgress(null);
    setResult(null);
    setError(null);
    setIsStreaming(true);

    const params = new URLSearchParams({
      city,
      days: String(days),
      budget,
      interests,
    });

    const url = `${API_BASE}/api/ai/itinerary/stream?${params.toString()}`;
    const es  = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('progress', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as StreamProgress;
        setProgress(data);
      } catch {
        console.warn('[SSE] Failed to parse progress event');
      }
    });

    es.addEventListener('result', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as Record<string, unknown>;
        setResult(data);
      } catch {
        console.warn('[SSE] Failed to parse result event');
      }
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    });

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { message: string };
        setError(data.message);
      } catch {
        setError('Connection lost. Please try again.');
      }
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    });

    // Handle native SSE errors (network drop, CORS, etc.)
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setError('Connection to the AI server was lost. Please try again.');
        setIsStreaming(false);
        eventSourceRef.current = null;
      }
    };
  }, [abort]);

  return { progress, result, isStreaming, error, startStream, abort };
}
