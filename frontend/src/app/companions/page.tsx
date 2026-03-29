"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Users, UserPlus, MapPin, Calendar, Percent, Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanionMatch {
  id: string;
  name: string;
  match: string;
  destination: string;
  avatar: string;
  similarityScore: number;
  dates: string;
  interests: string[];
}

export default function Companions() {
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<CompanionMatch[]>([])
  const [isAuthorized, setIsAuthorized] = useState(true)

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    
    try {
      const budget = (document.getElementById('budget-select') as HTMLSelectElement)?.value || "medium";
      const res = await api.post("/companion/match", { 
        destination,
        travelDate: (document.querySelector('input[type="date"]') as HTMLInputElement)?.value,
        budgetRange: budget,
        interests: "" 
      })
      setMatches(res.data.matches || res.data)
    } catch (err: unknown) {
      console.error("Match error:", err)
      const error = err as { response?: { status: number } };
      if (error.response?.status === 401) setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchInitial = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsAuthorized(false)
        return
      }
      
      try {
        const res = await api.get("/companion/matches")
        setMatches(res.data)
        setIsAuthorized(true)
      } catch (err: unknown) {
        console.error("Initial fetch error:", err)
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) setIsAuthorized(false)
      }
    }
    fetchInitial()
  }, [])

  return (
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-40 pb-56 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767608, transparent 40%)' }} />

      {!isAuthorized ? (
        <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-16">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="bg-heritage-saffron/5 text-heritage-saffron w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-premium border border-heritage-gold/10"
           >
              <ShieldCheck className="h-12 w-12" />
           </motion.div>
           
           <div className="space-y-6">
             <h2 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-none text-heritage-onyx">Access <span className="text-heritage-saffron italic">Denied.</span></h2>
             <p className="text-xl md:text-2xl text-heritage-onyx/40 font-medium max-w-xl mx-auto leading-relaxed">
               Find your fellow wanderers by authenticating your presence in our digital heritage.
             </p>
           </div>

           <Button 
             onClick={() => window.location.href = '/login'}
             variant="premium"
             className="h-20 px-12 rounded-[1.5rem] text-lg font-black group shadow-premium"
           >
             Sign In<ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform ml-4" />
           </Button>
        </div>
      ) : (
        <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-24">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-heritage-saffron/5 text-heritage-saffron w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-heritage-gold/10 shadow-premium"
          >
            <Users className="h-10 w-10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-[7rem] font-extrabold tracking-tighter leading-none text-heritage-onyx">
               Soul <span className="text-heritage-saffron italic">Matches.</span>
            </h1>
            <p className="text-xl md:text-2xl text-heritage-onyx/40 font-medium max-w-3xl mx-auto leading-relaxed">
              Weave your story with others. Discover kindred spirits exploring the vast landscapes of Bharat.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Create Request Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 lg:col-start-1"
          >
            <Card variant="premium" className="overflow-hidden h-fit sticky top-40 bg-white">
              <CardHeader className="p-10 border-b border-heritage-bone bg-heritage-bone/30">
                <CardTitle className="text-2xl font-extrabold tracking-tight">Kinship Filters</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold">Calibrate your resonance</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleMatch} className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold/60 ml-2">Sacred Destination</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                      <Input 
                        placeholder="E.g. Spiti Valley" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-16 bg-heritage-bone/50 rounded-[1.5rem] h-20 font-black text-lg text-heritage-onyx focus:ring-8 focus:ring-heritage-saffron/5 border-heritage-gold/10 transition-all placeholder:text-heritage-onyx/20 shadow-soft-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold/60 ml-2">Temporal Alignment</Label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-heritage-saffron transition-transform group-focus-within:scale-110" />
                      <Input type="date" className="pl-16 bg-heritage-bone/50 rounded-[1.5rem] h-20 font-black text-lg text-heritage-onyx focus:ring-8 focus:ring-heritage-saffron/5 border-heritage-gold/10 transition-all shadow-soft-inner" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold/60 ml-2">Resonance Level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="budget-select" className="bg-heritage-bone/50 rounded-[1.5rem] h-20 font-black text-lg text-heritage-onyx focus:ring-8 focus:ring-heritage-saffron/5 border-heritage-gold/10 transition-all px-8 shadow-soft-inner border-0">
                        <SelectValue placeholder="Budget Level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.5rem] border-heritage-gold/10 shadow-premium bg-white">
                        <SelectItem value="low" className="font-black text-xs py-4 uppercase tracking-widest text-heritage-onyx/60">Backpacker (Free Spirit)</SelectItem>
                        <SelectItem value="medium" className="font-black text-xs py-4 uppercase tracking-widest text-heritage-onyx/60">Classic (Rooted)</SelectItem>
                        <SelectItem value="high" className="font-black text-xs py-4 uppercase tracking-widest text-heritage-onyx/60">Majestic (Royal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" variant="premium" className="w-full h-20 rounded-[1.5rem] text-lg font-black group shadow-premium" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-4">
                         <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                         <span className="text-xs uppercase tracking-[0.3em]">Scouring Horizons...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-black">
                         Synchronize <Sparkles className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matches Panel */}
          <div className="lg:col-span-8 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6"
            >
              <h2 className="text-3xl font-extrabold text-heritage-onyx tracking-tight">Kindred Spirits</h2>
              <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-heritage-bone border border-heritage-gold/10 shadow-soft-inner">
                 <div className="h-2 w-2 rounded-full bg-heritage-saffron animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold">{matches.length} Travelers Present</span>
              </div>
            </motion.div>

            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-52 rounded-[2.5rem] bg-heritage-bone/30 animate-pulse border-2 border-dashed border-heritage-gold/5" />
                    ))}
                  </motion.div>
                ) : (
                  <div className="space-y-8">
                    {matches.length > 0 ? matches.map((match, idx) => (idx < 5 && (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Card variant="premium" className="overflow-hidden bg-white group relative">
                          <div className="absolute top-10 right-10 bg-heritage-saffron/5 text-heritage-saffron px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-heritage-saffron/10 shadow-soft-inner group-hover:bg-heritage-saffron group-hover:text-white transition-all duration-500 z-20">
                            <Percent className="h-4 w-4" /> {match.similarityScore}% Resonance
                          </div>
                          
                          <CardContent className="p-10 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative z-10">
                            <div className="relative shrink-0">
                               <div className="absolute -inset-2 bg-gradient-to-tr from-heritage-saffron to-heritage-gold rounded-[2rem] opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
                               <Avatar className="h-32 w-32 border-4 border-white shadow-premium rounded-[2.2rem] overflow-hidden transition-all duration-700 group-hover:scale-105 group-hover:rotate-2 relative z-10">
                                 <AvatarFallback className="text-3xl font-black bg-heritage-bone text-heritage-gold uppercase tracking-tighter">
                                   {match.avatar}
                                 </AvatarFallback>
                               </Avatar>
                            </div>
                            
                            <div className="flex-1 space-y-6 pt-2">
                              <div className="space-y-2">
                                <h3 className="text-3xl font-black text-heritage-onyx tracking-tighter group-hover:text-heritage-saffron transition-colors duration-500">{match.name}</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-heritage-gold/40">
                                  <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-heritage-bone border border-heritage-gold/5"><MapPin className="h-4 w-4 text-heritage-saffron" /> {match.destination}</span>
                                  <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-heritage-bone border border-heritage-gold/5"><Calendar className="h-4 w-4 text-heritage-saffron" /> {match.dates}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {(match.interests || []).map((interest: string, k: number) => (
                                  <span key={k} className="bg-heritage-bone/50 text-heritage-onyx/60 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] border border-heritage-gold/5 group-hover:bg-heritage-saffron/5 group-hover:text-heritage-saffron group-hover:border-heritage-saffron/10 transition-all duration-500">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="md:self-center mt-6 md:mt-0 xl:pl-10">
                              <Button variant="premium" className="w-full md:w-auto h-16 px-10 rounded-[1.2rem] text-xs font-black uppercase tracking-[0.3em] group/btn shadow-premium">
                                <UserPlus className="h-5 w-5 mr-4 group-hover/btn:scale-110 transition-transform" /> Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-heritage-bone/30 rounded-[3rem] border-4 border-dashed border-heritage-gold/10 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-heritage-gold/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                        <Users className="h-24 w-24 text-heritage-gold/20 mx-auto mb-8 relative z-10" />
                        <p className="text-heritage-gold/40 font-black uppercase tracking-[0.5em] text-xs relative z-10 italic">The horizon is silent</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
