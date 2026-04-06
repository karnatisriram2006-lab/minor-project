// Budget calculation utilities for YĀTRĀ budget estimator

export type TravelMode = 'car'|'bus'|'train'|'flight'
export type BudgetType = 'low'|'medium'|'luxury'

// Rates per kilometer by travel mode (all prices in ₹)
export const PER_KM_RATES: Record<TravelMode, number> = {
  car: 10,
  bus: 2,
  train: 1.5,
  flight: 5,
}

// Per-day stay budget by chosen budget type
export const PER_DAY_BUDGET: Record<BudgetType, number> = {
  low: 500,
  medium: 1500,
  luxury: 4000,
}

export interface BudgetResult {
  distanceKm: number
  travelCost: number
  stayCost: number
  foodCost: number
  total: number
  mode: TravelMode
  budgetType: BudgetType
  days: number
  source?: string
  destination?: string
}

// Default export: compute a quick budget breakdown
export default function calculateBudget(distanceKm: number, days: number, mode: TravelMode, budgetType: BudgetType): BudgetResult {
  const rate = PER_KM_RATES[mode] ?? 0
  const travelCost = distanceKm * rate
  const stayCost = days * (PER_DAY_BUDGET[budgetType] ?? 0)
  const foodCost = days * 500
  const total = travelCost + stayCost + foodCost
  return { distanceKm, travelCost, stayCost, foodCost, total, mode, budgetType, days }
}
