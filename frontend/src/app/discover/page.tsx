"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Star, Heart, Compass, Sparkles, Search, SlidersHorizontal, ArrowRight, ArrowRightCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DiscoveryItem {
  id?: string;
  name: string;
  image?: string;
  type?: string;
  rating?: string;
  location?: string;
  description?: string;
  price?: string | number;
}

export default function Discover() {
  const [city, setCity] = useState("Goa")
  const [tempCity, setTempCity] = useState("Goa")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("hostels")
  const [items, setItems] = useState<DiscoveryItem[]>([])

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      let endpoint = activeTab;
      if (activeTab === "hostels") endpoint = "discover/hostels";
      else if (activeTab === "restaurants") endpoint = "discover/restaurants";
      else if (activeTab === "popular") endpoint = "discover/popular";
      
      const res = await fetch(`${apiUrl}/${endpoint}${activeTab !== "popular" ? `?city=${city}` : ""}`)
      const data = await res.json()
      
      if (activeTab === "popular") {
        setItems(data.places || [])
      } else {
        setItems(data[activeTab] || [])
      }
    } catch (err) {
      console.error("Discovery search error:", err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, city]);

  useEffect(() => {
    handleSearch()
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Soft Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-red-50/20 via-white to-teal-50/10" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* 1. DISCOVERY HEADER */}
        <section className="mb-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF385C]/5 border border-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Featured Destinantions
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-tight text-[#222222]">
                Explore <span className="text-[#FF385C] cursor-pointer hover:underline" onClick={() => {
                  const newCity = prompt("Enter Target City:", city);
                  if (newCity) setCity(newCity);
                }}>{city}</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Discover exceptional stays and curated experiences across India's most iconic landscapes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. DISCOVERY CATEGORIES */}
        <section>
          <Tabs defaultValue="hostels" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
              <TabsList className="bg-gray-100/50 p-1.5 h-auto rounded-2xl border border-gray-100 overflow-x-auto max-w-full">
                <TabsTrigger value="popular" className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#FF385C] data-[state=active]:shadow-sm transition-all">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="hostels" className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#FF385C] data-[state=active]:shadow-sm transition-all">
                  Stays
                </TabsTrigger>
                <TabsTrigger value="restaurants" className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#FF385C] data-[state=active]:shadow-sm transition-all">
                  Dining
                </TabsTrigger>
                <TabsTrigger value="ai" className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-[#00A699] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all group">
                  <Sparkles className="h-3.5 w-3.5 mr-2 inline-block group-data-[state=active]:animate-pulse" />
                  AI Assist
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FF385C] transition-colors" />
                    <Input 
                      className="h-14 pl-14 pr-6 rounded-2xl bg-white border-gray-200 font-medium text-sm focus:ring-4 focus:ring-[#FF385C]/5 transition-all shadow-sm" 
                      placeholder="Search regions..." 
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setCity(tempCity)}
                    />
                 </div>
                 <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
                    <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                 </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[450px] rounded-3xl bg-gray-50 animate-pulse border border-gray-100 overflow-hidden relative" />
                  ))}
                </motion.div>
              ) : activeTab === "ai" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12"
                  >
                      <div className="max-w-3xl mx-auto p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group text-[#222222]">
                          <div className="space-y-8 text-center relative z-10">
                              <div className="w-20 h-20 bg-[#00A699]/10 border border-[#00A699]/20 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
                                 <Sparkles className="h-10 w-10 text-[#00A699]" />
                              </div>
                              <div className="space-y-3">
                                 <h3 className="text-3xl font-bold tracking-tight">AI Travel Assistant</h3>
                                 <p className="font-medium text-gray-500 text-lg leading-relaxed">
                                   Tell us what you're looking for, and we'll find the perfect spots in {city}.
                                 </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                  <input 
                                      placeholder="e.g. Quiet mountain retreats, spicy street food..."
                                      className="flex-1 h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-medium text-base shadow-sm focus:ring-4 focus:ring-[#00A699]/5 outline-none"
                                      id="pref-input"
                                  />
                                  <Button 
                                      onClick={async () => {
                                          setLoading(true);
                                          const pref = (document.getElementById('pref-input') as HTMLInputElement).value;
                                          try {
                                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                                              const res = await fetch(`${apiUrl}/ai/recommend`, {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ preferences: pref, location: city })
                                              });
                                              const data = await res.json();
                                              setItems((data.recommendations || []).map((r: any) => ({
                                                  name: r.name,
                                                  description: r.reason,
                                                  type: r.popularity + " Popularity",
                                                  location: city,
                                                  price: "N/A"
                                              })));
                                              setActiveTab("results"); 
                                          } catch (e) {
                                              console.error(e);
                                          } finally {
                                              setLoading(false);
                                          }
                                      }}
                                      className="h-16 bg-[#00A699] hover:bg-[#008C82] text-white font-bold rounded-2xl px-10 text-base transition-all active:scale-[0.98]"
                                  >
                                      Find Experiences
                                  </Button>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05, duration: 0.8 }}
                        className="group cursor-pointer"
                      >
                        <div className="flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500">
                          {/* Image Layer */}
                          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <img 
                              src={item.image || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800`} 
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Favorite Button */}
                            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-900 hover:scale-110 transition-transform active:scale-90">
                              <Heart className="h-5 w-5" />
                            </button>
                            
                            {/* Tags on Hover */}
                            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                               <Button className="w-full bg-white text-[#222222] font-bold rounded-xl h-12 shadow-xl hover:bg-[#FF385C] hover:text-white transition-all">
                                  View Details
                               </Button>
                            </div>
                          </div>

                          {/* Content Overlay */}
                          <div className="pt-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-base font-bold text-[#222222] truncate pr-4">{item.name}</h3>
                                <div className="flex items-center gap-1 font-semibold text-xs text-[#222222]">
                                  <Star className="h-3.5 w-3.5 fill-[#222222]" /> {item.rating || "4.9"}
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 font-medium mb-3 line-clamp-1">
                              {item.description || "Premium experience in " + city}
                            </p>

                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-base font-bold text-[#222222]">₹{item.price || (activeTab === "hostels" ? "4,500" : "2,200")} <span className="text-sm font-medium text-gray-500">/ night</span></span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                  {item.type || (activeTab === "hostels" ? "Guest Suite" : "Dining")}
                                </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </Tabs>
        </section>
      </div>

      {/* 3. CTA SECTION */}
      <section className="py-40 mt-32 bg-gray-50/50 border-t border-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
             <h2 className="text-5xl md:text-7xl font-extrabold text-[#222222] tracking-tighter leading-tight">
               Discover your next <br /><span className="text-[#FF385C] italic">adventure.</span>
             </h2>
             <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Connect with authentic culture and luxury across the diverse landscapes of Bharat.
             </p>
             <div className="flex justify-center pt-4">
               <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold rounded-2xl px-12 h-16 text-lg shadow-xl shadow-red-100 transition-all hover:scale-105 active:scale-[0.98]">
                 Start exploring now
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
