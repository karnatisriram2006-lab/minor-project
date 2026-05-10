// @desc    Find nearby places using Nominatim (OpenStreetMap Search)
// @route   GET /api/nearby?lat=...&lng=...&category=hospital&radius=5000
// @access  Public
const findNearby = async (req, res) => {
    const { lat, lng, category = 'general', radius = 5000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
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

        const tagFilter = categoryMap[category] || '["amenity"="hospital"]';
        
        // Overpass QL Query
        // (node(around:radius,lat,lng)[tag]; way(around:radius,lat,lng)[tag];); out center;
        const query = `
            [out:json][timeout:25];
            (
              node(around:${radius},${lat},${lng})${tagFilter};
              way(around:${radius},${lat},${lng})${tagFilter};
              relation(around:${radius},${lat},${lng})${tagFilter};
            );
            out center 20;
        `;

        const url = `https://overpass-api.de/api/interpreter`;

        console.log(`[Nearby] Querying Overpass for: ${category} within ${radius}m of ${lat},${lng}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, { 
            method: 'POST',
            body: 'data=' + encodeURIComponent(query),
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'IncredibleIndiaApp/1.0'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Overpass returned ${response.status}`);
        }

        const data = await response.json();

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
            
            if (!plat || !plng) return null;

            const tags = el.tags || {};
            const addressParts = [
                tags['addr:street'],
                tags['addr:suburb'],
                tags['addr:city']
            ].filter(Boolean);

            return {
                id: el.id,
                name: tags.name || tags.operator || `${category.charAt(0).toUpperCase() + category.slice(1)}`,
                category: category,
                address: addressParts.length > 0 ? addressParts.join(', ') : (tags['addr:full'] || "Address available via map"),
                phone: tags['phone'] || tags['contact:phone'] || "N/A",
                distance: calculateDistance(parseFloat(lat), parseFloat(lng), plat, plng),
                open24Hours: tags['opening_hours'] === '24/7',
                verified: true,
                rating: 4.0,
                lat: plat,
                lng: plng
            };
        }).filter(Boolean);

        // Sort by closest
        places.sort((a, b) => a.distance - b.distance);
        
        if (places.length === 0) {
            return res.json({ 
                places: [], 
                message: `No ${category} found within ${radius/1000}km. Try a larger search area.` 
            });
        }

        console.log(`[Nearby] Found ${places.length} precise POIs from Overpass`);
        res.json({ places });

        if (places.length === 0) {
            return res.json({ 
                places: [], 
                message: `No ${amenity} found nearby. Try increasing the radius.` 
            });
        }

        console.log(`[Nearby] Found ${places.length} real places from Nominatim`);
        res.json({ places });
    } catch (error) {
        console.error('[Nearby API Error]', error.message);
        res.status(500).json({ 
            message: 'Unable to fetch nearby places. Please try again later.',
            error: error.message 
        });
    }
};

module.exports = {
    findNearby
};
