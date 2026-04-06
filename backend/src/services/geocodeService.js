/**
 * geocodeService.js
 * Server-side Nominatim geocoding with an in-process LRU cache.
 * Used to correct AI-hallucinated lat/lng on itinerary stops.
 */

const https = require('https');

// Simple in-memory cache to avoid duplicate Nominatim round-trips per session
const _cache = new Map();

/**
 * Fetch coordinates for a place name from Nominatim.
 * Appends ", India" to bias results to the Indian subcontinent.
 * @param {string} name - Place name (e.g. "Hawa Mahal") 
 * @param {string} city  - City context for disambiguation (e.g. "Jaipur")
 * @returns {{ lat: number, lng: number } | null}
 */
async function geocodePlace(name, city = '') {
    // Clean descriptive prefixes
    const cleanName = name.replace(/^(Sunrise at|Visit to|Explore|Dinner at|Lunch at|Breakfast at|Sightseeing at|Relax at|Shopping at|Tour of)\s+/i, '').trim();
    const query = city ? `${cleanName}, ${city}, India` : `${cleanName}, India`;
    const cacheKey = query.toLowerCase();

    if (_cache.has(cacheKey)) return _cache.get(cacheKey);

    const result = await _nominatimFetch(query);
    if (result) {
        _cache.set(cacheKey, result);
        return result;
    }

    // Retry without city scope for lesser-known places
    if (city) {
        const fallbackKey = `${name}, India`.toLowerCase();
        if (_cache.has(fallbackKey)) return _cache.get(fallbackKey);
        const fallback = await _nominatimFetch(`${name}, India`);
        _cache.set(fallbackKey, fallback);
        if (fallback) return fallback;
    }

    _cache.set(cacheKey, null);
    return null;
}

async function _nominatimFetch(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
    try {
        const result = await new Promise((resolve, reject) => {
            const req = https.get(url, {
                headers: {
                    'User-Agent': 'YATRA-planner/1.0 (travel planning app)',
                    'Accept': 'application/json'
                },
                timeout: 4000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch { resolve([]); }
                });
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        });

        if (result && result.length > 0) {
            return { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lon) };
        }
    } catch (err) {
        console.warn(`[Geocode] Nominatim error for "${query}": ${err.message}`);
    }
    return null;
}

/**
 * India bounding box check — coords outside this are clearly wrong.
 */
function isValidIndiaCoord(lat, lng) {
    return lat > 6.0 && lat < 37.5 && lng > 68.0 && lng < 97.5;
}

/**
 * Enrich an itinerary object by geocoding any stop whose coordinates are
 * missing, zero, or outside India's bounding box.
 *
 * @param {Object} itinerary - Raw AI itinerary { day1: [...], day2: [...] }
 * @param {string} city      - Destination city for disambiguation
 * @returns {Object}         - Itinerary with corrected lat/lng values
 */
async function enrichItineraryCoords(itinerary, city = '') {
    const enriched = {};

    for (const [day, activities] of Object.entries(itinerary)) {
        if (!Array.isArray(activities)) {
            enriched[day] = activities;
            continue;
        }

        const enrichedActivities = [];
        for (const act of activities) {
            // Always geocode from Nominatim — never trust AI-generated coordinates
            const coords = await geocodePlace(act.name, city);
            if (coords) {
                console.log(`[Geocode] ✓ "${act.name}" → ${coords.lat}, ${coords.lng}`);
                enrichedActivities.push({ ...act, lat: coords.lat, lng: coords.lng });
            } else {
                // Keep place in itinerary even if geocoding fails; frontend can handle missing coords
                console.warn(`[Geocode] ✗ Could not geocode "${act.name}" in ${city}`);
                enrichedActivities.push({ ...act, lat: null, lng: null });
            }
            // Nominatim usage policy: max 1 request per second
            await new Promise(r => setTimeout(r, 1050));
        }
        enriched[day] = enrichedActivities;
    }

    return enriched;
}

module.exports = { geocodePlace, enrichItineraryCoords, isValidIndiaCoord };
