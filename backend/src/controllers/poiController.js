// @desc    Find nearby places using Nominatim (OpenStreetMap Search)
// @route   GET /api/nearby?lat=...&lng=...&category=hospital&radius=5000
// @access  Public
const findNearby = async (req, res) => {
    const { lat, lng, category = 'general', radius = 5000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    try {
        // Map categories to Nominatim amenity types
        const categoryMap = {
            hospital: 'hospital',
            police: 'police',
            pharmacy: 'pharmacy',
            atm: 'atm',
            restaurant: 'restaurant',
            hostel: 'hostel',
            'tourist-info': 'information',
            'fire-station': 'fire_station',
            embassy: 'embassy',
            general: 'hospital' // Default fallback
        };

        const amenity = categoryMap[category] || 'hospital';
        
        // Use Nominatim search with viewbox (bounding box around user location)
        // Convert radius (meters) to approximate degrees (~0.009 per km)
        const deg = (radius / 1000) * 0.009;
        const viewbox = `${parseFloat(lng) - deg},${parseFloat(lat) + deg},${parseFloat(lng) + deg},${parseFloat(lat) - deg}`;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${amenity}&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1&accept-language=en`;

        console.log(`[Nearby] Searching Nominatim for: ${amenity} near ${lat},${lng}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, { 
            signal: controller.signal,
            headers: {
                'User-Agent': 'IncredibleIndiaTourismApp/1.0'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Nominatim returned ${response.status}`);
        }

        const data = await response.json();

        // Transform Nominatim results to frontend format
        const places = data.map(el => ({
            name: el.display_name?.split(',')[0] || "Unnamed Place",
            category: amenity,
            address: el.display_name || "Address unavailable",
            phone: "N/A", // Nominatim doesn't always include phone
            distance: 0,
            open24Hours: false,
            verified: true,
            rating: 4.0,
            lat: parseFloat(el.lat),
            lng: parseFloat(el.lon)
        }));

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
