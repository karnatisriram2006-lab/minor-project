const express = require('express');
const router = express.Router();
const { getEmergencyContacts } = require('../controllers/emergencyController');

router.get('/:city', getEmergencyContacts);

module.exports = router;
