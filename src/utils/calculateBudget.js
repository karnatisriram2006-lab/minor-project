// JavaScript fallback for budget budget calculator (to help module resolution)
exports.PER_KM_RATES = {
  car: 10,
  bus: 2,
  train: 1.5,
  flight: 5,
}

exports.PER_DAY_BUDGET = {
  low: 500,
  medium: 1500,
  luxury: 4000,
}

exports.calculateBudget = function(distanceKm, days, mode, budgetType) {
  const rate = (exports.PER_KM_RATES[mode] || 0)
  const travelCost = distanceKm * rate
  const stayCost = days * (exports.PER_DAY_BUDGET[budgetType] || 0)
  const foodCost = days * 500
  const total = travelCost + stayCost + foodCost
  return { distanceKm, travelCost, stayCost, foodCost, total, mode, budgetType, days }
}

exports.default = exports.calculateBudget
