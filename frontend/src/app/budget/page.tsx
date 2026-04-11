"use client"

import { useState, useMemo, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Info, Sparkles, IndianRupee, ArrowRight, MapPin, Plus, Trash2, History, TrendingUp, ChevronRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { destinationCosts, DestinationCost } from "@/data/destinationCosts"

const POPULAR_CITIES = ["Goa", "Jaipur", "Kerala", "Delhi", "Agra", "Varanasi", "Mumbai", "Ladakh", "Manali", "Udaipur"]

export default function BudgetOptimizer() {
  const t = useTranslations("Budget")
  const [mounted, setMounted] = useState(false)
  const [budget, setBudget] = useState<string>("50000")

  useEffect(() => {
    setMounted(true)
  }, [])
  const [city, setCity] = useState("Goa")
  const [duration, setDuration] = useState("3")
  const [allocation, setAllocation] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)

  // Tracker State
  const [trips, setTrips] = useState<any[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string>("")
  const [trackerData, setTrackerData] = useState<{
    budgetAllocation: any;
    actualSpend: any;
    expenses: any[];
  } | null>(null)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "food",
    description: ""
  })

  // Load Trips
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchTrips = async () => {
          try {
            const { data } = await api.get("/trips")
            setTrips(data.trips || [])
          } catch (err) {
            console.error("Failed to fetch trips:", err)
          }
        }
        fetchTrips()
      } else {
        setTrips([])
      }
    })
    return () => unsubscribe()
  }, [])

  // Load Tracker Data when Trip is selected
  useEffect(() => {
    if (!selectedTripId) {
      setTrackerData(null)
      return
    }
    const fetchTracker = async () => {
      const requestUrl = `/budget/trip/${selectedTripId}`;
      console.warn(`[Budget Diagnostic] Full Request URL: ${api.defaults.baseURL}${requestUrl}`);
      try {
        const { data } = await api.get(requestUrl)
        console.log(`[Budget] Received summary data:`, !!data);
        setTrackerData(data)
        // If trip already has a budget, update the optimizer views if they are empty
        if (data.budgetAllocation && !allocation) {
          setAllocation(data.budgetAllocation)
        }
      } catch (err) {
        console.error("Tracker fetch failed:", err)
      }
    }
    fetchTracker()
  }, [selectedTripId])

  const cityData = useMemo(
    () => destinationCosts.find(d => d.city.toLowerCase() === city.toLowerCase()),
    [city]
  )

  const estimatedRange = useMemo(() => {
    if (!cityData) return null
    const days = parseInt(duration) || 3
    const budgetLevel = parseInt(budget) > 20000 ? "luxury" : parseInt(budget) > 8000 ? "mid" : "budget"
    
    // Helper: split by hyphen first, then clean each part
    const parseRange = (str: string) => {
      const parts = str.split("-")
      const min = parseInt(parts[0].replace(/[₹,]/g, "").trim()) || 0
      const max = parts.length > 1 ? parseInt(parts[1].replace(/[₹,]/g, "").trim()) || min : min
      return { min, max }
    }

    const acc = parseRange(cityData.accommodation[budgetLevel])
    const food = parseRange(cityData.food[budgetLevel])
    const transport = parseRange(cityData.transport)
    const entry = parseRange(cityData.entryFees)
    
    const min = (acc.min + food.min + transport.min + entry.min) * days
    const max = (acc.max + food.max + transport.max + entry.max) * days
    return { min, max, city: cityData.city, notes: cityData.notes }
  }, [city, duration, budget, cityData])

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post("/budget/optimize", { totalBudget: Number(budget) })
      setAllocation(data.allocation)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToTrip = async () => {
    if (!selectedTripId || !allocation) return
    try {
      await api.post("/budget/save-target", { tripId: selectedTripId, allocation })
      const { data } = await api.get(`/budget/trip/${selectedTripId}`)
      setTrackerData(data)
    } catch (err) {
      console.error("Save target failed:", err)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTripId || !newExpense.amount) return
    try {
      await api.post("/budget/expense", {
        tripId: selectedTripId,
        amount: Number(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description
      })
      setNewExpense({ amount: "", category: "food", description: "" })
      setIsAddingExpense(false)
      // Refresh
      const { data } = await api.get(`/budget/trip/${selectedTripId}`)
      setTrackerData(data)
    } catch (err) {
      console.error("Add expense failed:", err)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.delete(`/budget/expense/${id}`)
      const { data } = await api.get(`/budget/trip/${selectedTripId}`)
      setTrackerData(data)
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const chartData = allocation ? [
    { name: t("categories.stay"), target: allocation.stay, actual: trackerData?.actualSpend?.stay || 0, color: "#3B82F6" },
    { name: t("categories.food"), target: allocation.food, actual: trackerData?.actualSpend?.food || 0, color: "#F59E0B" },
    { name: t("categories.transport"), target: allocation.transport, actual: trackerData?.actualSpend?.transport || 0, color: "#14B8A6" },
    { name: t("categories.ticketsShort"), target: allocation.tickets, actual: trackerData?.actualSpend?.tickets || 0, color: "#F97316" },
    { name: t("categories.misc"), target: allocation.emergency, actual: trackerData?.actualSpend?.emergency || 0, color: "#8B5CF6" },
  ] : []

  const pieData = allocation ? [
    { name: t("categories.stay"), value: allocation.stay, color: "#3B82F6" },
    { name: t("categories.food"), value: allocation.food, color: "#F59E0B" },
    { name: t("categories.transport"), value: allocation.transport, color: "#14B8A6" },
    { name: t("categories.tickets"), value: allocation.tickets, color: "#F97316" },
    { name: t("categories.emergency"), value: allocation.emergency, color: "#8B5CF6" },
  ] : []

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* Page header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Sparkles className="h-3.5 w-3.5" />
              {t("aiPowered")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">
            {t("title")} <span className="text-[#FF5A5F]">{t("subtitle")}</span>
          </h1>
          <p className="text-[#767676] dark:text-[#888] text-base max-w-xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden sticky top-28">
              <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
                <h2 className="text-base font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">{t("setupTracking")}</h2>
                <p className="text-xs text-[#767676] dark:text-[#888] mt-0.5">{t("setupSubtitle")}</p>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Trip Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> {t("linkToTrip")}
                  </Label>
                  <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                    <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium">
                      <SelectValue placeholder={t("placeholderTrip")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#EBEBEB] dark:border-[#2A2A2A] shadow-lg bg-white dark:bg-[#1A1A1A]">
                      {trips.map(t => (
                        <SelectItem key={t._id} value={t._id} className="text-sm font-medium">
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-[#EBEBEB] dark:border-[#2A2A2A]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-white dark:bg-[#1A1A1A] px-2 text-[#767676]">{t("optimization")}</span>
                  </div>
                </div>

                <form onSubmit={handleOptimize} className="space-y-4">
                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {t("regionBase")}
                    </Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] text-sm font-medium">
                        <SelectValue placeholder={t("placeholderCity")} />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_CITIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-1.5">
                    <Label htmlFor="budget" className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1">{t("totalBudget")}</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767676] dark:text-[#888] h-4 w-4" />
                      <Input
                        id="budget"
                        type="number"
                        min="1000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-11 h-14 rounded-xl text-lg font-bold bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="submit" variant="premium" className="h-12 rounded-xl text-xs font-bold" disabled={loading}>
                      {loading ? "..." : t("optimize")}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSaveToTrip}
                      disabled={!selectedTripId || !allocation}
                      className="h-12 rounded-xl text-xs font-bold bg-[#484848] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-gray-100 transition-colors"
                    >
                      {t("saveToTrip")}
                    </Button>
                  </div>
                </form>

                {trackerData?.budgetAllocation && (
                  <div className="p-4 rounded-xl bg-[#00A699]/5 border border-[#00A699]/15">
                     <p className="text-[10px] font-black uppercase text-[#00A699] tracking-widest mb-1">{t("targetActive")}</p>
                     <p className="text-xs font-medium text-[#484848] dark:text-[#E0E0E0]">{t("targetsLocked")} {selectedTripId && trips.find(t => t._id === selectedTripId)?.title}.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-7 min-w-0"
          >
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
              <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-base font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">{t("activeTracking")}</h2>
                   <p className="text-xs text-[#767676] dark:text-[#888] mt-0.5">{t("trackingSubtitle")}</p>
                </div>
                {trackerData && (
                  <Button 
                    variant="premium" 
                    size="sm" 
                    onClick={() => setIsAddingExpense(true)}
                    className="h-9 px-4 rounded-lg text-xs font-bold gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("addExpense")}
                  </Button>
                )}
              </div>

              <div className="p-6">
                {selectedTripId ? (
                  <div className="space-y-8">
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-[#FF5A5F]" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#767676]">{t("categoryProgress")}</h3>
                         </div>
                          <div className="h-[300px] w-full relative">
                           {mounted && chartData.length > 0 && (
                             <ResponsiveContainer width="100%" height={280}>
                               <BarChart data={chartData} layout="vertical" margin={{ left: -10 }}>
                                 <XAxis type="number" hide />
                                 <YAxis dataKey="name" type="category" width={60} hide />
                                 <Tooltip 
                                   cursor={{ fill: 'transparent' }} 
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                 />
                                 <Bar dataKey="target" stackId="a" fill="#EBEBEB" radius={[0, 4, 4, 0]} barSize={24} />
                                 <Bar dataKey="actual" stackId="a" fill="#FF5A5F" radius={[0, 4, 4, 0]} barSize={24} />
                               </BarChart>
                             </ResponsiveContainer>
                           )}
                         </div>
                      </div>

                      <div className="space-y-6">
                         {chartData.map((item, idx) => {
                           const spent = item.actual;
                           const target = item.target;
                           const percent = target > 0 ? (spent / target) * 100 : 0;
                           const isOver = spent > target && target > 0;

                           return (
                             <div key={idx} className="space-y-2">
                               <div className="flex justify-between items-end">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#767676]">{item.name}</span>
                                  <span className={cn("text-sm font-bold", isOver ? "text-[#FF5A5F]" : "text-[#484848] dark:text-white")}>
                                     ₹{spent.toLocaleString()} / <span className="text-[#A0A0A0]">₹{target.toLocaleString()}</span>
                                  </span>
                               </div>
                               <div className="h-2 w-full bg-[#F7F7F7] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percent, 100)}%` }}
                                    className={cn("h-full rounded-full transition-colors", isOver ? "bg-[#FF5A5F]" : "bg-[#00A699]")}
                                  />
                               </div>
                             </div>
                           )
                         })}
                      </div>
                    </div>

                    {/* Expense History Table */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold flex items-center gap-2">
                           <History className="h-4 w-4 text-[#767676]" />
                           {t("expenseHistory")}
                         </h3>
                         <span className="text-[10px] font-medium text-[#767676] bg-[#F7F7F7] px-2 py-1 rounded-md">
                           {trackerData?.expenses?.length || 0} {t("entries")}
                         </span>
                      </div>
                      
                      <div className="border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#F7F7F7] dark:bg-[#222] text-[#767676] text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                              <th className="px-6 py-4">{t("table.date")}</th>
                              <th className="px-6 py-4">{t("table.category")}</th>
                              <th className="px-6 py-4">{t("table.description")}</th>
                              <th className="px-6 py-4 text-right">{t("table.amount")}</th>
                              <th className="px-6 py-4"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#2A2A2A]">
                             {trackerData?.expenses.map((exp: any) => (
                               <tr key={exp._id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors group">
                                 <td className="px-6 py-4 text-[#767676] text-xs">
                                   {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                 </td>
                                 <td className="px-6 py-4">
                                   <span className="capitalize px-2 py-0.5 bg-[#F7F7F7] dark:bg-[#2A2A2A] rounded border border-[#EBEBEB] dark:border-[#333] text-[10px] font-bold">
                                     {t(`categories.${exp.category}`)}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 font-medium max-w-[150px] truncate">{exp.description || "-"}</td>
                                 <td className="px-6 py-4 text-right font-bold">₹{exp.amount.toLocaleString()}</td>
                                 <td className="px-6 py-4 text-right">
                                   <button 
                                     onClick={() => handleDeleteExpense(exp._id)}
                                     className="p-1.5 text-gray-300 hover:text-[#FF5A5F] transition-colors opacity-0 group-hover:opacity-100"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </button>
                                 </td>
                               </tr>
                             ))}
                             {(!trackerData?.expenses || trackerData.expenses.length === 0) && (
                               <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-[#767676]">{t("noExpenses")}</td>
                               </tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[450px] flex flex-col items-center justify-center text-center px-12">
                     <div className="w-20 h-20 bg-[#F7F7F7] rounded-3xl flex items-center justify-center mb-6">
                        <TrendingUp className="h-8 w-8 text-[#EBEBEB]" />
                     </div>
                     <h3 className="text-xl font-bold mb-2">{t("readyToTrack")}</h3>
                     <p className="text-[#767676] text-sm leading-relaxed max-w-xs">{t("readySubtitle")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
              {isAddingExpense && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm no-print">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-[32px] shadow-2xl border border-[#EBEBEB] dark:border-[#2A2A2A]"
                  >
                    <div className="px-8 py-7 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex items-center justify-between">
                       <h3 className="text-lg font-bold">{t("logExpense")}</h3>
                       <button onClick={() => setIsAddingExpense(false)} className="text-[#767676] hover:text-black p-1">
                          <Plus className="h-6 w-6 rotate-45" />
                       </button>
                    </div>
                    <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                           <Label className="text-[10px] font-black uppercase text-[#767676] tracking-widest ml-1">Category</Label>
                             <Select value={newExpense.category} onValueChange={(val) => setNewExpense({...newExpense, category: val})}>
                               <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#333] text-[#484848] dark:text-white px-4">
                    <SelectValue placeholder={"Category"} />
                               </SelectTrigger>
                               <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[#EBEBEB] dark:border-[#2A2A2A] shadow-xl bg-white dark:bg-[#1A1A1A] w-[--radix-select-trigger-width]">
                                  {['stay', 'food', 'transport', 'tickets', 'emergency', 'other'].map(c => (
                                    <SelectItem key={c} value={c} className="capitalize cursor-pointer">
                                      {t(`categories.${c}`)}
                                    </SelectItem>
                                  ))}
                               </SelectContent>
                             </Select>
                          </div>
                          
                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase text-[#767676] tracking-widest ml-1">{t("amount")}</Label>
                             <div className="relative">
                               <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676] dark:text-[#888]" />
                               <Input 
                                 type="number" 
                                 required
                                 value={newExpense.amount}
                                 onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                 className="h-12 pl-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#333] text-[#484848] dark:text-white font-bold"
                               />
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <Label className="text-[10px] font-black uppercase text-[#767676] tracking-widest ml-1">{t("notes")}</Label>
                             <Input 
                               placeholder="e.g. Dinner at Taj" 
                               value={newExpense.description}
                               onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                               className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#333] text-[#484848] dark:text-white"
                             />
                          </div>
                       </div>
                       <Button type="submit" variant="premium" className="w-full h-14 rounded-2xl font-bold shadow-lg">
                          {t("confirmLog")}
                       </Button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
