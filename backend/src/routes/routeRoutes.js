const express = require('express');
const router = express.Router();
const { optimizeRoute, geocodeCity, reverseGeocode } = require('../controllers/routeController');

router.post('/optimize', optimizeRoute);
router.get('/geocode', geocodeCity);
router.get('/reverse', reverseGeocode);

module.exports = router;
