"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Mail, User, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: POST to /api/contact
      await new Promise(r => setTimeout(r, 1000))
      setSent(true)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-sm text-[#767676] dark:text-[#888]">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#00A699]/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-[#00A699]" />
              </div>
              <h2 className="text-xl font-bold">Message sent!</h2>
              <p className="text-sm text-[#767676] dark:text-[#888]">We'll get back to you within 24 hours.</p>
              <Button onClick={() => { setSent(false); setName(""); setEmail(""); setMessage("") }} variant="outline" className="rounded-xl">
                Send another message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] text-sm font-medium text-[#484848] dark:text-[#E0E0E0]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] text-sm font-medium text-[#484848] dark:text-[#E0E0E0]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full h-32 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] dark:text-[#E0E0E0] placeholder:text-[#BBBBBB] transition-all p-4 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="premium"
                disabled={loading}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              >
                {loading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending...</div>
                ) : (
                  <div className="flex items-center gap-2"><Send className="h-4 w-4" />Send message</div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
