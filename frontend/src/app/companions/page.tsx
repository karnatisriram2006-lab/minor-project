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
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-tr from-red-50/20 via-white to-gray-50/10" />

      {!isAuthorized ? (
        <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-red-50 text-[#FF385C] w-24 h-24 rounded-3xl flex items-center justify-center shadow-sm border border-red-100"
           >
              <ShieldCheck className="h-10 w-10" />
           </motion.div>
           
           <div className="space-y-4">
             <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight text-[#222222]">Login Required</h2>
             <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
               Please sign in to your account to find and connect with travel companions.
             </p>
           </div>

           <Button 
             onClick={() => window.location.href = '/login'}
             className="h-14 px-10 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-3 group"
           >
             Sign In<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      ) : (
        <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-16">
        
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF385C]/5 text-[#FF385C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FF385C]/10 shadow-sm"
          >
            <Users className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-[#222222]">
               Travel <span className="text-[#FF385C]">Companions</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Find and connect with fellow travelers exploring the same destinations.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Create Request Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 lg:col-start-1"
          >
            <Card className="bg-white rounded-[2rem] border-gray-100 shadow-sm overflow-hidden h-fit sticky top-32">
              <CardHeader className="p-10 border-b border-gray-50">
                <CardTitle className="text-xl font-bold">Matching Tool</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase tracking-widest text-gray-400">Set your travel filters</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <form onSubmit={handleMatch} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF385C]" />
                      <Input 
                        placeholder="E.g. Ladakh" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-12 bg-white rounded-xl h-14 font-bold text-sm focus:ring-4 focus:ring-[#FF385C]/5 border-gray-100 transition-all placeholder:text-gray-300 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Travel Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF385C]" />
                      <Input type="date" className="pl-12 bg-white rounded-xl h-14 font-bold text-sm focus:ring-4 focus:ring-[#FF385C]/5 border-gray-100 transition-all shadow-sm" required />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Budget level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="budget-select" className="bg-white rounded-xl h-14 font-bold text-sm focus:ring-4 focus:ring-[#FF385C]/5 border-gray-100 transition-all px-5 shadow-sm">
                        <SelectValue placeholder="Budget Level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white text-[#222222]">
                        <SelectItem value="low" className="font-bold text-xs py-3">Backpacker</SelectItem>
                        <SelectItem value="medium" className="font-bold text-xs py-3">Comfort</SelectItem>
                        <SelectItem value="high" className="font-bold text-xs py-3">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-14 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         <span>Searching...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">Find Matches <Sparkles className="h-4 w-4" /></span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matches Panel */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-4"
            >
              <h2 className="text-2xl font-bold text-[#222222]">Suggested Companions</h2>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{matches.length} Travelers Online</span>
              </div>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="rounded-3xl border-gray-100 bg-white h-48 animate-pulse shadow-sm" />
                    ))}
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {matches.length > 0 ? matches.map((match, idx) => (idx < 5 && (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="bg-white rounded-[2rem] border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group shadow-sm relative text-[#222222]">
                          <div className="absolute top-8 right-8 bg-[#FF385C]/5 text-[#FF385C] px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#FF385C]/10 shadow-sm group-hover:bg-[#FF385C] group-hover:text-white transition-colors">
                            <Percent className="h-3 w-3" /> {match.similarityScore}% Match
                          </div>
                          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="relative">
                               <Avatar className="h-24 w-24 border-2 border-white shadow-md rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 relative z-10">
                                 <AvatarFallback className="text-2xl font-bold bg-[#FF385C]/5 text-[#FF385C]">
                                   {match.avatar}
                                 </AvatarFallback>
                               </Avatar>
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-[#222222]">{match.name}</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-gray-400">
                                  <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#FF385C]" /> {match.destination}</span>
                                  <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-[#FF385C]" /> {match.dates}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {(match.interests || []).map((interest: string, k: number) => (
                                  <span key={k} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-100 group-hover:bg-[#FF385C]/5 group-hover:text-[#FF385C] group-hover:border-[#FF385C]/10 transition-colors">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="md:self-center mt-4 md:mt-0">
                              <Button className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#222222] hover:bg-[#484848] text-white font-bold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95 group/btn">
                                <UserPlus className="h-4 w-4 mr-3" /> Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 group"
                      >
                        <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No companions found</p>
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
