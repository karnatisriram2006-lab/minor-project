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
import { cn } from "@/lib/utils"

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
    } catch (err: any) {
      console.error("Match error:", err)
      if (err.response?.status === 401) setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchInitial = async () => {
      if (!localStorage.getItem('token')) {
        setIsAuthorized(false)
        return
      }
      
      try {
        const res = await api.get("/companion/matches")
        setMatches(res.data)
        setIsAuthorized(true)
      } catch (err: any) {
        console.error("Initial fetch error:", err)
        if (err.response?.status === 401) setIsAuthorized(false)
      }
    }
    fetchInitial()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/20 pt-32 pb-48 relative overflow-hidden font-sans noise-overlay">
      
      {/* Aurora Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-aurora [animation-delay:-5s]" />
      </div>

      {!isAuthorized ? (
        <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-destructive/10 text-destructive w-32 h-32 rounded-[3.5rem] flex items-center justify-center shadow-2xl border border-destructive/20 relative group glow-primary"
           >
              <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full animate-pulse group-hover:bg-destructive/40 transition-all duration-700" />
              <ShieldCheck className="h-14 w-14 relative z-10" />
           </motion.div>
           
           <div className="space-y-6">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none text-white">Access <br /><span className="text-destructive text-transparent bg-clip-text bg-gradient-to-r from-destructive to-red-400">Restricted.</span></h2>
             <p className="text-xl text-white/40 font-medium max-w-lg mx-auto leading-relaxed">
               Neural synchronization requires a valid Identity Token. Please identify yourself to the India Matrix gateway to proceed.
             </p>
           </div>

           <Button 
             onClick={() => window.location.href = '/login'}
             className="h-20 px-12 rounded-[2rem] bg-[#0B1120] hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 border border-white/10 flex items-center gap-4 group"
           >
             Go to Login Portal <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      ) : (
        <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-20">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1120] text-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-primary/20 glow-primary"
          >
            <Users className="h-12 w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic text-white">
               Travel <br /><span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Companions.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
              Find high-order synchronized travelers across the India Matrix. Shared experiences modulated via neural matching.
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
            <Card className="bg-[#0B1120]/60 backdrop-blur-3xl rounded-[3.5rem] border-white/5 shadow-2xl glass-3d overflow-hidden h-fit sticky top-32 text-white">
              <CardHeader className="p-12 border-b border-white/5 space-y-2">
                <CardTitle className="text-3xl font-black tracking-tighter italic">Matching Engine</CardTitle>
                <CardDescription className="text-white/40 font-medium uppercase text-[10px] tracking-[0.3em]">Parameter Selection</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <form onSubmit={handleMatch} className="space-y-10">
                  <div className="space-y-4 relative group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-3 group-focus-within:text-primary transition-colors">Spatial Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                      <Input 
                        placeholder="E.g. Ladakh Matrix" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-16 bg-[#020617] rounded-3xl h-20 font-black text-lg focus:ring-4 focus:ring-primary/10 border-white/10 transition-all uppercase tracking-widest placeholder:text-white/20 text-white shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 relative group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-3 group-focus-within:text-primary transition-colors">Temporal Node</Label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                      <Input type="date" className="pl-16 bg-[#020617] rounded-3xl h-20 font-black text-lg focus:ring-4 focus:ring-primary/10 border-white/10 transition-all uppercase tracking-widest text-white shadow-inner [color-scheme:dark]" required />
                    </div>
                  </div>

                  <div className="space-y-4 relative group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-3 group-focus-within:text-primary transition-colors">Fiscal Tier</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="budget-select" className="bg-[#020617] rounded-3xl h-20 font-black text-lg focus:ring-4 focus:ring-primary/10 border-white/10 transition-all px-8 uppercase tracking-widest text-white shadow-inner">
                        <SelectValue placeholder="Budget Level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-white/10 shadow-2xl bg-[#0B1120] backdrop-blur-xl text-white">
                        <SelectItem value="low" className="font-black text-[10px] uppercase tracking-widest py-4 focus:bg-white/5 focus:text-white">Backpacker (Delta)</SelectItem>
                        <SelectItem value="medium" className="font-black text-[10px] uppercase tracking-widest py-4 focus:bg-white/5 focus:text-white">Comfort (Sigma)</SelectItem>
                        <SelectItem value="high" className="font-black text-[10px] uppercase tracking-widest py-4 focus:bg-white/5 focus:text-white">Luxury (Alpha)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-20 rounded-3xl bg-primary hover:bg-orange-600 text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-4">
                         <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                         <span>Scanning...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-3">Scan for Matches <Sparkles className="h-6 w-6" /></span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matches Panel */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-8"
            >
              <h2 className="text-4xl font-black tracking-tighter italic text-white">Detected Entities</h2>
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse glow-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{matches.length} Synchronized Travelers</span>
              </div>
            </motion.div>

            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="rounded-[4rem] border-white/5 bg-[#0B1120]/60 backdrop-blur-3xl h-64 animate-pulse shadow-2xl" />
                    ))}
                  </motion.div>
                ) : (
                  <div className="space-y-10">
                    {matches.length > 0 ? matches.map((match, idx) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-[#0B1120]/60 backdrop-blur-3xl rounded-[4rem] border-white/5 overflow-hidden hover:border-primary/20 hover:shadow-2xl transition-all duration-700 group glass-3d relative text-white">
                          <div className="absolute top-12 right-12 bg-primary/10 text-primary px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Percent className="h-4 w-4" /> {match.similarityScore}% Synchronicity
                          </div>
                          <CardContent className="p-12 flex flex-col xl:flex-row gap-12 items-center xl:items-start text-center xl:text-left">
                            <div className="relative">
                               <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 group-hover:bg-primary/40 transition-all duration-1000" />
                               <Avatar className="h-32 w-32 border-4 border-[#020617] shadow-2xl shrink-0 rounded-[2.5rem] overflow-hidden transition-all duration-1000 group-hover:scale-110 group-hover:rotate-3 relative z-10 font-black">
                                 <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white italic">
                                   {match.avatar}
                                 </AvatarFallback>
                               </Avatar>
                            </div>
                            
                            <div className="flex-1 space-y-8 pt-4">
                              <div className="space-y-4">
                                <h3 className="text-4xl font-black tracking-tighter leading-none italic group-hover:underline transition-all underline-offset-8 decoration-primary/30 text-white">{match.name}.</h3>
                                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8 mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 transition-colors group-hover:text-white/80">
                                  <span className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> {match.destination} Node</span>
                                  <span className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" /> {match.dates}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-center xl:justify-start gap-4 z-20 relative">
                                {(match.interests || []).map((interest: string, k: number) => (
                                  <span key={k} className="bg-white/5 text-white/60 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 border border-white/5 group-hover:border-primary/20 shadow-lg italic">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="xl:self-center mt-8 xl:mt-0 relative z-20">
                              <Button className="w-64 xl:w-auto h-20 px-12 rounded-[2rem] bg-[#0F172A] hover:bg-[#1E293B] text-primary hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 border border-white/10 group/btn">
                                <UserPlus className="h-5 w-5 mr-4 transition-transform group-hover/btn:rotate-12" /> Initial Handshake
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-[#0B1120]/40 backdrop-blur-3xl rounded-[4rem] border-2 border-dashed border-white/10 group"
                      >
                        <Users className="h-20 w-20 text-white/10 mx-auto mb-8 group-hover:scale-110 transition-transform" />
                        <p className="text-white/20 font-black uppercase tracking-[0.5em] text-xs">No Synchronicity Records Detected</p>
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
