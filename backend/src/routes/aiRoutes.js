const express = require('express');
const router = express.Router();
const { createItinerary, recommendPlaces, travelGuide, chatbot, translateMessage } = require('../controllers/aiController');
const { streamItinerary } = require('../controllers/streamController');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate, itinerarySchema, chatSchema, translateSchema } = require('../middleware/validate');

// SSE streaming endpoint — GET with query params (must be before POST /itinerary)
router.get('/itinerary/stream', aiLimiter, streamItinerary);

// Standard REST endpoints (rate-limited to 30 req/hour per IP)
router.post('/itinerary', aiLimiter, validate(itinerarySchema), createItinerary);
router.post('/recommend', aiLimiter, recommendPlaces);
router.post('/guide', aiLimiter, travelGuide);
router.post('/chat', aiLimiter, validate(chatSchema), chatbot);
router.post('/translate', aiLimiter, validate(translateSchema), translateMessage);

module.exports = router;
