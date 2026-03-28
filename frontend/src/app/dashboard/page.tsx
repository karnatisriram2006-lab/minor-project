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
    <div className="max-w-[1600px] mx-auto p-6 md:p-12 pt-28 md:pt-32 space-y-12 bg-white text-[#222222] font-sans min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 w-full">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-gray-500">Trip Overview</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tight">Namaste, {displayName}</h1>
          <p className="text-gray-500 font-medium max-w-xl text-base">
            Your journey through the Golden Triangle is looking great. Check your latest updates below.
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-2 rounded-full border border-gray-200 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
          <span className="text-sm font-medium text-gray-600">Jaipur: 10:45 AM</span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* Center Content: AI Travel Assistant */}
        <div className="lg:col-span-8 space-y-8">
          <div className="airbnb-card p-0 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#FF385C]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[#222222]">AI Travel Assistant</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#FF385C] px-2 py-0.5 rounded-md border border-red-100">Live Help</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#222222]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  {msg.translation && (
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold text-[#FF385C]">{msg.translation}</span>
                    </div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-[#222222] text-white rounded-tr-sm" 
                        : "bg-gray-100 text-gray-800 rounded-tl-sm font-medium"
                    )}
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center gap-4 bg-white">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="Ask about local history, food, or tips..." 
                  className="w-full bg-gray-50 h-14 rounded-xl pl-6 pr-16 text-sm font-medium border border-gray-200 focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/10 transition-all text-[#222222] placeholder:text-gray-400"
                />
              </div>
              <Button className="h-14 w-14 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-md active:scale-90 transform transition-all group overflow-hidden">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Budget & Activities Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Budget Tracking */}
             <div className="airbnb-card space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#FF385C]">
                         <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                         <h4 className="text-lg font-bold text-[#222222]">Budget Activity</h4>
                         <p className="text-xs text-gray-500">Current Spending</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold text-[#222222]">₹45,200.00</span>
                      <span className="text-xs font-bold text-green-600">On Track</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "75%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-[#FF385C]" 
                      />
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed italic">
                      Most of your budget is allocated to heritage stays.
                   </p>
                </div>
             </div>

             {/* Itinerary Highlights */}
             <div className="airbnb-card space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#00A699] flex items-center justify-center text-white">
                         <Route className="h-6 w-6" />
                      </div>
                      <div>
                         <h4 className="text-lg font-bold text-[#222222]">Trip Progress</h4>
                         <p className="text-xs text-gray-500">Upcoming Highlights</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                   {[
                     { label: "Travel", val: "40%", color: "bg-[#FF385C]" },
                     { label: "Stays", val: "35%", color: "bg-[#00A699]" },
                     { label: "Excursions", val: "25%", color: "bg-gray-200" }
                   ].map(item => (
                     <div key={item.label} className="space-y-2">
                        <div className={cn("h-1 w-full rounded-full", item.color)} />
                        <p className="text-[10px] font-bold text-gray-400">{item.label}</p>
                        <p className="text-xs font-bold text-[#222222]">{item.val}</p>
                     </div>
                   ))}
                </div>

                <Button className="w-full h-10 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#222222] font-bold text-xs transition-all flex items-center justify-center gap-2">
                   <span>Details</span>
                </Button>
             </div>
          </div>
        </div>

        {/* Right Panel: Companions */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <div className="airbnb-card">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#222222]">Nearby Travelers</h3>
                <p className="text-xs text-gray-500 mt-1">Found based on your itinerary</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { name: "Aditi Rao", status: "Arriving in Jaipur tomorrow", tags: ["Foodie", "Photography"], match: "98%", avatar: "/avatars/aditi.jpg" },
                { name: "Rohan Mehta", status: "Exploring Amer Fort today", tags: ["Solo", "History"], match: "85%", avatar: "/avatars/rohan.jpg" },
                { name: "Sana Khan", status: "Looking for a yoga retreat", tags: ["Wellness"], match: "72%", avatar: "/avatars/sana.jpg" }
              ].map((companion, i) => (
                <div key={i} className="flex items-center gap-4 group/item cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all">
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                      <AvatarImage src={companion.avatar} />
                      <AvatarFallback className="bg-gray-100 text-[#FF385C] font-bold">{companion.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#222222] text-sm">{companion.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{companion.status}</p>
                    <div className="flex gap-2 mt-2">
                       {companion.tags.map(tag => (
                         <span key={tag} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{tag}</span>
                       ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover/item:text-[#FF385C]" />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-8 border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50">
              Find more people
            </Button>
          </div>

          {/* Goal Insight */}
          <div className="airbnb-card bg-[#FF385C] text-white border-none">
             <div className="text-center space-y-4 py-4">
                <Target className="h-10 w-10 text-white mx-auto" />
                <h4 className="text-2xl font-bold italic">Next Milestone</h4>
                <p className="text-sm font-medium text-white/90 px-4">
                   Visit 5 more landmarks in Jaipur to unlock your <span className="font-bold underline decoration-2 underline-offset-4">Explorer Badge</span>.
                </p>
                <Button className="w-full bg-white hover:bg-gray-100 text-[#FF385C] rounded-xl h-12 font-bold text-sm mt-4">
                   View Progress
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* The Journey Ahead Section */}
      <div className="space-y-12 pt-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-4">
           <div>
              <p className="text-sm font-bold text-[#FF385C] mb-2">Upcoming Schedule</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#222222]">Your Itinerary</h2>
           </div>
           <Button variant="outline" className="border-gray-200 text-gray-600 font-bold text-sm">
              View Full Planner
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* Day 1 Section */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF385C] flex flex-col items-center justify-center font-bold border border-red-100">
                    <span className="text-[10px] uppercase opacity-80">OCT</span>
                    <span className="text-lg">14</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-[#222222]">The Pink City Dawn</h3>
                 </div>
              </div>
              
              <div className="space-y-6 relative pl-8 border-l border-gray-100">
                 {[
                   { time: "06:00", title: "Sunrise at Jal Mahal", desc: "Arrive early for the best view" },
                   { time: "09:30", title: "Guided Walk: Johari Bazaar", desc: "Local craft and jewelry tour" },
                   { time: "13:00", title: "Lunch at LMB", desc: "Classic Rajasthani flavors" }
                 ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex gap-6 group/item cursor-pointer relative"
                   >
                      <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-200 group-hover/item:border-[#FF385C] transition-all" />
                      <span className="text-sm font-bold text-gray-300 group-hover/item:text-[#FF385C] w-10">{item.time}</span>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-[#222222] group-hover/item:text-[#FF385C] transition-colors">
                          {item.title}
                        </p>
                        {item.desc && <p className="text-xs text-gray-400">{item.desc}</p>}
                      </div>
                   </motion.div>
                 ))}
              </div>

              <div className="h-64 rounded-3xl overflow-hidden border border-gray-100 shadow-sm group/img cursor-pointer">
                 <img 
                   src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80" 
                   alt="Jaipur Heritage" 
                   className="w-full h-full object-cover group-hover/img:scale-105 transition-all duration-700 ease-out"
                 />
              </div>
           </div>

           {/* Day 2 Section */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex flex-col items-center justify-center font-bold border border-gray-100">
                    <span className="text-[10px] uppercase opacity-80">OCT</span>
                    <span className="text-lg">15</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-[#222222]">Fortress Heights</h3>
                 </div>
              </div>

              <div className="space-y-6 relative pl-8 border-l border-gray-100">
                 {[
                   { time: "08:00", title: "Amer Fort Exploration", desc: "Recommended time: 3 hours" },
                   { time: "12:00", title: "Views from Nahargarh", desc: "Lunch with a panoramic view" }
                 ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex gap-6 group/item cursor-pointer relative"
                   >
                      <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-200 transition-all" />
                      <span className="text-sm font-bold text-gray-300 w-10">{item.time}</span>
                      <p className="text-base font-bold text-[#222222]">{item.title}</p>
                   </motion.div>
                 ))}
              </div>

              <div className="h-64 rounded-3xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                 <div className="text-center opacity-40">
                    <Clock className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                    <p className="font-bold text-lg text-[#222222]">More coming soon</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-16 pb-8 border-t border-gray-100 flex flex-col items-center gap-8">
         <div className="flex flex-wrap justify-center gap-10 text-xs font-bold text-gray-400">
            <span className="hover:text-[#FF385C] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#FF385C] cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-[#FF385C] cursor-pointer transition-colors">Support</span>
         </div>
         <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">© 2024 Luxury Travel Collective</p>
      </footer>
    </div>
  )
}
