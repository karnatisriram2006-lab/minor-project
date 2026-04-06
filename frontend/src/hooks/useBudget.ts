import { useState, useEffect, useCallback } from 'react'

type TravelMode = 'car'|'bus'|'train'|'flight'
type BudgetType = 'low'|'medium'|'luxury'

interface BudgetResult {
  distanceKm: number
  distanceMeters?: number
  travelCost: number
  stayCost: number
  foodCost: number
  total: number
  mode: TravelMode
  budgetType: BudgetType
  days: number
  source: string
  destination: string
}

export function useBudget() {
  const [input, setInput] = useState<{ source: string; destination: string; days: number; mode: TravelMode; budget: BudgetType }>({ source: '', destination: '', days: 1, mode: 'car', budget: 'medium' })
  const [result, setResult] = useState<BudgetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = useCallback(async () => {
    const { source, destination, days, mode, budget } = input
    if (!source || !destination || days <= 0) {
      setError('Please fill in source, destination, and days')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/budget-estimator?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&days=${days}&mode=${mode}&budget=${budget}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Budget estimation failed')
      }
      const data = await res.json()
      setResult({
        distanceKm: data.distanceKm,
        distanceMeters: data.distanceMeters,
        travelCost: data.travelCost,
        stayCost: data.stayCost,
        foodCost: data.foodCost,
        total: data.total,
        mode: data.mode,
        budgetType: data.budgetType,
        days: data.days,
        source: data.source,
        destination: data.destination
      })
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [input])

  // Debounced auto-fetch when input changes (optional in UI; you can trigger manually too)
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.source && input.destination && input.days > 0) fetchBudget()
    }, 300)
    return () => clearTimeout(t)
  }, [input.source, input.destination, input.days, input.mode, input.budget])

  return { input, setInput, result, loading, error, fetchBudget }
}
