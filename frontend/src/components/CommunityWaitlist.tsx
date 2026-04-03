"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CommunityWaitlist() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed to join waitlist")
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-[#00A699]/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-[#00A699]" />
        </div>
        <p className="text-sm font-semibold text-[#484848]">You&apos;re on the list!</p>
        <p className="text-xs text-[#767676]">We&apos;ll notify you at {email} when Community launches.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-white/50 border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all"
          required
        />
      </div>
      {error && <p className="text-xs text-[#FF5A5F] font-medium">{error}</p>}
      <Button
        type="submit"
        variant="premium"
        disabled={loading}
        className="w-full h-12 rounded-xl text-sm font-semibold group transition-all active:scale-[0.97]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Join the waitlist
            <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}
