const express = require('express');
const router = express.Router();
const { saveTrip, getUserTrips, createTrip, getTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, saveTrip);
router.post('/', createTrip);
router.get('/', getUserTrips); // No auth required (works in demo mode)
router.get('/:id', getTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
