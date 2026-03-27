const express = require('express');
const router = express.Router();
const { createItinerary, recommendPlaces, travelGuide, chatbot } = require('../controllers/aiController');

router.post('/itinerary', createItinerary);
router.post('/recommend', recommendPlaces);
router.post('/guide', travelGuide);
router.post('/chat', chatbot);

module.exports = router;
