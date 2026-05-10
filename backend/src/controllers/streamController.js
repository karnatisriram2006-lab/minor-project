/**
 * SSE Streaming Itinerary Endpoint
 * Streams real-time progress events during AI generation so the frontend
 * can show a live progress UI instead of a plain spinner.
 *
 * Events emitted (text/event-stream):
 *   progress  — step update with { step, message, percent }
 *   result    — final itinerary JSON payload
 *   error     — error message if generation fails
 */

const { generateItineraryAgent, validateItinerary } = require('../services/groqService');
const { getFromCache, saveToCache } = require('../services/itineraryStorageService');
const { enrichItineraryCoords }     = require('../services/geocodeService');

const CACHE_VERSION = 'v5-photon-fallback';

/**
 * Helper: write an SSE event to the response stream.
 */
const sendEvent = (res, event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

/**
 * @route   GET /api/ai/itinerary/stream?city=Goa&days=3&budget=medium&interests=beach
 * @access  Public (rate-limited)
 */
const streamItinerary = async (req, res) => {
    const { city, days, budget, interests } = req.query;

    // --- Validate inputs early ---
    if (!city || !days) {
        return res.status(400).json({ message: 'city and days query params are required' });
    }
    const parsedDays = parseInt(days, 10);
    if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 30) {
        return res.status(400).json({ message: 'days must be a number between 1 and 30' });
    }

    // --- Set up SSE headers ---
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Important for Nginx proxies
    res.flushHeaders();

    // Keep connection alive with a heartbeat
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 20000);

    const cleanup = () => clearInterval(heartbeat);

    req.on('close', cleanup);

    try {
        // --- Step 1: Check cache ---
        sendEvent(res, 'progress', {
            step: 1, total: 4,
            message: `Looking up cached itinerary for ${city}...`,
            percent: 5,
        });

        const cacheKey = `itinerary-${CACHE_VERSION}-${city.toLowerCase()}-${parsedDays}-${budget || 'medium'}-${interests || 'general'}`;
        const cached   = await getFromCache(cacheKey);

        if (cached) {
            sendEvent(res, 'progress', { step: 2, total: 4, message: 'Cache hit! Loading your itinerary...', percent: 90 });
            sendEvent(res, 'result', { ...cached, fromCache: true });
            cleanup();
            return res.end();
        }

        // --- Step 2: Generate via AI ---
        sendEvent(res, 'progress', {
            step: 2, total: 4,
            message: `Asking AI to plan your ${parsedDays}-day trip to ${city}...`,
            percent: 20,
        });

        const rawItinerary = await generateItineraryAgent(
            city, parsedDays,
            interests || 'general',
            budget    || 'medium'
        );
        const rawDays = rawItinerary.itinerary || rawItinerary;

        // --- Step 3: Geocode coordinates ---
        sendEvent(res, 'progress', {
            step: 3, total: 4,
            message: `Pinpointing exact locations on the map...`,
            percent: 60,
        });

        const geocodedDays = await enrichItineraryCoords(rawDays, city);

        // --- Step 4: Validate & optimize ---
        sendEvent(res, 'progress', {
            step: 4, total: 4,
            message: 'Optimising your route for the best experience...',
            percent: 85,
        });

        const { itinerary: optimizedItinerary, warnings } = validateItinerary(geocodedDays);

        const result = {
            itinerary: optimizedItinerary,
            warnings,
            city,
            days: parsedDays,
            fromCache: false,
        };

        await saveToCache(cacheKey, result);

        // --- Done ---
        sendEvent(res, 'progress', { step: 4, total: 4, message: 'Your itinerary is ready! 🎉', percent: 100 });
        sendEvent(res, 'result', result);

    } catch (error) {
        console.error('[SSE Itinerary Error]', error.message);
        sendEvent(res, 'error', { message: error.message || 'Itinerary generation failed' });
    } finally {
        cleanup();
        res.end();
    }
};

module.exports = { streamItinerary };
