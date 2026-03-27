const express = require('express');
const router = express.Router();
const { optimizeBudget } = require('../controllers/budgetController');

router.post('/optimize', optimizeBudget);

module.exports = router;
