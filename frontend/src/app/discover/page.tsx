"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Heart, Sparkles, Search, SlidersHorizontal, ArrowRightCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-40 pb-56 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767608, transparent 40%)' }} />

      <div className="container mx-auto px-6 relative z-10 space-y-24">
        
        {/* 1. DISCOVERY HEADER */}
        <section className="text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-heritage-saffron/5 border border-heritage-saffron/10 text-heritage-saffron text-[10px] font-black uppercase tracking-[0.4em] shadow-soft-inner">
              <Sparkles className="h-4 w-4" />
              Living Heritage
            </div>
            <h1 className="text-6xl md:text-[8rem] font-extrabold tracking-tighter leading-none text-heritage-onyx italic">
              Explore <span className="text-heritage-saffron underline decoration-heritage-saffron/20 cursor-pointer hover:decoration-heritage-saffron transition-all" onClick={() => {
                const newCity = prompt("Enter Target City:", city);
                if (newCity) setCity(newCity);
              }}>{city}.</span>
            </h1>
            <p className="text-xl md:text-2xl text-heritage-onyx/40 font-medium max-w-3xl mx-auto leading-relaxed">
              Unearth visceral experiences and sacred architectural gems across the diverse spirit of Bharat.
            </p>
          </motion.div>
        </section>

        {/* 2. DISCOVERY CATEGORIES */}
        <section>
          <Tabs defaultValue="hostels" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
              <TabsList className="bg-heritage-bone/50 p-2 h-auto rounded-[1.8rem] border border-heritage-gold/10 overflow-x-auto max-w-full shadow-soft-inner">
                <TabsTrigger value="popular" className="px-10 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] text-heritage-onyx/40 data-[state=active]:bg-white data-[state=active]:text-heritage-saffron data-[state=active]:shadow-premium transition-all duration-300">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="hostels" className="px-10 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] text-heritage-onyx/40 data-[state=active]:bg-white data-[state=active]:text-heritage-saffron data-[state=active]:shadow-premium transition-all duration-300">
                  Sanctuaries
                </TabsTrigger>
                <TabsTrigger value="restaurants" className="px-10 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] text-heritage-onyx/40 data-[state=active]:bg-white data-[state=active]:text-heritage-saffron data-[state=active]:shadow-premium transition-all duration-300">
                  Dining
                </TabsTrigger>
                <TabsTrigger value="ai" className="px-10 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] text-heritage-onyx/40 data-[state=active]:bg-heritage-saffron data-[state=active]:text-white data-[state=active]:shadow-premium transition-all duration-500 group">
                  <Sparkles className="h-4 w-4 mr-3 inline-block group-data-[state=active]:animate-pulse" />
                  AI Curator
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-6 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-96 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-heritage-gold/40 group-focus-within:text-heritage-saffron transition-colors" />
                    <Input 
                      className="h-20 pl-16 pr-8 rounded-[1.5rem] bg-heritage-bone/50 border-heritage-gold/10 font-black text-lg text-heritage-onyx focus:ring-8 focus:ring-heritage-saffron/5 transition-all shadow-soft-inner placeholder:text-heritage-onyx/20" 
                      placeholder="Search regions..." 
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setCity(tempCity)}
                    />
                 </div>
                 <Button variant="outline" size="icon" className="h-20 w-20 rounded-[1.5rem] border border-heritage-gold/10 hover:bg-white hover:shadow-premium transition-all">
                    <SlidersHorizontal className="h-6 w-6 text-heritage-onyx" />
                 </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[550px] rounded-[3rem] bg-heritage-bone/30 animate-pulse border border-heritage-gold/5 overflow-hidden" />
                  ))}
                </motion.div>
              ) : activeTab === "ai" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto"
                  >
                      <div className="p-16 bg-white rounded-[3.5rem] border border-heritage-gold/10 shadow-premium relative overflow-hidden group">
                          <div className="absolute inset-0 bg-heritage-saffron/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                          <div className="space-y-12 text-center relative z-10">
                              <div className="w-24 h-24 bg-heritage-saffron/5 border border-heritage-saffron/10 rounded-[2rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-soft-inner">
                                 <Sparkles className="h-12 w-12 text-heritage-saffron" />
                              </div>
                              <div className="space-y-6">
                                 <h3 className="text-4xl font-extrabold tracking-tighter text-heritage-onyx italic">Whispers of Bharat.</h3>
                                 <p className="font-medium text-heritage-onyx/40 text-xl leading-relaxed max-w-xl mx-auto">
                                   Share your spirit with us. We will conjure the exact landscapes that resonate with your journey in {city}.
                                 </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                                  <input 
                                      placeholder="e.g. Ancient ashrams, nomadic trails, visceral spices..."
                                      className="flex-1 h-20 bg-heritage-bone/50 border border-heritage-gold/10 rounded-[1.5rem] px-8 font-black text-lg text-heritage-onyx shadow-soft-inner focus:ring-8 focus:ring-heritage-saffron/5 outline-none placeholder:text-heritage-onyx/20"
                                      id="pref-input"
                                  />
                                  <Button 
                                      variant="premium"
                                      onClick={async () => {
                                          setLoading(true);
                                          const prefInput = document.getElementById('pref-input') as HTMLInputElement;
                                          const pref = prefInput?.value;
                                          try {
                                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                                              const res = await fetch(`${apiUrl}/ai/recommend`, {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ preferences: pref, location: city })
                                              });
                                              const data = await res.json();
                                              setItems(((data.recommendations || []) as { name: string; reason: string; popularity: string }[]).map((r) => ({
                                                  name: r.name,
                                                  description: r.reason,
                                                  type: r.popularity + " Resonance",
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
                                      className="h-20 px-12 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-premium"
                                  >
                                      Synchronize
                                  </Button>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (idx < 6 && (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="group cursor-pointer"
                      >
                        <div className="flex flex-col h-full rounded-[2.5rem] overflow-hidden transition-all duration-700">
                          {/* Image Layer */}
                          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-premium border-4 border-white">
                            <Image 
                              src={item.image || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800`} 
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-heritage-onyx/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            {/* Favorite Button */}
                            <button className="absolute top-6 right-6 w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md shadow-premium flex items-center justify-center text-heritage-onyx hover:scale-110 hover:bg-heritage-saffron hover:text-white transition-all active:scale-95 z-20">
                              <Heart className="h-6 w-6" />
                            </button>
                            
                            {/* Details Overlay */}
                            <div className="absolute bottom-10 left-10 right-10 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-20">
                               <Button variant="premium" className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl">
                                  Inhabit Experience
                               </Button>
                            </div>
                          </div>

                          {/* Content Overlay */}
                          <div className="pt-8 px-4 flex-1 flex flex-col space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-2xl font-black text-heritage-onyx tracking-tighter truncate leading-tight transition-colors group-hover:text-heritage-saffron duration-500">{item.name}</h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-heritage-bone rounded-full border border-heritage-gold/10 font-black text-[10px] text-heritage-onyx shadow-soft-inner shrink-0">
                                  <Star className="h-3 w-3 fill-heritage-onyx" /> {item.rating || "4.9"}
                                </div>
                            </div>
                            
                            <p className="text-sm text-heritage-onyx/40 font-medium line-clamp-2 italic leading-relaxed">
                              {item.description || "A visceral sanctuary calibrated for high-fidelity cultural immersion in " + city}
                            </p>

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-heritage-gold/5">
                                <div className="flex flex-col">
                                  <span className="text-xl font-black text-heritage-onyx italic tracking-tighter">₹{item.price || (activeTab === "hostels" ? "4,500" : "2,200")}<span className="text-[10px] font-black uppercase tracking-widest text-heritage-gold/60 ml-2 not-italic">/ night</span></span>
                                </div>
                                <div className="text-[10px] font-black text-heritage-gold/40 uppercase tracking-[0.3em] bg-heritage-bone/50 px-4 py-1.5 rounded-xl border border-heritage-gold/10 shadow-soft-inner">
                                  {item.type || (activeTab === "hostels" ? "Guest Suite" : "Heritage Dining")}
                                </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )))}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </Tabs>
        </section>
      </div>

      {/* 3. CTA SECTION */}
      <section className="py-60 mt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-heritage-bone" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, #76767610, transparent 70%)' }} />
        
        <div className="container mx-auto px-6 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
             <h2 className="text-6xl md:text-[9rem] font-extrabold text-heritage-onyx tracking-tighter leading-none italic">
               Manifest Your <br /><span className="text-heritage-saffron underline decoration-heritage-saffron/20">Wanderlust.</span>
             </h2>
             <p className="text-xl md:text-3xl text-heritage-onyx/40 font-medium max-w-3xl mx-auto leading-relaxed italic">
                Connect with authentic culture and sacred luxury across the diverse landscapes of Bharat.
             </p>
             <div className="flex justify-center pt-8">
               <Button variant="premium" className="px-20 h-24 rounded-[2rem] text-xl font-black uppercase tracking-[0.3em] shadow-premium hover:scale-105 transition-all active:scale-95 group">
                 Initialize Journey <ArrowRightCircle className="ml-6 h-8 w-8 group-hover:rotate-45 transition-transform duration-700" />
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Accents */}
      <footer className="footer bg-heritage-bone py-20 border-t border-heritage-gold/10">
         <div className="container mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-heritage-gold/40 uppercase tracking-[0.8em] italic">© 2024 Bharat Heritage Collective • Discovery Sequence Zero</p>
         </div>
      </footer>

    </div>
  )
}
