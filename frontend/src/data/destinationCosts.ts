export interface DestinationCost {
  city: string
  accommodation: { budget: string; mid: string; luxury: string }
  food: { budget: string; mid: string; luxury: string }
  transport: string
  entryFees: string
  notes: string
}

export const destinationCosts: DestinationCost[] = [
  { city: "Goa", accommodation: { budget: "₹800-1,500", mid: "₹2,000-4,000", luxury: "₹6,000-15,000" }, food: { budget: "₹200-400", mid: "₹500-1,000", luxury: "₹1,500-3,000" }, transport: "₹300-500/day (scooter)", entryFees: "₹100-500", notes: "Beach activities and water sports add ₹1,000-3,000/day" },
  { city: "Jaipur", accommodation: { budget: "₹600-1,200", mid: "₹1,500-3,500", luxury: "₹5,000-12,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,200-2,500" }, transport: "₹200-400/day (auto)", entryFees: "₹200-600", notes: "Heritage sites charge ₹300-600 for foreigners" },
  { city: "Kerala", accommodation: { budget: "₹700-1,500", mid: "₹1,800-4,000", luxury: "₹5,000-20,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,000-2,500" }, transport: "₹300-600/day", entryFees: "₹100-400", notes: "Houseboat stays cost ₹8,000-15,000/night" },
  { city: "Delhi", accommodation: { budget: "₹500-1,000", mid: "₹1,500-3,000", luxury: "₹4,000-10,000" }, food: { budget: "₹100-250", mid: "₹300-700", luxury: "₹1,000-2,500" }, transport: "₹100-300/day (metro)", entryFees: "₹100-500", notes: "Metro is cheapest transport option" },
  { city: "Agra", accommodation: { budget: "₹400-800", mid: "₹1,000-2,500", luxury: "₹3,000-8,000" }, food: { budget: "₹100-200", mid: "₹300-600", luxury: "₹800-2,000" }, transport: "₹150-300/day", entryFees: "₹50 (local), ₹1,100 (Taj Mahal foreigner)", notes: "Taj Mahal entry is ₹50 for Indians, ₹1,100 for foreigners" },
  { city: "Varanasi", accommodation: { budget: "₹300-700", mid: "₹800-2,000", luxury: "₹3,000-7,000" }, food: { budget: "₹80-200", mid: "₹250-500", luxury: "₹800-1,500" }, transport: "₹100-200/day", entryFees: "₹0-200", notes: "Ganga Aarti is free, boat rides ₹200-500" },
  { city: "Mumbai", accommodation: { budget: "₹800-1,500", mid: "₹2,000-5,000", luxury: "₹6,000-20,000" }, food: { budget: "₹150-300", mid: "₹400-900", luxury: "₹1,500-4,000" }, transport: "₹100-300/day (local train)", entryFees: "₹100-500", notes: "Most expensive city; Gateway of India is free" },
  { city: "Bangalore", accommodation: { budget: "₹600-1,200", mid: "₹1,500-3,500", luxury: "₹4,000-10,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,200-3,000" }, transport: "₹150-300/day (metro)", entryFees: "₹100-400", notes: "Pub culture adds ₹500-1,500/night" },
  { city: "Ladakh", accommodation: { budget: "₹500-1,000", mid: "₹1,500-3,000", luxury: "₹4,000-8,000" }, food: { budget: "₹200-400", mid: "₹500-1,000", luxury: "₹1,500-3,000" }, transport: "₹500-1,000/day (bike)", entryFees: "₹200-500", notes: "Inner Line Permit ₹400, bike rentals ₹800-1,500/day" },
  { city: "Manali", accommodation: { budget: "₹500-1,000", mid: "₹1,200-3,000", luxury: "₹3,500-8,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,200-2,500" }, transport: "₹200-400/day", entryFees: "₹100-300", notes: "Adventure sports add ₹1,000-3,000/activity" },
  { city: "Rishikesh", accommodation: { budget: "₹400-800", mid: "₹1,000-2,500", luxury: "₹3,000-6,000" }, food: { budget: "₹100-250", mid: "₹300-600", luxury: "₹800-1,500" }, transport: "₹100-200/day", entryFees: "₹0-200", notes: "Rafting ₹1,000-2,500, yoga classes ₹500-1,000/day" },
  { city: "Udaipur", accommodation: { budget: "₹500-1,000", mid: "₹1,500-3,500", luxury: "₹5,000-15,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,200-3,000" }, transport: "₹150-300/day", entryFees: "₹200-500", notes: "Lake Palace heritage stays are ₹10,000+" },
  { city: "Amritsar", accommodation: { budget: "₹400-800", mid: "₹1,000-2,500", luxury: "₹3,000-7,000" }, food: { budget: "₹100-200", mid: "₹300-600", luxury: "₹800-2,000" }, transport: "₹100-200/day", entryFees: "₹0-200", notes: "Golden Temple is free, langar is free" },
  { city: "Darjeeling", accommodation: { budget: "₹500-1,000", mid: "₹1,200-3,000", luxury: "₹3,500-8,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,000-2,500" }, transport: "₹200-400/day", entryFees: "₹100-300", notes: "Toy Train ride ₹500-1,500" },
  { city: "Mysore", accommodation: { budget: "₹400-800", mid: "₹1,000-2,500", luxury: "₹3,000-7,000" }, food: { budget: "₹100-250", mid: "₹300-600", luxury: "₹800-2,000" }, transport: "₹150-300/day", entryFees: "₹50-200", notes: "Mysore Palace entry ₹40 (Indians), ₹200 (foreigners)" },
  { city: "Hampi", accommodation: { budget: "₹300-600", mid: "₹800-2,000", luxury: "₹2,500-5,000" }, food: { budget: "₹100-200", mid: "₹250-500", luxury: "₹800-1,500" }, transport: "₹200-400/day (scooter)", entryFees: "₹40-600", notes: "Ruins complex entry ₹40 (Indians), ₹600 (foreigners)" },
  { city: "Pondicherry", accommodation: { budget: "₹500-1,000", mid: "₹1,200-3,000", luxury: "₹3,500-8,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,200-2,500" }, transport: "₹200-400/day (scooter)", entryFees: "₹0-200", notes: "French Quarter walking tour is free" },
  { city: "Shimla", accommodation: { budget: "₹500-1,000", mid: "₹1,200-3,000", luxury: "₹3,500-8,000" }, food: { budget: "₹150-300", mid: "₹400-800", luxury: "₹1,000-2,500" }, transport: "₹150-300/day", entryFees: "₹50-200", notes: "Kalka-Shimla toy train ₹250-1,000" },
  { city: "Kolkata", accommodation: { budget: "₹400-800", mid: "₹1,000-2,500", luxury: "₹3,000-8,000" }, food: { budget: "₹80-200", mid: "₹250-600", luxury: "₹800-2,000" }, transport: "₹50-150/day (metro)", entryFees: "₹50-300", notes: "Street food is cheapest in India here" },
  { city: "Chennai", accommodation: { budget: "₹500-1,000", mid: "₹1,200-3,000", luxury: "₹3,500-8,000" }, food: { budget: "₹100-250", mid: "₹300-700", luxury: "₹1,000-2,500" }, transport: "₹100-250/day (metro)", entryFees: "₹50-200", notes: "Marina Beach is free, temples are free" },
]
