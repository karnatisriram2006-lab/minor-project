const express = require('express');
const router = express.Router();
const { saveTrip, getUserTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, saveTrip);
router.get('/', protect, getUserTrips);

module.exports = router;
