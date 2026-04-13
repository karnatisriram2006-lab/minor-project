"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCheck, UserX, Clock, Users, ShieldAlert } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navbar from "@/components/Navbar"

interface PendingRequest {
  _id: string
  createdAt: string
  requester: {
    name: string
    firebaseUid: string
    avatar?: string
    bio?: string
    interests?: string[]
    nationality?: string
  }
}

export default function ConnectionRequestsPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/connections/pending")
      setRequests(data)
    } catch (err) {
      console.error("Failed to fetch requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (requestId: string, action: 'accepted' | 'declined') => {
    setProcessingId(requestId)
    try {
      await api.put("/connections/respond", { requestId, action })
      // Optimistic update: remove from local state
      setRequests(prev => prev.filter(req => req._id !== requestId))
    } catch (err) {
      console.error(`Failed to ${action} request:`, err)
      alert(`Action failed. Please try again.`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#121212] pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FF5A5F]/10 rounded-xl">
              <Users className="h-6 w-6 text-[#FF5A5F]" />
            </div>
            <h1 className="text-3xl font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">
              Connection Requests
            </h1>
          </div>
          <p className="text-[#767676] dark:text-[#999]">
            Travelers who want to connect and plan journeys with you.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FF5A5F]/20 border-t-[#FF5A5F] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#767676]">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-12 text-center border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm"
          >
            <div className="w-20 h-20 bg-[#F7F7F7] dark:bg-[#222] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-[#BBBBBB]" />
            </div>
            <h2 className="text-xl font-bold text-[#484848] dark:text-[#E0E0E0] mb-2">All caught up!</h2>
            <p className="text-[#767676] dark:text-[#999] max-w-sm mx-auto">
              You don&apos;t have any pending connection requests right now. Explore the community to find new companions!
            </p>
            <Button 
                variant="premium" 
                className="mt-8 rounded-xl px-8"
                onClick={() => window.location.href = '/companions'}
            >
              Find Travelers
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  className="bg-white dark:bg-[#1A1A1A] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Avatar className="h-16 w-16 border-2 border-white dark:border-[#2A2A2A] shadow-sm">
                    <AvatarImage src={req.requester.avatar} />
                    <AvatarFallback className="bg-[#FF5A5F]/5 text-[#FF5A5F] font-bold text-xl">
                      {req.requester.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-[#484848] dark:text-[#E0E0E0] truncate">
                        {req.requester.name}
                      </h3>
                      {req.requester.nationality && (
                        <span className="px-2 py-0.5 bg-[#F7F7F7] dark:bg-[#222] text-[#767676] text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {req.requester.nationality}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#767676] dark:text-[#999] line-clamp-2 italic mb-3">
                      &quot;{req.requester.bio || "No bio yet"}&quot;
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {req.requester.interests?.slice(0, 3).map((interest, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-1 bg-white dark:bg-[#222] border border-[#EBEBEB] dark:border-[#333] rounded-lg text-[#767676]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => handleResponse(req._id, 'accepted')}
                      disabled={processingId === req._id}
                      className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-[#00A699] hover:bg-[#008C84] text-white font-bold gap-2 active:scale-95 transition-all shadow-sm"
                    >
                      {processingId === req._id ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button 
                      onClick={() => handleResponse(req._id, 'declined')}
                      disabled={processingId === req._id}
                      variant="ghost" 
                      className="flex-1 md:flex-none h-11 px-6 rounded-xl border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#767676] hover:bg-[#FFF1F2] hover:text-[#FF5A5F] hover:border-[#FF5A5F]/20 font-bold gap-2 active:scale-95 transition-all"
                    >
                      <UserX className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-[#EBEBEB] dark:border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#BBBBBB]">
             <ShieldAlert className="h-3 w-3" />
             <span>Only accept requests from travelers you trust.</span>
          </div>
          <p className="text-xs text-[#BBBBBB]">© 2026 YĀTRĀ Community Privacy Controls</p>
        </footer>
      </div>
    </div>
  )
}
