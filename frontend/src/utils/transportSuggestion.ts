export function suggestTransport(distanceKm: number): 'car'|'bus'|'train'|'flight' {
  if (distanceKm <= 150) return 'car'
  if (distanceKm <= 500) return 'bus'
  if (distanceKm <= 1000) return 'train'
  return 'flight'
}
