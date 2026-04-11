'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Route, CheckCircle2, Loader2 } from 'lucide-react';
import type { StreamProgress } from '@/hooks/useItineraryStream';

interface GenerationProgressProps {
  progress: StreamProgress | null;
  isStreaming: boolean;
  error: string | null;
  city: string;
}

const STEPS = [
  { icon: Sparkles, label: 'Checking cache',        color: '#8B5CF6' },
  { icon: MapPin,   label: 'AI planning your trip', color: '#FF5A5F' },
  { icon: Route,    label: 'Geocoding locations',   color: '#F59E0B' },
  { icon: CheckCircle2, label: 'Optimising route',  color: '#10B981' },
];

export function GenerationProgress({ progress, isStreaming, error, city }: GenerationProgressProps) {
  if (!isStreaming && !error) return null;

  const currentStep = progress?.step ?? 0;
  const percent     = progress?.percent ?? 0;

  return (
    <AnimatePresence>
      {(isStreaming || error) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[#F3F4F6] bg-white shadow-xl shadow-black/5 p-6 space-y-6 w-full"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A5F] to-[#E84060] flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25">
              {error ? (
                <span className="text-white text-lg">!</span>
              ) : (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#111827] tracking-tight">
                {error ? 'Generation Failed' : `Planning your ${city} trip`}
              </p>
              <p className="text-[12.5px] text-gray-500 mt-0.5 leading-snug">
                {error || progress?.message || 'Initialising AI engine...'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {!error && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold text-[#FF5A5F]">{percent}%</span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5A5F] to-[#E84060]"
                  initial={{ width: '5%' }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Step Indicators */}
          {!error && (
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((step, idx) => {
                const stepNum  = idx + 1;
                const isDone   = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                const Icon     = step.icon;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{
                        background: isDone
                          ? '#D1FAE5'
                          : isActive
                          ? `${step.color}18`
                          : '#F9FAFB',
                        border: `1.5px solid ${isDone ? '#10B981' : isActive ? step.color : '#E5E7EB'}`,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Icon
                          className="w-4 h-4 transition-colors"
                          style={{ color: isActive ? step.color : '#9CA3AF' }}
                        />
                      )}
                    </motion.div>
                    <span
                      className="text-[9.5px] font-semibold leading-tight"
                      style={{ color: isDone ? '#10B981' : isActive ? step.color : '#9CA3AF' }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error retry hint */}
          {error && (
            <p className="text-[12px] text-gray-400 text-center">
              Check your connection or try a different city name.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
