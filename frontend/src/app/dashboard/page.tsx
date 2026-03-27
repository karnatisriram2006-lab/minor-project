"use client"

import { useState, useEffect } from "react"
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Send, 
  MoreVertical, 
  Utensils, 
  Home, 
  Info,
  ChevronRight,
  Route,
  Target,
  Wallet
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
      role: 'assistant', 
      text: "The Hawa Mahal was designed by Lal Chand Ustad. Would you like to hear about the architectural symbolism behind its 953 windows?",
      tags: ["Real-time Translation", "History Expert"]
    },
    { 
      role: 'user', 
      text: "Yes, please. Also, how does this relate to the Rajput lifestyle of that era?" 
    },
    {
      role: 'assistant',
      text: "Excellent question. The windows, or Jharokhas, allowed royal ladies to observe everyday life in the street below without being seen.",
      translation: "MARATHI TRANSLATION AVAILABLE"
    }
  ])

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-12 space-y-12 bg-[#020617] text-white selection:bg-primary/20 font-sans noise-overlay min-h-screen">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-[#020617] via-[#0B1120] to-[#020617]">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-900/5 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-900/5 rounded-full blur-[120px] animate-pulse [animation-delay:-4s]" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 w-full">
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80">Strategic Overview</p>
          <h1 className="text-5xl md:text-6xl font-black font-serif text-white leading-tight italic">Namaste, {displayName}</h1>
          <p className="text-white/40 font-medium max-w-xl text-sm md:text-base">
            Your high-fidelity journey through the Golden Triangle is <span className="text-primary font-bold">85% optimized</span>. Explore your personalized logistical insights below.
          </p>
        </div>
        <div className="bg-[#0B1120]/60 backdrop-blur-3xl px-6 py-3 rounded-full shadow-2xl border border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          <span className="text-xs md:text-[13px] font-bold text-white/80">Jaipur Standard Time: 10:45 AM</span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* Center Content: Heritage Guide AI */}
        <div className="lg:col-span-8 space-y-8">
          <div className="heritage-card p-0 overflow-hidden flex flex-col h-[600px] border-white/10">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01] sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 glow-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black font-serif text-white italic">Heritage Guide AI</h3>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-sm border border-primary/20">Real-time Translation</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 text-white/50 px-2 py-0.5 rounded-sm border border-white/10">History Expert</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  {msg.translation && (
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-6 h-[1px] bg-primary/40" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{msg.translation}</span>
                    </div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "max-w-[85%] p-6 rounded-[2rem] shadow-2xl text-sm leading-relaxed border",
                      msg.role === 'user' 
                        ? "bg-[#1E293B] text-white rounded-tr-none border-white/10" 
                        : "bg-[#0B1120]/80 border-white/5 text-white/90 rounded-tl-none font-medium italic"
                    )}
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/5 flex items-center gap-4 bg-white/[0.01]">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="Ask about local history, customs, or hidden gems..." 
                  className="w-full bg-[#0B1120] h-16 rounded-2xl pl-8 pr-16 text-sm font-medium border border-white/10 shadow-inner focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-white placeholder:text-white/20"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 tracking-widest uppercase pointer-events-none">
                  AI Protocol V2
                </div>
              </div>
              <Button className="h-16 w-16 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-primary border border-white/10 shadow-2xl transform transition-all active:scale-90 hover:scale-[1.05] group overflow-hidden">
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </div>
          </div>

          {/* Fiscal & Capital Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Fiscal Setup */}
             <div className="heritage-card space-y-6 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-2xl">
                         <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                         <h4 className="text-xl font-black font-serif text-white italic leading-none">Fiscal Setup</h4>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Budget Thresholds</p>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" className="text-white/20 hover:text-primary transition-colors hover:bg-white/5">
                      <Target className="h-4 w-4" />
                   </Button>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-end">
                      <span className="text-3xl font-black font-serif text-white italic">₹45,200.00</span>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">+12% vs Standard</span>
                   </div>
                   <div className="w-full h-3 bg-[#020617] rounded-full overflow-hidden shadow-inner border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "75%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-orange-400" 
                      />
                   </div>
                   <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">
                      "Leveraged luxury tier allocation for heritage stay in Amber."
                   </p>
                </div>
             </div>

             {/* Capital Distribution */}
             <div className="heritage-card space-y-6 relative overflow-hidden group">
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl glow-primary">
                         <Route className="h-6 w-6" />
                      </div>
                      <div>
                         <h4 className="text-xl font-black font-serif text-white italic leading-none">Capital Distribution</h4>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Asset Allocation</p>
                      </div>
                   </div>
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0B1120] bg-white/10 text-white/50 text-[8px] font-black flex items-center justify-center">N{i}</div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 relative z-10">
                   {[
                     { label: "Logistics", val: "40%", color: "bg-primary" },
                     { label: "Heritage", val: "35%", color: "bg-white/20" },
                     { label: "Experiential", val: "25%", color: "bg-white/5" }
                   ].map(item => (
                     <div key={item.label} className="space-y-2">
                        <div className={cn("h-1 w-full rounded-full", item.color)} />
                        <p className="text-[9px] font-black uppercase tracking-tighter text-white/40">{item.label}</p>
                        <p className="text-xs font-black text-white leading-none">{item.val}</p>
                     </div>
                   ))}
                </div>

                <Button className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-white/5 text-primary/80 hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                   <Sparkles className="h-3 w-3 relative z-10" />
                   <span className="relative z-10">Run Optimization</span>
                </Button>
             </div>
          </div>
        </div>

        {/* Right Panel: Companion Matches & Strategy */}
        <div className="xl:col-span-4 flex flex-col gap-10">
          <div className="heritage-card group">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-black font-serif text-white italic leading-none">Companion Matches</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">Logistical Synergy</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-full shadow-2xl">4 New</span>
            </div>

            <div className="space-y-8">
              {[
                { name: "Aditi Rao", status: "Arriving in Jaipur tomorrow", tags: ["Foodie", "Photography"], match: "98%", avatar: "/avatars/aditi.jpg" },
                { name: "Rohan Mehta", status: "Exploring Amer Fort today", tags: ["Solo", "History"], match: "85%", avatar: "/avatars/rohan.jpg" },
                { name: "Sana Khan", status: "Looking for a yoga retreat", tags: ["Wellness"], match: "72%", avatar: "/avatars/sana.jpg" }
              ].map((companion, i) => (
                <div key={i} className="flex items-center gap-5 group/item cursor-pointer hover:translate-x-2 transition-all duration-300">
                  <div className="relative shrink-0">
                    <Avatar className="h-16 w-16 border-4 border-[#0B1120] shadow-2xl group-hover/item:border-primary transition-colors duration-500">
                      <AvatarImage src={companion.avatar} />
                      <AvatarFallback className="bg-white/5 text-white font-black text-lg">{companion.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#0B1120] shadow-xl">
                      {companion.match}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-base mb-1 tracking-tight truncate">{companion.name}</h4>
                    <p className="text-[11px] font-medium text-white/40 leading-tight mb-3 line-clamp-1 italic">{companion.status}</p>
                    <div className="flex flex-wrap gap-2">
                       {companion.tags.map(tag => (
                         <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-white/50 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">{tag}</span>
                       ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/10 group-hover/item:text-primary transition-colors" />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-10 h-16 rounded-2xl border-2 border-white/5 text-white/40 font-black text-[10px] uppercase tracking-[0.3em] hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
              Broaden Strategic Search
            </Button>
          </div>

          {/* Target/Goal Widget */}
          <div className="heritage-card bg-primary text-white p-12 flex flex-col items-center justify-center gap-8 overflow-hidden relative group/goal border-primary/20 glow-primary">
             <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#020617]/50 opacity-0 group-hover/goal:opacity-100 transition-opacity duration-1000" />
             <div className="absolute inset-0 border-[30px] border-white/5 rounded-full -m-16 group-hover/goal:scale-110 transition-transform duration-1000" />
             
             <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center relative z-10 box-content">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm animate-pulse">
                   <Target className="h-10 w-10 text-white" />
                </div>
             </div>

             <div className="text-center relative z-10 space-y-3">
                <h4 className="text-3xl font-black font-serif italic mb-2 tracking-tight">The Golden Goal</h4>
                <p className="text-xs font-medium text-white/70 leading-relaxed px-4 max-w-xs mx-auto">
                   Calibrate your sequence: Visit 5 heritage nodes in Jaipur to unlock <span className="text-white font-black italic">Royal Explorer Phase 1</span>.
                </p>
             </div>

             <Button className="w-full bg-[#020617] hover:bg-[#0B1120] text-white rounded-2xl h-16 font-black text-[10px] uppercase tracking-[0.3em] relative z-10 shadow-2xl transform transition-all active:scale-95 group/btn-goal overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover/btn-goal:translate-x-full transition-transform duration-700" />
                Track Logistical Progress
             </Button>
          </div>
        </div>
      </div>

      {/* The Journey Ahead Section */}
      <div className="space-y-16 pt-12 pb-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 gap-6">
           <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">Chronology</p>
              <h2 className="text-5xl md:text-6xl font-black font-serif text-white italic leading-none">The Journey Ahead</h2>
           </div>
           <Button variant="link" className="text-white font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 px-8 py-4 rounded-full shadow-2xl border border-white/10 hover:bg-primary hover:border-primary transition-all">
              Manifest Full Itinerary
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
           {/* Day 1 Section */}
           <div className="space-y-10 group/day">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 text-primary flex flex-col items-center justify-center shadow-2xl glow-primary">
                    <span className="text-[8px] font-black leading-none opacity-80">OCT</span>
                    <span className="text-lg font-black leading-none mt-1">14</span>
                 </div>
                 <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Strategic Sequence 01</span>
                    <h3 className="text-4xl font-black font-serif text-white mt-1">The Pink City Dawn</h3>
                 </div>
              </div>
              
              <div className="space-y-6 relative pl-8 border-l-2 border-white/10">
                 {[
                   { time: "06:00", title: "Sunrise at Jal Mahal", desc: "Best lighting for photographic telemetry" },
                   { time: "09:30", title: "Guided Heritage Walk: Johari Bazaar Protocol" },
                   { time: "13:00", title: "Rajasthani Gastronomy: LMB Deployment" }
                 ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex gap-8 group/item hover:translate-x-2 transition-transform cursor-pointer relative"
                   >
                      <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0B1120] border-4 border-white/20 group-hover/item:border-primary group-hover/item:scale-125 transition-all shadow-2xl" />
                      <span className="text-base font-black text-white/30 group-hover/item:text-primary transition-colors font-serif w-12">{item.time}</span>
                      <div className="space-y-1">
                        <p className="text-base font-black text-white group-hover/item:text-primary transition-colors tracking-tight">
                          {item.title}
                        </p>
                        {item.desc && <p className="text-xs font-medium text-white/40 italic group-hover/item:text-white/80 transition-colors">{item.desc}</p>}
                      </div>
                   </motion.div>
                 ))}
              </div>

              <div className="h-80 rounded-[2.5rem] bg-[#0B1120] overflow-hidden border border-white/10 group/img cursor-pointer shadow-2xl transform transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                 <img 
                   src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" 
                   alt="Jaipur Heritage" 
                   className="w-full h-full object-cover grayscale-[0.8] mix-blend-screen opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-1000 ease-out"
                 />
              </div>
           </div>

           {/* Day 2 Section */}
           <div className="space-y-10 group/day">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/60 flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-[8px] font-black leading-none opacity-60">OCT</span>
                    <span className="text-lg font-black leading-none mt-1">15</span>
                 </div>
                 <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Strategic Sequence 02</span>
                    <h3 className="text-4xl font-black font-serif text-white mt-1">Fortress Heights</h3>
                 </div>
              </div>

              <div className="space-y-6 relative pl-8 border-l-2 border-white/5">
                 {[
                   { time: "08:00", title: "Amer Fort: High-Altitude Logistics" },
                   { time: "12:00", title: "Nahargarh Fort: Panoramic Surveillance" }
                 ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group/item hover:translate-x-2 transition-transform cursor-pointer relative"
                  >
                     <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0B1120] border-4 border-white/10 group-hover/item:border-white/40 group-hover/item:scale-125 transition-all shadow-2xl" />
                     <span className="text-base font-black text-white/20 group-hover/item:text-white/60 transition-colors font-serif w-12">{item.time}</span>
                     <p className="text-base font-black text-white/60 group-hover/item:text-white transition-colors tracking-tight">{item.title}</p>
                  </motion.div>
                 ))}
              </div>

              <div className="h-80 rounded-[2.5rem] bg-[#0B1120]/40 backdrop-blur-3xl p-12 flex items-center justify-center border border-white/5 group/placeholder cursor-pointer overflow-hidden shadow-2xl relative glass-3d">
                 <div className="absolute inset-0 bg-primary/5 group-hover/placeholder:bg-primary/10 transition-colors duration-700" />
                 <div className="text-center relative z-10 opacity-40 group-hover/placeholder:opacity-100 group-hover/placeholder:scale-x-110 transition-all duration-700">
                    <Clock className="h-16 w-16 mx-auto mb-6 text-primary animate-pulse" />
                    <p className="font-serif italic font-black text-3xl text-white leading-none">Optimal Path Loading...</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-4">Real-time Telemetry Active</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="pt-24 pb-12 border-t border-white/5 flex flex-col items-center gap-10 relative z-10">
         <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
            <span className="hover:text-primary cursor-pointer transition-colors relative group/link">
               Privacy
               <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover/link:w-full" />
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors relative group/link">
               Terms
               <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover/link:w-full" />
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors relative group/link">
               Heritage Protocol
               <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover/link:w-full" />
            </span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-[1px] bg-white/10 mb-4" />
            <p className="text-[11px] font-black text-white/20 tracking-[0.5em]">MODERN HERITAGE COLLECTIVE</p>
            <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Digital Odyssey Series © 2024</p>
         </div>
      </footer>
    </div>
  )
}
