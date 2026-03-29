"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Wallet, Info, Sparkles, IndianRupee, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import axios from "axios"

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
    { name: "Accommodation",    value: allocation.stay,      color: "#FF5A5F" },  // Airbnb Rausch coral
    { name: "Food & Dining",    value: allocation.food,      color: "#00A699" },  // Airbnb Babu teal
    { name: "Transportation",   value: allocation.transport, color: "#484848" },  // Airbnb Hof charcoal
    { name: "Tickets & Activities", value: allocation.tickets,  color: "#FC642D" },  // Airbnb Arches orange
    { name: "Emergency Fund",   value: allocation.emergency, color: "#FFB400" },  // Airbnb warm gold
  ] : []

  return (
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-40 pb-56 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767610, transparent 40%)' }} />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-24">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-heritage-saffron/5 text-heritage-saffron w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-heritage-gold/10 shadow-premium"
          >
            <Wallet className="h-10 w-10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-[7rem] font-extrabold tracking-tighter leading-none text-heritage-onyx">
               Treasury <span className="text-heritage-saffron italic">Shield.</span>
            </h1>
            <p className="text-xl md:text-2xl text-heritage-onyx/40 font-medium max-w-3xl mx-auto leading-relaxed">
              Precision allocation for your journey through Bharat—where every rupee finds its purpose.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card variant="premium" className="overflow-hidden h-fit sticky top-40 bg-white">
              <CardHeader className="p-10 border-b border-heritage-bone bg-heritage-bone/30">
                <CardTitle className="text-2xl font-extrabold tracking-tight">Financial Intent</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold">Total Resource Allocation</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleOptimize} className="space-y-8">
                  <div className="space-y-4">
                    <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-[0.2em] text-heritage-gold/60 ml-2">Total Capital (INR)</Label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-heritage-saffron h-6 w-6 transition-transform group-focus-within:scale-110" />
                      <Input 
                        id="budget" 
                        type="number" 
                        min="5000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-16 h-20 rounded-[1.5rem] text-2xl font-black bg-heritage-bone/50 border-heritage-gold/10 focus:ring-8 focus:ring-heritage-saffron/5 transition-all shadow-soft-inner"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="premium" className="w-full h-20 rounded-[1.5rem] text-lg font-black group" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-4">
                         <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                         <span className="text-xs uppercase tracking-[0.3em]">Processing...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] w-full">
                        Run Optimization
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="p-6 rounded-2xl bg-heritage-saffron/5 border border-heritage-saffron/10 flex items-start gap-5 shadow-soft-inner">
                   <Info className="h-6 w-6 text-heritage-saffron shrink-0 mt-0.5" />
                   <p className="text-sm text-heritage-onyx/60 font-medium leading-relaxed italic">
                      &quot;Historical cost data from diverse regions allows us to model your optimal trajectory.&quot;
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
            className="lg:col-span-7"
          >
            <Card variant="premium" className="overflow-hidden min-h-[650px] bg-white">
              <CardHeader className="p-10 border-b border-heritage-bone flex flex-col md:flex-row md:items-center justify-between gap-8 bg-heritage-bone/30">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-extrabold tracking-tight">Sovereign Breakdown</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold">AI-Synthesized Fiscal Map</CardDescription>
                </div>
                <AnimatePresence>
                  {allocation && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-white px-8 py-5 rounded-[2rem] border border-heritage-gold/10 shadow-premium flex items-center gap-4 animate-float"
                    >
                      <IndianRupee className="h-6 w-6 text-heritage-saffron" />
                      <span className="text-3xl font-black text-heritage-onyx tracking-tighter">₹{allocation.total.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
              <CardContent className="p-10 md:p-16">
                {allocation ? (
                  <div className="flex flex-col xl:flex-row items-center gap-16">
                    <div className="w-full xl:w-5/12 h-[350px] relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-heritage-gold/40 leading-none mb-2">Total</p>
                              <p className="text-4xl font-black text-heritage-onyx tracking-tighter leading-none">100%</p>
                           </div>
                       </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={4}
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
                            formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`}
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: '1px solid #EBEBEB', 
                              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                              padding: '12px 20px',
                              backgroundColor: '#FFFFFF',
                              fontWeight: '700',
                              fontSize: '14px',
                              color: '#484848',
                              letterSpacing: '-0.02em'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full xl:w-7/12 space-y-4">
                      {chartData.map((item, idx) => (
                        <motion.div 
                          key={item.name} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="flex items-center justify-between p-6 px-8 rounded-3xl bg-heritage-bone/50 border border-transparent hover:border-heritage-gold/20 transition-all group cursor-default"
                        >
                          <div className="flex items-center gap-5 min-w-0 flex-1">
                             <div className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/5" style={{ backgroundColor: item.color }} />
                             <span className="font-semibold text-[#767676] text-[11px] uppercase tracking-[0.2em] truncate group-hover:text-[#484848] transition-colors">{item.name}</span>
                          </div>
                          <span className="font-bold text-[#484848] text-xl tracking-tighter shrink-0 ml-6">₹{item.value.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[450px] flex flex-col items-center justify-center bg-[#F7F7F7] rounded-3xl border-2 border-dashed border-[#EBEBEB] group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5A5F08] via-transparent to-[#00A69908]" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-premium mb-10 border border-[#EBEBEB] z-10"
                    >
                      <Sparkles className="h-10 w-10 text-[#FF5A5F]" />
                    </motion.div>
                    <p className="font-bold text-xs uppercase tracking-[0.4em] text-[#767676] z-10">Define your budget to begin</p>
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
