const express = require('express');
const router = express.Router();
const { createRequest, getMatches, matchCompanions } = require('../controllers/companionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createRequest);
router.get('/matches', protect, getMatches);
router.post('/match', protect, matchCompanions);

module.exports = router;
