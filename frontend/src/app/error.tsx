'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl border border-[#EBEBEB] shadow-2xl p-10 text-center space-y-8"
      >
        <div className="w-20 h-20 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center mx-auto text-[#FF5A5F]">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-[#484848]">Something went wrong</h1>
          <p className="text-[#767676] text-sm leading-relaxed">
            We encountered an unexpected error while planning your journey. Don&apos;t worry, your data is safe.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-left overflow-auto max-h-32">
            <code className="text-[10px] text-red-600 break-all">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => reset()}
            variant="premium"
            className="flex-1 h-12 rounded-xl text-sm font-bold shadow-lg shadow-[#FF5A5F]/20 group"
          >
            <RefreshCcw className="mr-2 h-4 w-4 group-active:rotate-180 transition-transform" />
            Try again
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-sm font-bold border-[#EBEBEB] text-[#484848] hover:bg-[#F7F7F7]"
            >
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
