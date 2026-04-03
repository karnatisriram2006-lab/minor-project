const express = require('express');
const router = express.Router();

// In-memory waitlist for demo (replace with MongoDB in production)
const waitlist = [];

// @desc    Add email to waitlist
// @route   POST /api/waitlist
// @access  Public
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check for duplicate
    if (waitlist.find(entry => entry.email === email)) {
        return res.status(409).json({ message: 'Email already on the waitlist' });
    }

    waitlist.push({ email, joinedAt: new Date() });
    console.log(`[Waitlist] ${email} joined (${waitlist.length} total)`);
    res.status(201).json({ message: 'Added to waitlist' });
});

// @desc    Get waitlist count
// @route   GET /api/waitlist
// @access  Public
router.get('/', async (req, res) => {
    res.json({ count: waitlist.length });
});

module.exports = router;
