import math
from typing import List, Dict

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Haversine distance between two points on the earth."""
    R = 6371 # Radius of the earth in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) * math.sin(dLon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def nearest_neighbor_tsp(places: List[Dict]) -> List[Dict]:
    """
    Very basic Nearest Neighbor approach to Traveling Salesperson Problem (TSP)
    Given a list of places [ { id, name, lat, lng, ... } ],
    Order them to minimize total travel distance.
    (This is a greedy heuristic, not strictly optimal, but good enough for small N).
    """
    if not places:
        return []
        
    unvisited = places.copy()
    
    # Start at the first place given
    current = unvisited.pop(0)
    
    optimized = [current]
    
    while unvisited:
        nearest = None
        min_dist = float('inf')
        nearest_index = -1
        
        for i, place in enumerate(unvisited):
            dist = calculate_distance(
                current.get('lat', 0), current.get('lng', 0),
                place.get('lat', 0), place.get('lng', 0)
            )
            
            if dist < min_dist:
                min_dist = dist
                nearest = place
                nearest_index = i
                
        if nearest:
            optimized.append(nearest)
            current = unvisited.pop(nearest_index)
            
    # Add visit order to the result
    result = []
    for i, p in enumerate(optimized):
        p_copy = dict(p)
        p_copy['visitOrder'] = i + 1
        result.append(p_copy)
        
    return result

def optimize_budget(total_budget: float) -> Dict:
    """
    Calculate optimal budget allocation.
    Stay = 40%, Food = 20%, Transport = 20%, Tickets = 10%, Emergency = 10%
    """
    return {
        "stay": round(total_budget * 0.40, 2),
        "food": round(total_budget * 0.20, 2),
        "transport": round(total_budget * 0.20, 2),
        "tickets": round(total_budget * 0.10, 2),
        "emergency": round(total_budget * 0.10, 2),
        "total": total_budget
    }
