const express = require('express');
const router = express.Router();
const { getHostels, getRestaurants, getPopularPlaces } = require('../controllers/discoverController');

router.get('/hostels', getHostels);
router.get('/restaurants', getRestaurants);
router.get('/popular', getPopularPlaces);

module.exports = router;
