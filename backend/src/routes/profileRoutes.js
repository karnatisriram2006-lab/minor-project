const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', searchUsers);

router.route('/')
    .get(protect, getProfile)
    .put(protect, updateProfile);

module.exports = router;
