"use client"
import { useState, useMemo } from 'react'
import { useBudget } from '@/hooks/useBudget'

type TravelMode = 'car'|'bus'|'train'|'flight'
type BudgetType = 'low'|'medium'|'luxury'

export default function BudgetEstimator() {
  const { input, setInput, result, loading, error, fetchBudget } = useBudget()
  // Local state for per-day budget display, though we rely on API for values
  // Prepare a simple display of breakdown if result present
  const breakdown = useMemo(() => {
    if (!result) return null
    return {
      distanceKm: result.distanceKm,
      travelCost: result.travelCost,
      stayCost: result.stayCost,
      foodCost: result.foodCost,
      total: result.total
    }
  }, [result])

  const handleInput = (field: string, value: any) => {
    // Drive the budget engine via API by updating query state in hook
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Travel Budget Estimator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="input-premium" placeholder="Source city" value={input.source} onChange={(e)=>setInput((p:any)=>({...p, source: e.target.value}))} />
        <input className="input-premium" placeholder="Destination" value={input.destination} onChange={(e)=>setInput((p:any)=>({...p, destination: e.target.value}))} />
        <input className="input-premium" placeholder="Days" type="number" min={1} value={input.days} onChange={(e)=>setInput((p:any)=>({...p, days: Number(e.target.value)||1}))} />
        <select className="input-premium" value={input.mode} onChange={(e)=>setInput((prev:any)=>({...prev, mode: e.target.value as TravelMode}))}>
          <option value="car">Car</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="flight">Flight</option>
        </select>
        <select className="input-premium" value={input.budget} onChange={(e)=>setInput((prev:any)=>({...prev, budget: (e.target.value as BudgetType)}))}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
          <div className="text-xs uppercase font-semibold text-[#767676]">Travel Cost</div>
          <div className="text-xl font-bold">₹{breakdown?.travelCost?.toLocaleString?.('en-IN') ?? '—'}</div>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
          <div className="text-xs uppercase font-semibold text-[#767676]">Distance</div>
          <div className="text-xl font-bold">{breakdown?.distanceKm?.toFixed?.(1) ?? '—'} km</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <div className="text-xs text-[#767676]">Stay</div>
          <div className="text-lg font-semibold">₹{breakdown?.stayCost?.toLocaleString?.('en-IN') ?? '—'}/day</div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <div className="text-xs text-[#767676]">Food</div>
          <div className="text-lg font-semibold">₹500</div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <div className="text-xs text-[#767676]">Total</div>
          <div className="text-lg font-semibold">₹{breakdown?.total?.toLocaleString?.('en-IN') ?? '—'}</div>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="w-full h-12 rounded-xl bg-[#FF5A5F] text-white font-semibold" onClick={() => fetchBudget()}>Recalculate</button>
    </div>
  )
}
