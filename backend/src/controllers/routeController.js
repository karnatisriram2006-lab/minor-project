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
const FALLBACK_CITIES = {
    'hyderabad': { lat: 17.3850, lon: 78.4867, display_name: 'Hyderabad, Telangana, India' },
    'mumbai': { lat: 19.0760, lon: 72.8777, display_name: 'Mumbai, Maharashtra, India' },
    'delhi': { lat: 28.7041, lon: 77.1025, display_name: 'New Delhi, Delhi, India' },
    'bangalore': { lat: 12.9716, lon: 77.5946, display_name: 'Bengaluru, Karnataka, India' },
    'bengaluru': { lat: 12.9716, lon: 77.5946, display_name: 'Bengaluru, Karnataka, India' },
    'goa': { lat: 15.2993, lon: 74.1240, display_name: 'Goa, India' },
    'jaipur': { lat: 26.9124, lon: 75.7873, display_name: 'Jaipur, Rajasthan, India' },
    'kerala': { lat: 10.8505, lon: 76.2711, display_name: 'Kerala, India' },
    'agra': { lat: 27.1767, lon: 78.0081, display_name: 'Agra, Uttar Pradesh, India' },
    'varanasi': { lat: 25.3176, lon: 82.9739, display_name: 'Varanasi, Uttar Pradesh, India' },
    'ladakh': { lat: 34.1526, lon: 77.5771, display_name: 'Ladakh, India' },
    'manali': { lat: 32.2396, lon: 77.1887, display_name: 'Manali, Himachal Pradesh, India' },
    'udaipur': { lat: 24.5854, lon: 73.7125, display_name: 'Udaipur, Rajasthan, India' }
};

const geocodeCity = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter "q" is required' });

    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'Yatra-Travel-App/2.0 (contact@yatra.com)'
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
        
        // 1st Fallback: Try Photon API (OpenStreetMap alternative)
        try {
            console.log(`[Geocode Fallback] Attempting Photon API for ${q}`);
            const photonResponse = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`);
            const photonData = photonResponse.data;
            if (photonData && photonData.features && photonData.features.length > 0) {
                const feature = photonData.features[0];
                const coords = feature.geometry.coordinates; // Photon returns [lon, lat]
                const props = feature.properties;
                
                const displayName = [props.name, props.city, props.state, props.country]
                    .filter(Boolean)
                    .join(', ');
                    
                return res.json({
                    lat: parseFloat(coords[1]),
                    lng: parseFloat(coords[0]),
                    displayName: displayName
                });
            }
        } catch (photonError) {
            console.error('[Geocode Fallback Error] Photon failed:', photonError.message);
        }

        // 2nd Fallback: Hardcoded major cities
        const normalizedQuery = q.toLowerCase().trim();
        if (FALLBACK_CITIES[normalizedQuery]) {
            console.log(`[Geocode Fallback] Using hardcoded coordinates for ${q}`);
            const fallback = FALLBACK_CITIES[normalizedQuery];
            return res.json({
                lat: fallback.lat,
                lng: fallback.lon,
                displayName: fallback.display_name
            });
        }

        // If everything fails, return 404 instead of 500 to let frontend handle it gracefully
        res.status(404).json({ message: 'Location could not be geocoded' });
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
