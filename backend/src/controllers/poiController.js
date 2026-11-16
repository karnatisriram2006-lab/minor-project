const OVERPASS_ENDPOINTS = [
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
];
const OVERPASS_TIMEOUT_MS = 10000;
const nearbyCache = new Map();
const NEARBY_CACHE_TTL_MS = 60 * 1000;

const fetchOverpassData = async (query) => {
    let lastError;

    for (const endpoint of OVERPASS_ENDPOINTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: 'data=' + encodeURIComponent(query),
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'IncredibleIndiaApp/1.0'
                }
            });

            if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
            return await response.json();
        } catch (error) {
            lastError = error;
            console.warn(`[Nearby] Overpass endpoint failed (${endpoint}): ${error.message}`);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw lastError || new Error('All nearby search providers are unavailable');
};

// @desc    Find nearby places using OpenStreetMap Overpass API
// @route   GET /api/nearby?lat=...&lng=...&category=hospital&radius=5000
// @access  Public
const findNearby = async (req, res) => {
    const { lat, lng, category = 'general', radius = 5000 } = req.query;

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusMeters = Number(radius);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'A valid latitude and longitude are required' });
    }
    if (!Number.isFinite(radiusMeters) || radiusMeters < 100 || radiusMeters > 50000) {
        return res.status(400).json({ message: 'Radius must be between 100 and 50000 meters' });
    }

    const safeCategory = typeof category === 'string' ? category : 'general';
    const cacheKey = `${latitude.toFixed(3)}:${longitude.toFixed(3)}:${safeCategory}:${radiusMeters}`;
    const cached = nearbyCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return res.json(cached.payload);
    }

    try {
        // Map categories to Overpass tags
        const categoryMap = {
            hospital: '["amenity"="hospital"]',
            police: '["amenity"="police"]',
            pharmacy: '["amenity"="pharmacy"]',
            atm: '["amenity"="atm"]',
            restaurant: '["amenity"="restaurant"]',
            hostel: '["tourism"="hostel"]',
            'tourist-info': '["tourism"="information"]',
            'fire-station': '["amenity"="fire_station"]',
            general: '["amenity"="hospital"]'
        };

        const normalizedCategory = categoryMap[safeCategory] ? safeCategory : 'general';
        const tagFilter = categoryMap[normalizedCategory];
        
        // Overpass QL Query
        // (node(around:radius,lat,lng)[tag]; way(around:radius,lat,lng)[tag];); out center;
        const query = `
            [out:json][timeout:12];
            (
              node(around:${radiusMeters},${latitude},${longitude})${tagFilter};
              way(around:${radiusMeters},${latitude},${longitude})${tagFilter};
              relation(around:${radiusMeters},${latitude},${longitude})${tagFilter};
            );
            out center 20;
        `;

        console.log(`[Nearby] Querying Overpass for: ${normalizedCategory} within ${radiusMeters}m of ${latitude},${longitude}`);
        const data = await fetchOverpassData(query);

        // Haversine formula to calculate distance in meters
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371000;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        // Transform Overpass elements to frontend format
        const places = (data.elements || []).map(el => {
            // For ways/relations, center is provided by 'out center'
            const plat = el.lat || (el.center && el.center.lat);
            const plng = el.lon || (el.center && el.center.lon);
            
            if (!Number.isFinite(plat) || !Number.isFinite(plng)) return null;

            const tags = el.tags || {};
            const addressParts = [
                tags['addr:street'],
                tags['addr:suburb'],
                tags['addr:city']
            ].filter(Boolean);

            return {
                id: el.id,
                name: tags.name || tags.operator || `${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)}`,
                category: normalizedCategory,
                address: addressParts.length > 0 ? addressParts.join(', ') : (tags['addr:full'] || "Address available via map"),
                phone: tags['phone'] || tags['contact:phone'] || "N/A",
                distance: calculateDistance(latitude, longitude, plat, plng),
                open24Hours: tags['opening_hours'] === '24/7',
                verified: true,
                rating: 0,
                lat: plat,
                lng: plng
            };
        }).filter(Boolean);

        // Sort by closest
        places.sort((a, b) => a.distance - b.distance);

        const payload = places.length === 0
            ? { places, message: `No ${normalizedCategory} found within ${radiusMeters / 1000}km. Try a larger search area.` }
            : { places };
        nearbyCache.set(cacheKey, { payload, expiresAt: Date.now() + NEARBY_CACHE_TTL_MS });
        if (nearbyCache.size > 500) {
            for (const [key, entry] of nearbyCache) {
                if (entry.expiresAt <= Date.now()) nearbyCache.delete(key);
            }
        }

        console.log(`[Nearby] Found ${places.length} precise POIs from Overpass`);
        return res.json(payload);
    } catch (error) {
        console.error('[Nearby API Error]', error.message);
        return res.status(503).json({
            message: 'Nearby search is temporarily unavailable. Please try again shortly.'
        });
    }
};

module.exports = {
    findNearby
};
