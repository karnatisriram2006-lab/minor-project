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
    { name: "Accommodation", value: allocation.stay, color: "#f97316" },
    { name: "Food & Dining", value: allocation.food, color: "#10b981" },
    { name: "Transportation", value: allocation.transport, color: "#06b6d4" },
    { name: "Tickets & Activities", value: allocation.tickets, color: "#6366f1" },
    { name: "Emergency Fund", value: allocation.emergency, color: "#94a3b8" },
  ] : []

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/20 pt-32 pb-48 relative overflow-hidden font-sans noise-overlay">
      
      {/* Aurora Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-aurora [animation-delay:-5s]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10 space-y-20">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1120] text-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-primary/20 glow-primary"
          >
            <Wallet className="h-10 w-10 md:h-12 md:w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] italic text-white">
               Budget <br /><span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Optimizer.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed mt-10">
              Leverage neural fiscal logic to calculate high-order capital allocation for your Indian traversal.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pt-16">
          
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="bg-[#0B1120]/60 backdrop-blur-3xl rounded-[2.5rem] border-white/5 shadow-2xl glass-3d overflow-hidden h-fit sticky top-32 text-white">
              <CardHeader className="p-8 md:p-10 border-b border-white/5 space-y-2">
                <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter italic">Fiscal Setup</CardTitle>
                <CardDescription className="text-white/40 font-medium uppercase text-[10px] tracking-[0.3em]">Parameter Definition</CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-10 space-y-8">
                <form onSubmit={handleOptimize} className="space-y-10">
                  <div className="space-y-4 relative group">
                    <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-3 group-focus-within:text-primary transition-colors">Total Capital (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6 font-black" />
                      <Input 
                        id="budget" 
                        type="number" 
                        min="5000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-16 h-20 rounded-3xl text-2xl font-black bg-[#020617] border-white/10 focus:ring-4 focus:ring-primary/10 transition-all text-white shadow-inner placeholder:text-white/20"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 md:h-16 rounded-xl bg-primary hover:bg-orange-600 text-white font-black shadow-2xl transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer overflow-hidden group/btn" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         <span className="uppercase tracking-[0.2em] text-[9px]">Optimizing...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[9px] md:text-[10px] w-full px-2">
                        <span className="truncate">Run Optimization</span>
                        <ArrowRight className="h-4 w-4 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-start gap-4">
                   <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                   <p className="text-xs text-white/40 font-medium leading-relaxed italic">
                      Fiscal data is weight-adjusted based on current high-season tourism indices.
                   </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <Card className="bg-[#0B1120]/60 backdrop-blur-3xl rounded-[3rem] border-white/5 shadow-2xl glass-3d overflow-hidden min-h-[600px] text-white">
              <CardHeader className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                  <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none">Capital Distribution</CardTitle>
                  <CardDescription className="text-white/40 font-medium uppercase text-[10px] tracking-[0.3em]">Neural Output Matrix</CardDescription>
                </div>
                <AnimatePresence>
                  {allocation && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 px-8 py-4 rounded-3xl border border-primary/20 shadow-2xl flex items-center gap-4"
                    >
                      <IndianRupee className="h-6 w-6 text-primary" />
                      <span className="text-4xl font-black text-primary tracking-tighter">₹{allocation.total.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
              <CardContent className="p-12 px-16">
                {allocation ? (
                  <div className="flex flex-col xl:flex-row items-center gap-20">
                    <div className="w-full xl:w-1/2 h-[300px] relative flex items-end justify-center mb-10">
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
                           <div className="space-y-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 leading-none mb-1">Liquidity</p>
                              <p className="text-4xl font-black text-white tracking-tighter leading-none italic">100%</p>
                           </div>
                       </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => `₹${value.toLocaleString()}`}
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.5)',
                              padding: '20px 24px',
                              backgroundColor: '#020617',
                              fontWeight: '900',
                              fontSize: '14px',
                              color: '#ffffff'
                            }}
                            itemStyle={{ color: '#ffffff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full xl:w-1/2 space-y-4">
                      {chartData.map((item, idx) => (
                        <motion.div 
                          key={item.name} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="flex items-center justify-between p-5 md:p-6 lg:p-7 px-8 md:px-10 rounded-[2rem] bg-white/5 border border-white/5 shadow-2xl hover:border-primary/20 hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                             <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full shadow-lg group-hover:scale-125 transition-transform shrink-0 glow-primary" style={{ backgroundColor: item.color }} />
                             <span className="font-black text-white text-[9px] md:text-[11px] uppercase tracking-[0.25em] truncate">{item.name}</span>
                          </div>
                          <span className="font-black text-white/90 text-lg md:text-xl lg:text-2xl tracking-tighter italic shrink-0 ml-4">₹{item.value.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[450px] flex flex-col items-center justify-center text-white/40 bg-[#020617] rounded-[4rem] border-2 border-dashed border-white/10 group">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-24 h-24 bg-[#0B1120] rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 border border-white/5 group-hover:rotate-12 transition-all"
                    >
                      <Sparkles className="h-10 w-10 text-white/20 group-hover:text-primary transition-colors" />
                    </motion.div>
                    <p className="font-black text-[10px] uppercase tracking-[0.4em] text-white/30">Initialize Fiscal Matrix to View Breakdown</p>
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
