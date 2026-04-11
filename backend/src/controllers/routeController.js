const axios = require('axios');

// Haversine distance calculation
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @desc    Optimize travel route using Dijkstra-like TSP
// @route   POST /api/route/optimize
// @access  Public
const optimizeRoute = async (req, res) => {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
        // Fallback for old `places` key
        if (req.body.places && Array.isArray(req.body.places)) {
            req.body.locations = req.body.places;
            return optimizeRoute(req, res);
        }
        return res.status(400).json({ message: 'List of locations is required' });
    }

    try {
        console.log(`[Route Optimizer] Received request with ${locations.length} locations`);

        const n = locations.length;
        if (n === 1) {
            return res.json({
                route: [locations[0].name],
                optimizedRoute: locations,
                distance: "0.0 km"
            });
        }

        // 1. Build adjacency matrix using Haversine
        const graph = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    graph[i][j] = calculateHaversineDistance(
                        locations[i].lat, locations[i].lng,
                        locations[j].lat, locations[j].lng
                    );
                }
            }
        }

        // 2 & 3 & 4. Apply Dijkstra-inspired Nearest Neighbor for TSP to find optimized route
        let unvisited = new Set(Array.from({ length: n }, (_, i) => i));
        let currNode = 0; // start at first location
        const routeOrder = [currNode];
        unvisited.delete(currNode);

        let totalDistance = 0;

        while (unvisited.size > 0) {
            let nextNode = -1;
            let minDistance = Infinity;

            for (let j = 0; j < n; j++) {
                if (unvisited.has(j) && graph[currNode][j] < minDistance) {
                    minDistance = graph[currNode][j];
                    nextNode = j;
                }
            }

            routeOrder.push(nextNode);
            totalDistance += minDistance;
            unvisited.delete(nextNode);
            currNode = nextNode;
        }

        // 5. Construct the output
        const optimizedPlaces = routeOrder.map((index, step) => ({
            ...locations[index],
            order: step + 1
        }));

        const routeNames = optimizedPlaces.map(loc => loc.name);

        console.log(`[Route Optimizer] Optimized path: ${routeNames.join(' -> ')} | Distance: ${totalDistance.toFixed(1)} km`);

        res.json({
            route: routeNames,
            optimizedRoute: optimizedPlaces,
            distance: `${totalDistance.toFixed(1)} km`
        });

    } catch (error) {
        console.error('[Route Optimizer Error]', error);
        res.status(500).json({ message: 'Route calculation failed', error: error.message });
    }
};

// @desc    Geocode a city name using Nominatim
// @route   GET /api/route/geocode
// @access  Public
const geocodeCity = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter "q" is required' });

    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'YatraMatrix-Node-Backend/1.0'
                }
            }
        );

        const data = response.data;
        if (data && data.length > 0) {
            return res.json({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            });
        }
        res.status(404).json({ message: 'City not found' });
    } catch (error) {
        console.error('[Geocode Error]', error.message);
        res.status(500).json({ message: 'Geocoding failed', error: error.message });
    }
};

// @desc    Reverse geocode coordinates using Nominatim
// @route   GET /api/route/reverse
// @access  Public
const reverseGeocode = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Parameters "lat" and "lon" are required' });

    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            {
                headers: {
                    'User-Agent': 'YatraMatrix-Node-Backend/1.0'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('[Reverse Geocode Error]', error.message);
        res.status(500).json({ message: 'Reverse geocoding failed', error: error.message });
    }
};

module.exports = {
    optimizeRoute,
    geocodeCity,
    reverseGeocode
};
