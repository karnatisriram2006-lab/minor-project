"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Sparkles, MoreHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Namaste! I am your Heritage Guide AI. How may I assist your exploration of India's timeless treasures today?" }
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
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to the network. Please try again in a moment." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button - Heritage Styled */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-2xl bg-accent text-white shadow-soft-lg flex items-center justify-center cursor-pointer border-4 border-white transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Sparkles className="h-7 w-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window - Heritage Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 right-8 z-[90] flex flex-col h-[650px] w-[420px] bg-[#F8F6F3] rounded-[2.5rem] shadow-soft-xl border border-black/5 overflow-hidden"
          >
            {/* 1. CHAT HEADER */}
            <header className="px-8 py-8 border-b border-black/5 flex items-center justify-between bg-white relative">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-soft-md">
                     <Sparkles className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                     <h2 className="text-lg font-black font-serif text-primary italic">Heritage Guide AI</h2>
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Live Assistant</span>
                     </div>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary/20 hover:text-primary">
                  <X className="h-5 w-5" />
               </Button>
            </header>

            {/* 2. MESSAGES AREA */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-transparent"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-2 max-w-[85%]",
                      m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-6 py-4 rounded-[1.8rem] text-[15px] font-medium leading-relaxed shadow-soft-sm",
                      m.role === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white text-primary border border-black/5 rounded-tl-none italic"
                    )}>
                      {m.content}
                    </div>
                    {m.role === 'bot' && (
                       <span className="text-[8px] font-black uppercase tracking-widest text-primary/20 ml-4">Authorized Heritage Response</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex flex-col gap-2 mr-auto items-start max-w-[85%]">
                  <div className="px-8 py-4 rounded-[1.8rem] bg-white border border-black/5 shadow-soft-sm flex items-center gap-2 rounded-tl-none">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce delay-100" />
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. INPUT AREA */}
            <div className="p-8 bg-white border-t border-black/5">
               <div className="relative group">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about culture, routes, or history..."
                    className="w-full h-16 bg-[#F8F6F3] border border-black/5 focus:ring-2 ring-accent/20 rounded-2xl py-3 pl-6 pr-16 text-[15px] font-bold text-primary transition-all placeholder:text-primary/20"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-soft-sm transition-all disabled:opacity-30"
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
