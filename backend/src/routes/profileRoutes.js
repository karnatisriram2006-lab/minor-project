const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', searchUsers);
router.get('/:uid', getPublicProfile);

router.route('/')
    .get(protect, getProfile)
    .put(protect, updateProfile);

module.exports = router;
