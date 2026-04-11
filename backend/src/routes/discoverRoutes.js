const express = require('express');
const router = express.Router();
const { getHostels, getRestaurants, getPopularPlaces } = require('../controllers/discoverController');
const { discoverLimiter } = require('../middleware/rateLimiter');

router.get('/hostels', discoverLimiter, getHostels);
router.get('/restaurants', discoverLimiter, getRestaurants);
router.get('/popular', discoverLimiter, getPopularPlaces);

module.exports = router;
