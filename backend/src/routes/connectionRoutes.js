const express = require('express');
const router = express.Router();
const { sendRequest, getConnections, getPendingRequests, respondToRequest } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, sendRequest);
router.get('/', protect, getConnections);
router.get('/pending', protect, getPendingRequests);
router.put('/respond', protect, respondToRequest);

module.exports = router;
