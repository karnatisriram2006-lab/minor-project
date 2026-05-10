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
        
        const url = `https://photon.komoot.io/api/?q=${amenity}&lat=${lat}&lon=${lng}&limit=40`;

        console.log(`[Nearby] Searching Photon for: ${amenity} near ${lat},${lng}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, { 
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Photon returned ${response.status}`);
        }

        // Haversine formula to calculate distance in meters
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371000; // Earth's radius in meters
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        const data = await response.json();

        // Transform Photon GeoJSON results to frontend format
        let places = (data.features || []).map(f => {
            const placeLat = f.geometry.coordinates[1];
            const placeLng = f.geometry.coordinates[0];
            const dist = calculateDistance(parseFloat(lat), parseFloat(lng), placeLat, placeLng);
            
            const p = f.properties;
            const addressParts = [p.street, p.district, p.locality, p.city, p.state].filter(Boolean);
            
            return {
                id: p.osm_id || Math.random().toString(),
                name: p.name || `${categoryMap[category] || 'Place'}`,
                category: amenity,
                address: addressParts.length > 0 ? addressParts.join(', ') : "Address unavailable",
                phone: "N/A",
                distance: dist,
                open24Hours: false,
                verified: true,
                rating: 4.0,
                lat: placeLat,
                lng: placeLng
            };
        });

        // Enforce radius (since Photon just uses lat/lon as a proximity bias, not a hard filter)
        places = places.filter(p => p.distance <= radius);
        
        // Sort by closest
        places.sort((a, b) => a.distance - b.distance);
        
        // Return top 15 nearest
        places = places.slice(0, 15);

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
