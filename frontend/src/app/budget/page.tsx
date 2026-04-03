"use client"

import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Info, Sparkles, IndianRupee, ArrowRight, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { destinationCosts, DestinationCost } from "@/data/destinationCosts"

const POPULAR_CITIES = ["Goa", "Jaipur", "Kerala", "Delhi", "Agra", "Varanasi", "Mumbai", "Ladakh", "Manali", "Udaipur"]

export default function BudgetOptimizer() {
  const [budget, setBudget] = useState<string>("50000")
  const [city, setCity] = useState("Goa")
  const [duration, setDuration] = useState("3")
  const [allocation, setAllocation] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)

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

  const chartData = allocation ? [
    { name: "Accommodation", value: allocation.stay, color: "#3B82F6" },
    { name: "Food & Dining", value: allocation.food, color: "#F59E0B" },
    { name: "Transportation", value: allocation.transport, color: "#14B8A6" },
    { name: "Tickets & Activities", value: allocation.tickets, color: "#F97316" },
    { name: "Emergency Fund", value: allocation.emergency, color: "#8B5CF6" },
  ] : []

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-6xl space-y-8">

        {/* Page header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">
            Budget <span className="text-[#FF5A5F]">planner</span>
          </h1>
          <p className="text-[#767676] dark:text-[#888] text-base max-w-xl leading-relaxed">
            Enter your destination, duration, and budget — we&apos;ll allocate it across key categories.
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
                <h2 className="text-base font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">Your budget</h2>
                <p className="text-xs text-[#767676] dark:text-[#888] mt-0.5">Destination, duration, and total budget</p>
              </div>
              <div className="p-6 space-y-5">
                <form onSubmit={handleOptimize} className="space-y-4">
                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Destination
                    </Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] dark:text-[#E0E0E0] transition-all">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[#EBEBEB] dark:border-[#2A2A2A] shadow-lg bg-white dark:bg-[#1A1A1A]">
                        {POPULAR_CITIES.map(c => (
                          <SelectItem key={c} value={c} className="text-sm font-medium text-[#484848] dark:text-[#E0E0E0]">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1">Duration (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-12 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-bold text-[#484848] dark:text-[#E0E0E0] transition-all"
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-1.5">
                    <Label htmlFor="budget" className="text-xs font-semibold text-[#767676] dark:text-[#888] uppercase tracking-wide ml-1">Total budget (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767676] dark:text-[#888] h-4 w-4" />
                      <Input
                        id="budget"
                        type="number"
                        min="1000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-11 h-14 rounded-xl text-lg font-bold bg-[#F7F7F7] dark:bg-[#222] border-[#EBEBEB] dark:border-[#333] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all text-[#484848] dark:text-[#E0E0E0]"
                        required
                      />
                    </div>
                  </div>

                  {/* Estimated range */}
                  {estimatedRange && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-[#00A699]/5 dark:bg-[#00A699]/10 border border-[#00A699]/15 dark:border-[#00A699]/20 space-y-2"
                    >
                      <p className="text-xs font-semibold text-[#00A699]">
                        💡 {estimatedRange.city} cost estimate
                      </p>
                      <p className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">
                        {duration} days typically costs ₹{estimatedRange.min.toLocaleString()}–₹{estimatedRange.max.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#767676] dark:text-[#888]">{estimatedRange.notes}</p>
                    </motion.div>
                  )}

                  <Button type="submit" variant="premium" className="w-full h-12 rounded-xl text-sm font-semibold group shadow-sm transition-all active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 w-full">
                        Calculate budget
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="p-4 rounded-xl bg-[#F7F7F7] dark:bg-[#222] border border-[#EBEBEB] dark:border-[#2A2A2A] flex items-start gap-3">
                  <Info className="h-4 w-4 text-[#767676] dark:text-[#888] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#767676] dark:text-[#888] leading-relaxed">
                    Budget splits are AI-estimated based on historical cost data across Indian regions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-7"
          >
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm overflow-hidden" style={{ minHeight: '520px' }}>
              <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">Budget breakdown</h2>
                  <p className="text-xs text-[#767676] dark:text-[#888] mt-0.5">AI-estimated allocation by category</p>
                </div>
                <AnimatePresence>
                  {allocation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-[#F7F7F7] dark:bg-[#222] px-4 py-2.5 rounded-xl border border-[#EBEBEB] dark:border-[#2A2A2A]"
                    >
                      <IndianRupee className="h-4 w-4 text-[#FF5A5F]" />
                      <span className="text-xl font-bold text-[#484848] dark:text-[#E0E0E0] tracking-tight">₹{allocation.total.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-6 md:p-8">
                {allocation ? (
                  <div className="flex flex-col xl:flex-row items-center gap-8 xl:gap-12">
                    <div className="w-full xl:w-1/2 h-[320px] relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#767676]/40 leading-none mb-2">Total</p>
                          <p className="text-3xl font-black text-[#484848] dark:text-[#E0E0E0] tracking-tighter leading-none">100%</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={4}
                            animationDuration={1500}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                            ))}
                          </Pie>
                          <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, ""]}
                            contentStyle={{
                              borderRadius: '16px',
                              border: '1px solid #EBEBEB',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                              padding: '12px 20px',
                              backgroundColor: '#FFFFFF',
                              fontWeight: '700',
                              fontSize: '14px',
                              color: '#484848',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full xl:w-1/2 space-y-3">
                      {chartData.map((item, idx) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="flex items-center justify-between p-6 px-8 rounded-3xl bg-[#F7F7F7] dark:bg-[#222] border border-transparent hover:border-[#EBEBEB] dark:hover:border-[#2A2A2A] transition-all group cursor-default"
                        >
                          <div className="flex items-center gap-5 min-w-0 flex-1">
                            <div className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/5" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-[#767676] dark:text-[#888] text-[11px] uppercase tracking-[0.2em] truncate group-hover:text-[#484848] dark:group-hover:text-[#E0E0E0] transition-colors">{item.name}</span>
                          </div>
                          <span className="font-bold text-[#484848] dark:text-[#E0E0E0] text-xl tracking-tighter shrink-0 ml-6">₹{item.value.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[450px] flex flex-col items-center justify-center bg-[#F7F7F7] dark:bg-[#222] rounded-3xl border-2 border-dashed border-[#EBEBEB] dark:border-[#2A2A2A] group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5A5F08] via-transparent to-[#00A69908]" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-28 h-28 bg-white dark:bg-[#1A1A1A] rounded-3xl flex items-center justify-center shadow-premium mb-10 border border-[#EBEBEB] dark:border-[#2A2A2A] z-10"
                    >
                      <Sparkles className="h-10 w-10 text-[#FF5A5F]" />
                    </motion.div>
                    <p className="font-bold text-xs uppercase tracking-[0.4em] text-[#767676] dark:text-[#888] z-10">Define your budget to begin</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
