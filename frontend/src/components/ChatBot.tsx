"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm your YĀTRĀ travel assistant. Ask me anything about trip planning, destinations, or travel tips in India! 🇮🇳" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${apiUrl}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "bot", content: data.reply }])
    } catch (err: unknown) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to the network. Please try again in a moment." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button - Airbnb style */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-6 lg:right-6 z-[120] w-14 h-14 rounded-full bg-[#FF5A5F] text-white shadow-lg flex items-center justify-center cursor-pointer border-4 border-white overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Sparkles className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window - Airbnb Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] right-2 left-2 sm:left-auto lg:bottom-24 lg:right-6 z-[110] flex flex-col h-[480px] max-h-[calc(100dvh-12rem)] sm:w-[350px] bg-white rounded-2xl shadow-xl border border-[#EBEBEB] overflow-hidden"
          >
            {/* 1. CHAT HEADER */}
            <header className="px-5 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#FF385C]">
                     <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                     <h2 className="text-base font-bold text-[#222222]">Assistant</h2>
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#00A699] animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Help</span>
                     </div>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#222222]">
                  <X className="h-5 w-5" />
               </Button>
            </header>

            {/* 2. MESSAGES AREA */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white scroll-smooth"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[85%]",
                      m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                      m.role === "user" 
                        ? "bg-[#222222] text-white rounded-tr-none" 
                        : "bg-gray-100 text-[#222222] rounded-tl-none font-medium"
                    )}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex flex-col gap-2 mr-auto items-start max-w-[85%]">
                  <div className="px-6 py-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2 rounded-tl-none">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce" />
                     <div className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce delay-100" />
                     <div className="w-1.5 h-1.5 rounded-full bg-[#FF385C] animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. INPUT AREA */}
            <div className="p-6 bg-white border-t border-gray-50">
               <div className="relative group">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about culture, routes, or history..."
                    className="w-full h-14 bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/10 rounded-xl py-3 pl-5 pr-14 text-[14px] font-medium text-[#222222] transition-all placeholder:text-gray-400"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-md transition-all disabled:opacity-30"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
