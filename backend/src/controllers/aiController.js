const { 
    generateItineraryAgent, 
    recommendPlacesAgent, 
    travelGuideAgent, 
    chatCompletion,
    translateAgent,
    validateItinerary
} = require('../services/groqService');
const { getFromCache, saveToCache, getTouristPlaces } = require('../services/itineraryStorageService');
const { enrichItineraryCoords } = require('../services/geocodeService');

// @desc    Generate AI itinerary (Travel Planning Agent)
// @route   POST /api/ai/itinerary
const createItinerary = async (req, res) => {
    const { city, days, budget, interests } = req.body;

    if (!city || !days) {
        console.warn('[AI Itinerary] Missing city or days');
        return res.status(400).json({ message: 'City and days are required' });
    }

    // ⬆ Bump this version whenever the itinerary format/geocoding changes.
    // Old cache entries are silently ignored and fresh geocoded results are stored.
    const CACHE_VERSION = 'v4-strict-geocoding';
    const cacheKey = `itinerary-${CACHE_VERSION}-${city.toLowerCase()}-${days}-${budget}-${interests}`;

    try {
        console.log(`[AI Itinerary] Generating for ${city}, ${days} days...`);
        const cachedResult = await getFromCache(cacheKey);
        if (cachedResult) {
            console.log(`[AI Itinerary] Cache hit for ${cacheKey}`);
            return res.json(cachedResult);
        }

        // Generate raw itinerary from AI (no lat/lng — coordinates are geocoded below)
        const rawItinerary = await generateItineraryAgent(city, days, interests || 'general', budget || 'medium');
        const rawDays = rawItinerary.itinerary || rawItinerary;

        // Step 1: Geocode every stop via Nominatim for accurate coordinates
        console.log(`[AI Itinerary] Geocoding coordinates for ${city}...`);
        const geocodedDays = await enrichItineraryCoords(rawDays, city);

        // Step 2: Validate and optimize route order now that real coords are available
        const { itinerary: optimizedItinerary, warnings } = validateItinerary(geocodedDays);

        console.log(`[AI Itinerary] Successfully generated itinerary for ${city}`);
        if (warnings.length > 0) console.log('[AI Itinerary] Warnings:', warnings);

        const result = { itinerary: optimizedItinerary, warnings, city, days };

        await saveToCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        console.error('[AI Itinerary Controller Error]:', error.message, error.stack);
        res.status(500).json({ message: 'Itinerary generation failed', error: error.message });
    }
};

// @desc    Suggest places (Place Recommendation Agent)
// @route   POST /api/ai/recommend
const recommendPlaces = async (req, res) => {
    const { preferences, location } = req.body;

    if (!preferences) {
        return res.status(400).json({ message: 'Preferences are required' });
    }

    try {
        const recommendations = await recommendPlacesAgent(preferences, location);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Recommendations failed', error: error.message });
    }
};

// @desc    Identify landmark (Travel Guide Agent)
// @route   POST /api/ai/guide
const travelGuide = async (req, res) => {
    const { landmark } = req.body;

    if (!landmark) {
        return res.status(400).json({ message: 'Landmark name is required' });
    }

    try {
        const guideInfo = await travelGuideAgent(landmark);
        res.json(guideInfo);
    } catch (error) {
        res.status(500).json({ message: 'Guide information failed', error: error.message });
    }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
const chatbot = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const reply = await chatCompletion(message);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Translate text to target language
// @route   POST /api/ai/translate
const translateMessage = async (req, res) => {
    const { text, lang } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text to translate is required' });
    }

    try {
        const translation = await translateAgent(text, lang || 'Marathi');
        res.json({ translation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createItinerary,
    recommendPlaces,
    travelGuide,
    chatbot,
    translateMessage
};
