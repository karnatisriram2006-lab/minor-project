const express = require('express');
const router = express.Router();
const { 
  saveTrip, getUserTrips, createTrip, getTrip, 
  updateTrip, deleteTrip, getCommunityTrips, 
  toggleLikeTrip, toggleBookmarkTrip, searchTrips
} = require('../controllers/tripController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/save', protect, saveTrip);
router.post('/', protect, createTrip); 
router.get('/', protect, getUserTrips); 

// Notice: Put specific routes BEFORE parameterized routes
router.get('/search', searchTrips);
router.get('/community', optionalAuth, getCommunityTrips);

router.get('/:id', optionalAuth, getTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

router.post('/:id/like', protect, toggleLikeTrip);
router.post('/:id/bookmark', protect, toggleBookmarkTrip);

module.exports = router;
