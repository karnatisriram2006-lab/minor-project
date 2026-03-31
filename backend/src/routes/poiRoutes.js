const express = require('express');
const router = express.Router();
const { findNearby } = require('../controllers/poiController');

// Single AI-powered endpoint
router.get('/', findNearby);

module.exports = router;
