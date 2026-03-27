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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Aurora Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-aurora [animation-delay:-5s]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* 1. DISCOVERY HEADER */}
        <section className="mb-24">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Curation Engine v2.0
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
                Explore <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 cursor-pointer hover:underline" onClick={() => {
                  const newCity = prompt("Enter Target City:", city);
                  if (newCity) setCity(newCity);
                }}>{city}.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Unlock high-fidelity experiences across Bharat through our curated discovery mesh.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. DISCOVERY CATEGORIES */}
        <section>
          <Tabs defaultValue="hostels" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
              <TabsList className="bg-card/50 backdrop-blur-3xl p-2 h-auto rounded-[2rem] border border-border shadow-2xl glass-3d overflow-x-auto max-w-full">
                <TabsTrigger value="popular" className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl active:scale-95 transition-all cursor-pointer">
                  Popular Nodes
                </TabsTrigger>
                <TabsTrigger value="hostels" className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl active:scale-95 transition-all cursor-pointer">
                  Luxury Stays
                </TabsTrigger>
                <TabsTrigger value="restaurants" className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl active:scale-95 transition-all cursor-pointer">
                  Curated Dining
                </TabsTrigger>
                <TabsTrigger value="ai" className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-2xl active:scale-95 transition-all cursor-pointer group">
                  <Sparkles className="h-3.5 w-3.5 mr-2 inline-block group-data-[state=active]:animate-bounce" />
                  AI Scout
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      className="h-16 pl-14 pr-6 rounded-2xl bg-card border-border font-black text-sm uppercase tracking-widest focus:ring-4 focus:ring-primary/10 transition-all shadow-xl" 
                      placeholder="Search Matrix..." 
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setCity(tempCity)}
                    />
                 </div>
                 <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-2 border-border hover:bg-muted transition-all">
                    <SlidersHorizontal className="h-6 w-6" />
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
                    <div key={i} className="h-[520px] rounded-[4rem] bg-card/50 animate-pulse border border-border shadow-2xl overflow-hidden relative" >
                       <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
                    </div>
                  ))}
                </motion.div>
              ) : activeTab === "ai" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12"
                  >
                      <div className="max-w-3xl mx-auto p-16 bg-card rounded-[4rem] border border-border shadow-4xl glass-3d relative overflow-hidden group">
                          {/* Inner Aurora */}
                          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-aurora" />
                          
                          <div className="space-y-10 text-center relative z-10">
                              <div className="w-24 h-24 bg-accent/10 border border-accent/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-accent/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
                                 <Sparkles className="h-12 w-12 text-accent" />
                              </div>
                              <div className="space-y-4">
                                 <h3 className="text-4xl md:text-5xl font-black tracking-tighter italic">AI Recommendation Engine</h3>
                                 <p className="font-medium text-muted-foreground text-xl leading-relaxed">
                                   Define your parameters. Our neural scout will identify high-order nodes tailored to your preferences in {city}.
                                 </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                  <input 
                                      placeholder="e.g. Minimalist cafes, historic shrines, street art..."
                                      className="flex-1 h-20 bg-background/50 border border-border rounded-3xl px-8 font-black text-lg shadow-xl focus:ring-4 focus:ring-accent/10 outline-none placeholder:text-muted-foreground/30"
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
                                      size="xl"
                                      className="h-20 bg-accent hover:bg-teal-600 text-white font-black rounded-3xl shadow-3xl shadow-accent/30 transition-all hover:scale-[1.03] active:scale-95 px-12 text-lg uppercase tracking-widest"
                                  >
                                      Orchestrate Search
                                  </Button>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="group cursor-pointer"
                      >
                        <div className="relative h-[600px] rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-1000 hover:-translate-y-6 hover:shadow-primary/20 border border-border">
                          {/* Image Layer */}
                          <div className="absolute inset-0 bg-muted">
                            <img 
                              src={item.image || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800`} 
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-100 group-hover:opacity-90 grayscale-[0.2] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          </div>

                          {/* Top Actions */}
                          <div className="absolute top-8 right-8 z-10 flex flex-col gap-4">
                            <button className="w-16 h-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-3xl active:scale-90 cursor-pointer">
                              <Heart className="h-7 w-7" />
                            </button>
                            <button className="w-16 h-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all shadow-3xl active:scale-90 cursor-pointer">
                              <Compass className="h-7 w-7" />
                            </button>
                          </div>

                          {/* Content Overlay */}
                          <CardContent className="absolute bottom-0 left-0 right-0 p-12 text-white">
                            <div className="space-y-8">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl backdrop-blur-3xl border border-white/20",
                                  activeTab === "ai" ? "bg-accent/80" : "bg-primary/80"
                                )}>
                                  {item.type || (activeTab === "hostels" ? "Prime Sanctuary" : "Epicurean Node")}
                                </span>
                                <span className="bg-white/10 backdrop-blur-3xl text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-xl">
                                  <Star className="h-4 w-4 text-primary fill-primary" /> {item.rating || "4.9"}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none transition-colors italic group-hover:text-primary">{item.name}</h3>
                                <div className="flex items-center gap-3 text-white/50 font-black text-xs uppercase tracking-[0.3em] leading-none pt-2">
                                  <MapPin className="h-4 w-4 text-secondary animate-pulse" />
                                  {item.location || city}
                                </div>
                              </div>

                              <p className="text-lg font-medium text-white/60 line-clamp-2 leading-relaxed opacity-100 group-hover:text-white transition-colors duration-500">
                                {item.description}
                              </p>

                              <div className="pt-8 flex items-center justify-between border-t border-white/10">
                                <div className="flex flex-col">
                                  <span className="text-3xl font-black tracking-tighter leading-none">₹{item.price || (activeTab === "hostels" ? "4,500" : "2,200")}</span>
                                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 pt-1">/ {activeTab === "hostels" ? "Retreat" : "Orchestration"}</span>
                                </div>
                                <Button className="bg-white text-slate-950 font-black rounded-2xl h-14 px-8 hover:bg-primary hover:text-white transition-all group-hover:scale-105 active:scale-90 shadow-2xl">
                                   Explore Details <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
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
      <section className="py-60 mt-40 bg-slate-950 border-t border-white/5 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590326039160-8541a0640d98?auto=format&fit=crop&q=80&w=2400')] bg-cover bg-center opacity-30 grayscale contrast-[1.2]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
        
        <div className="absolute top-0 right-0 w-[60%] h-full bg-primary/20 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2 animate-aurora" />
        
        <div className="container mx-auto px-6 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
             <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]">
               Transcend the <br /><span className="text-primary italic">Everyday.</span>
             </h2>
             <p className="text-2xl text-white/50 font-medium max-w-3xl mx-auto leading-relaxed">
                Unlock the hidden dimensions of Bharat. Our curation engine identifies the precise nodes for your next high-order experience.
             </p>
             <div className="flex justify-center pt-8">
               <Button size="xl" className="bg-white hover:bg-primary hover:text-white text-slate-950 font-black rounded-[2rem] px-20 h-24 text-2xl shadow-4xl shadow-white/5 transition-all hover:scale-110 active:scale-95">
                 Begin Your Discovery
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
