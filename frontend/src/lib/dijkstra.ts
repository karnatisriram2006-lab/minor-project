export interface LocationNode {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export function buildAdjacencyMatrix(nodes: LocationNode[]): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < nodes.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) {
                matrix[i][j] = 0;
            } else {
                matrix[i][j] = haversineDistance(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
            }
        }
    }
    return matrix;
}

// Implements Dijkstra-inspired greedy approach for Shortest Path / Traveling Salesperson
export function optimizeRouteOrder<T extends LocationNode>(locations: T[]): T[] {
    if (locations.length <= 1) return locations;

    const matrix = buildAdjacencyMatrix(locations);
    const visited = new Set<number>();
    const route: T[] = [];

    // Start at the first location
    let currentIdx = 0;
    visited.add(currentIdx);
    route.push(locations[currentIdx]);

    while (visited.size < locations.length) {
        let nearestIdx = -1;
        let minDistance = Infinity;

        // Dijkstra's step to find shortest adjoining unvisited node
        for (let i = 0; i < locations.length; i++) {
            if (!visited.has(i)) {
                if (matrix[currentIdx][i] < minDistance) {
                    minDistance = matrix[currentIdx][i];
                    nearestIdx = i;
                }
            }
        }

        if (nearestIdx !== -1) {
            visited.add(nearestIdx);
            route.push(locations[nearestIdx]);
            currentIdx = nearestIdx;
        } else {
            break;
        }
    }

    return route;
}
