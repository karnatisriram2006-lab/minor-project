'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Note: In production, substitute console.error with a Sentry instance
    // e.g., Sentry.captureException(error);
    console.error('[GlobalErrorBoundary] Caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#1A1A1A] max-w-md w-full rounded-3xl p-8 border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-2xl flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-[#FF5A5F] mb-6 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-[#484848] dark:text-[#E0E0E0] tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#767676] dark:text-[#888888] leading-relaxed mb-8">
              We encountered an unexpected error while loading this page. Our engineering team has been notified.
            </p>

            {/* Error Message Snippet (Dev only ideally, but good for diagnostics) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="w-full text-left bg-[#F7F7F7] dark:bg-[#0F0F0F] p-4 rounded-xl mb-8 overflow-x-auto border border-[#EBEBEB] dark:border-[#2A2A2A]">
                <p className="text-xs text-[#FF5A5F] font-mono leading-tight whitespace-pre-wrap">
                  {this.state.error?.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FF5A5F] hover:bg-[#E84060] text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-red-500/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Page
              </button>
              
              <Link href="/" className="flex-1">
                <button
                  className="w-full h-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#222222] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] text-[#484848] dark:text-[#E0E0E0] border-[1.5px] border-[#DDDDDD] dark:border-[#333333] rounded-xl font-bold transition-transform active:scale-95"
                >
                  <Home className="w-4 h-4 text-[#767676] dark:text-[#888888]" />
                  Home
                </button>
              </Link>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
