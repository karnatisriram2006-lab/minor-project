"use client"

import { useState, useEffect } from "react"
import { 
  Sparkles, 
  Clock, 
  Send, 
  MoreVertical, 
  Route, 
  Target, 
  Wallet
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { auth } from "@/lib/firebase"
import { User as FirebaseUser } from "firebase/auth"

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const displayName = user?.displayName?.split(" ")[0] || "Traveler"

  const [messages] = useState([
    { 
      role: 'assistant' as const, 
      text: "The Hawa Mahal was designed by Lal Chand Ustad. Would you like to hear about the architectural symbolism behind its 953 windows?",
      tags: ["Real-time Translation", "History Expert"]
    },
    { 
      role: 'user' as const, 
      text: "Yes, please. Also, how does this relate to the Rajput lifestyle of that era?" 
    },
    {
      role: 'assistant' as const,
      text: "Excellent question. The windows, or Jharokhas, allowed royal ladies to observe everyday life in the street below without being seen.",
      translation: "MARATHI TRANSLATION AVAILABLE"
    }
  ])

  return (
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at bottom left, #D4AF3720, transparent 40%)' }} />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-heritage-gold">Command Center</p>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none text-heritage-onyx italic">
               Namaste, <span className="text-heritage-saffron">{displayName}.</span>
            </h1>
            <p className="text-lg md:text-xl text-heritage-onyx/40 font-medium max-w-xl leading-relaxed">
              The Golden Triangle whispers its secrets. Your journey is evolving beautifully.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-heritage-bone/50 px-8 py-3 rounded-2xl border border-heritage-gold/10 flex items-center gap-4 shadow-soft-inner"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-heritage-saffron animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-heritage-onyx/60">Jaipur Presence: 10:45 AM</span>
          </motion.div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* AI Travel Assistant */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-8 space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-premium border border-heritage-gold/5">
              <div className="p-8 border-b border-heritage-bone flex items-center justify-between bg-heritage-bone/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-heritage-saffron/5 flex items-center justify-center text-heritage-saffron border border-heritage-saffron/10">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-heritage-onyx tracking-tight">AI Curator</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-heritage-onyx/40">Heritage Intelligence Active</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-heritage-gold hover:text-heritage-saffron hover:bg-heritage-saffron/5 transition-colors">
                  <MoreVertical className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth bg-gradient-to-b from-white to-heritage-bone/20">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3 ml-2">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-heritage-saffron">Response Alpha</span>
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] p-7 rounded-[1.8rem] text-sm md:text-base leading-relaxed font-medium shadow-premium transition-all hover:scale-[1.01]",
                      msg.role === 'user' 
                        ? "bg-heritage-onyx text-white rounded-tr-sm" 
                        : "bg-white text-heritage-onyx border border-heritage-gold/10 rounded-tl-sm"
                    )}>
                      {msg.text}
                      {msg.translation && (
                         <div className="mt-4 pt-4 border-t border-heritage-bone flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-heritage-saffron" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-heritage-onyx/40">{msg.translation}</span>
                         </div>
                      )}
                    </div>
                    {msg.role === 'assistant' && msg.tags && (
                      <div className="flex gap-2 mt-4 ml-2">
                        {msg.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-heritage-bone text-heritage-gold/60 px-3 py-1 rounded-full border border-heritage-gold/10">{tag}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border-t border-heritage-bone flex items-center gap-6 bg-white">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    placeholder="Converse with the horizon..." 
                    className="w-full bg-heritage-bone/50 h-20 rounded-[1.5rem] pl-8 pr-20 text-lg font-black text-heritage-onyx border-0 focus:ring-8 focus:ring-heritage-saffron/5 transition-all placeholder:text-heritage-onyx/20 shadow-soft-inner"
                  />
                </div>
                <Button variant="premium" className="h-20 w-20 rounded-[1.5rem] shadow-premium group relative overflow-hidden shrink-0">
                  <Send className="h-7 w-7 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Budget Context */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="bg-heritage-bone/30 rounded-[2.5rem] border border-heritage-gold/10 p-10 space-y-8 shadow-soft-inner"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-premium flex items-center justify-center text-heritage-saffron border border-heritage-gold/10">
                           <Wallet className="h-8 w-8" />
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-heritage-onyx tracking-tighter">Fiscal Flow</h4>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold">Real-time depletion</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-end">
                        <span className="text-4xl font-extrabold text-heritage-onyx tracking-tighter italic">₹45,200.00</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full border border-green-500/10 shadow-soft-inner">Synchronized</span>
                     </div>
                     <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden shadow-soft-inner p-1">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-heritage-saffron rounded-full shadow-premium" 
                        />
                     </div>
                     <p className="text-xs text-heritage-onyx/40 font-medium italic leading-relaxed">
                        Allocation favors architectural heritage stays in Jaipur.
                     </p>
                  </div>
               </motion.div>

               {/* Experience Matrix */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="bg-white rounded-[2.5rem] border border-heritage-gold/10 p-10 space-y-8 shadow-premium"
               >
                  <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-heritage-onyx flex items-center justify-center text-white shadow-premium">
                         <Route className="h-8 w-8" />
                      </div>
                      <div>
                         <h4 className="text-2xl font-black text-heritage-onyx tracking-tighter">Echo Loop</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold">Itinerary penetration</p>
                      </div>
                   </div>

                  <div className="grid grid-cols-3 gap-6 pt-4">
                     {[
                        { label: "Motion", val: "40%", color: "bg-heritage-saffron" },
                        { label: "Rest", val: "35%", color: "bg-heritage-gold" },
                        { label: "Lore", val: "25%", color: "bg-heritage-navy" }
                     ].map(item => (
                       <div key={item.label} className="space-y-3">
                          <div className={cn("h-1.5 w-full rounded-full transition-all duration-1000", item.color)} />
                          <p className="text-[9px] font-black uppercase tracking-widest text-heritage-gold/60">{item.label}</p>
                          <p className="text-lg font-black text-heritage-onyx italic">{item.val}</p>
                       </div>
                     ))}
                  </div>

                  <Button variant="outline" className="w-full h-14 rounded-[1.2rem] border-heritage-gold/10 text-heritage-onyx/40 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-heritage-bone transition-all shadow-soft-inner">
                     Analyze Full Matrix
                  </Button>
               </motion.div>
            </div>
          </motion.div>

          {/* Right Sidebar: Kindred Spirits */}
          <div className="xl:col-span-4 flex flex-col gap-12">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2.5rem] border border-heritage-gold/10 p-10 shadow-premium"
            >
              <div className="mb-10">
                <h3 className="text-2xl font-black text-heritage-onyx tracking-tighter">Kindred Spirits</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold mt-2">Resonance detected nearby</p>
              </div>

              <div className="space-y-8">
                {[
                  { name: "Aditi Rao", status: "Converging in Jaipur tomorrow", tags: ["Lore", "Light"], match: "98%", avatar: "AR" },
                  { name: "Rohan Mehta", status: "Scaling Amer Fort presently", tags: ["Solo", "Vigor"], match: "85%", avatar: "RM" },
                  { name: "Sana Khan", status: "Seeking silence in Yoga", tags: ["Still"], match: "72%", avatar: "SK" }
                ].map((companion, i) => (
                  <div key={i} className="flex items-center gap-6 group cursor-pointer">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-1 bg-heritage-saffron opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-md" />
                      <Avatar className="h-16 w-16 border-2 border-white shadow-premium rounded-2xl transition-transform group-hover:scale-110">
                        <AvatarFallback className="bg-heritage-bone text-heritage-saffron font-black text-sm">{companion.avatar}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-heritage-onyx text-base group-hover:text-heritage-saffron transition-colors">{companion.name}</h4>
                      <p className="text-[11px] text-heritage-onyx/40 font-medium line-clamp-1 italic mt-1">{companion.status}</p>
                      <div className="flex gap-2 mt-3">
                         {companion.tags.map(tag => (
                           <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-heritage-gold bg-heritage-bone px-3 py-1 rounded-full border border-heritage-gold/5 group-hover:bg-heritage-saffron/5 transition-colors">{tag}</span>
                         ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" className="w-full mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-heritage-gold/60 hover:text-heritage-saffron hover:bg-heritage-saffron/5 transition-all">
                The Horizon Awaits
              </Button>
            </motion.div>

            {/* Achievement Surface */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.6 }}
               className="bg-heritage-onyx rounded-[2.5rem] text-white p-12 space-y-8 shadow-premium relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
               <div className="text-center space-y-6 relative z-10">
                  <Target className="h-14 w-14 text-heritage-saffron mx-auto animate-pulse" />
                  <h4 className="text-3xl font-black italic tracking-tighter text-white">Ascension.</h4>
                  <p className="text-sm font-medium leading-relaxed text-white/80 px-2 italic">
                     Capture the spirit of 5 more landmarks to manifest your <span className="font-black underline decoration-heritage-saffron/50 underline-offset-8">Explorer Essence</span>.
                  </p>
                  <Button className="w-full bg-heritage-saffron hover:bg-heritage-saffron/90 text-white border-0 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-premium transition-all active:scale-95">
                     Claim Presence
                  </Button>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Chronological Flow */}
        <div className="space-y-16 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-heritage-gold/10 pb-10">
             <div className="space-y-3">
                <p className="text-[10px] font-black text-heritage-saffron uppercase tracking-[0.5em] mb-4">Temporal Thread</p>
                <h2 className="text-4xl md:text-6xl font-extrabold text-heritage-onyx tracking-tighter leading-none italic">The Path <span className="text-heritage-saffron underline decoration-heritage-saffron/20">Ahead.</span></h2>
             </div>
             <Button variant="premium" className="h-16 px-10 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-premium mb-2">
                Reveal Full Tapestry
             </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             {/* Chapter 1 */}
             <div className="space-y-12">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-heritage-onyx text-white flex flex-col items-center justify-center font-black shadow-premium border border-white/10 italic">
                      <span className="text-[8px] uppercase tracking-widest opacity-40">OCT</span>
                      <span className="text-2xl -mt-1">14</span>
                   </div>
                   <h3 className="text-3xl font-black text-heritage-onyx tracking-tighter">Dawn of the Pink City</h3>
                </div>
                
                <div className="space-y-12 relative pl-12 border-l-2 border-heritage-gold/10 ml-8">
                   {[
                     { time: "06:00", title: "Sunrise at Jal Mahal", desc: "Arrive before the mirror yields." },
                     { time: "09:30", title: "Guided Walk: Johari Bazaar", desc: "Witness the craft of the ancients." },
                     { time: "13:00", title: "Flavor Convergence", desc: "Rajasthani heritage on a plate." }
                   ].map((item, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, x: -10 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="flex gap-10 group relative"
                     >
                        <div className="absolute -left-[57px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-heritage-bone border-4 border-heritage-gold/20 group-hover:border-heritage-saffron transition-all duration-500 shadow-soft-inner group-hover:scale-125 select-none" />
                        <span className="text-xs font-black text-heritage-gold/40 group-hover:text-heritage-saffron w-12 pt-1 transition-colors">{item.time}</span>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-heritage-onyx group-hover:text-heritage-saffron transition-colors duration-500 italic">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-heritage-onyx/40 font-medium tracking-wide">{item.desc}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>

                <div className="h-72 rounded-[3.5rem] overflow-hidden border-4 border-white shadow-premium group cursor-pointer relative">
                   <div className="absolute inset-0 bg-heritage-saffron mix-blend-overlay opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                   <Image 
                     src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" 
                     alt="Jaipur Heritage" 
                     fill
                     className="object-cover group-hover:scale-110 transition-all duration-1000 ease-[0.16, 1, 0.3, 1]"
                   />
                </div>
             </div>

             {/* Chapter 2 */}
             <div className="space-y-12">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-heritage-bone text-heritage-gold flex flex-col items-center justify-center font-black shadow-soft-inner border border-heritage-gold/10 italic">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">OCT</span>
                      <span className="text-2xl -mt-1">15</span>
                   </div>
                   <h3 className="text-3xl font-black text-heritage-onyx/30 tracking-tighter">Ascending the Citadels</h3>
                </div>

                <div className="space-y-12 relative pl-12 border-l-2 border-heritage-gold/10 ml-8 opacity-40">
                   {[
                     { time: "08:00", title: "Amer Fort Exploration", desc: "3 hours of spatial wonder." },
                     { time: "12:00", title: "Nahargarh Vistas", desc: "Panoramic lunch above history." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-10 group relative">
                        <div className="absolute -left-[57px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-heritage-bone border-4 border-heritage-gold/10 shadow-soft-inner" />
                        <span className="text-xs font-black text-heritage-gold/40 w-12 pt-1">{item.time}</span>
                        <p className="text-xl font-bold text-heritage-onyx">{item.title}</p>
                     </div>
                   ))}
                </div>

                <div className="h-72 rounded-[3.5rem] bg-heritage-bone/30 flex items-center justify-center border-4 border-dashed border-heritage-gold/10 shadow-soft-inner group">
                   <div className="text-center space-y-6">
                      <Clock className="h-12 w-12 mx-auto text-heritage-gold/20 animate-pulse" />
                      <p className="font-black text-sm text-heritage-gold/40 uppercase tracking-[0.5em] italic">Visions in wait</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Collective Identity */}
        <footer className="pt-24 pb-12 border-t border-heritage-gold/10 flex flex-col items-center gap-12">
           <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold/40">
              <span className="hover:text-heritage-saffron cursor-pointer transition-colors">Privacy Lexicon</span>
              <span className="hover:text-heritage-saffron cursor-pointer transition-colors">Protocol</span>
              <span className="hover:text-heritage-saffron cursor-pointer transition-colors">The Council</span>
           </div>
           <p className="text-[9px] font-black text-heritage-onyx/20 tracking-[0.6em] uppercase italic">© 2024 Bharat Heritage Collective • Digital Resonance Phase IV</p>
        </footer>
      </div>
    </div>
  )
}
