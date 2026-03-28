"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Wallet, Info, Sparkles, TrendingUp, IndianRupee, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { cn } from "@/lib/utils"

export default function BudgetOptimizer() {
  const [budget, setBudget] = useState<string>("50000")
  const [allocation, setAllocation] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await axios.post(`${apiUrl}/budget`, { totalBudget: Number(budget) })
      setAllocation(res.data.allocation)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = allocation ? [
    { name: "Accommodation", value: allocation.stay, color: "#FF385C" },
    { name: "Food & Dining", value: allocation.food, color: "#00A699" },
    { name: "Transportation", value: allocation.transport, color: "#484848" },
    { name: "Tickets & Activities", value: allocation.tickets, color: "#717171" },
    { name: "Emergency Fund", value: allocation.emergency, color: "#FFB400" },
  ] : []

  return (
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-tr from-red-50/20 via-white to-gray-50/10" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 space-y-16">
        
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF385C]/5 text-[#FF385C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FF385C]/10 shadow-sm"
          >
            <Wallet className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-[#222222]">
               Budget <span className="text-[#FF385C]">Optimizer</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Plan your travel expenses with our smart allocation tool.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
          
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="bg-white rounded-[2rem] border-gray-100 shadow-sm overflow-hidden h-fit sticky top-32">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-xl font-bold">Planned Budget</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Funds Available</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleOptimize} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="budget" className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Capital (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF385C] h-5 w-5" />
                      <Input 
                        id="budget" 
                        type="number" 
                        min="5000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-12 h-16 rounded-xl text-xl font-bold bg-white border-gray-100 shadow-sm focus:ring-4 focus:ring-[#FF385C]/5 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-xl bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         <span className="text-sm">Calculating...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-sm w-full">
                        Run Optimization
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                   <Info className="h-5 w-5 text-[#FF385C] shrink-0 mt-0.5" />
                   <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Allocation is based on average seasonal costs in your preferred destinations.
                   </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
              <CardHeader className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Budget Breakdown</CardTitle>
                  <CardDescription className="text-xs font-semibold uppercase tracking-widest text-gray-400">Smart Allocation Analysis</CardDescription>
                </div>
                <AnimatePresence>
                  {allocation && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#FF385C]/5 px-6 py-3 rounded-2xl border border-[#FF385C]/10 shadow-sm flex items-center gap-3"
                    >
                      <IndianRupee className="h-5 w-5 text-[#FF385C]" />
                      <span className="text-2xl font-bold text-[#FF385C] tracking-tight">₹{allocation.total.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                {allocation ? (
                  <div className="flex flex-col xl:flex-row items-center gap-12">
                    <div className="w-full xl:w-1/2 h-[260px] relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="text-center">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Total</p>
                              <p className="text-3xl font-bold text-[#222222] tracking-tighter leading-none">100%</p>
                           </div>
                       </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => `₹${value.toLocaleString()}`}
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: '1px solid #f3f4f6', 
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                              padding: '12px 16px',
                              backgroundColor: '#ffffff',
                              fontWeight: '700',
                              fontSize: '12px',
                              color: '#222222'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full xl:w-1/2 space-y-3">
                      {chartData.map((item, idx) => (
                        <motion.div 
                          key={item.name} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + (idx * 0.05) }}
                          className="flex items-center justify-between p-4 px-6 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                             <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                             <span className="font-bold text-[#222222] text-xs uppercase tracking-wider truncate">{item.name}</span>
                          </div>
                          <span className="font-bold text-gray-600 text-lg tracking-tight shrink-0 ml-4">₹{item.value.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[350px] flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 group">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-gray-50"
                    >
                      <Sparkles className="h-8 w-8 text-gray-100" />
                    </motion.div>
                    <p className="font-bold text-xs uppercase tracking-widest text-gray-400">Initialize to view breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
