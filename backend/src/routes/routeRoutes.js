const express = require('express');
const router = express.Router();
const { optimizeRoute } = require('../controllers/routeController');

router.post('/optimize', optimizeRoute);

module.exports = router;
