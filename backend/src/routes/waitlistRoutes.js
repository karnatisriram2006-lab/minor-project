const express = require('express');
const router = express.Router();

// MongoDB-backed waitlist (optional). Falls back to in-memory for demo if DB is not configured.
let useDb = !!process.env.MONGODB_URI
let waitlist = [];
let WaitlistModel
try {
  // Lazy require to avoid import-time failures if Mongo is not configured
  WaitlistModel = require('../models/Waitlist')
} catch {
  WaitlistModel = null
}

// @desc    Add email to waitlist
// @route   POST /api/waitlist
// @access  Public
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

    // If DB is configured, use it
    if (WaitlistModel) {
      try {
        const existing = await WaitlistModel.findOne({ email })
        if (existing) {
          return res.status(200).json({ message: 'Already registered' })
        }
        const doc = await WaitlistModel.create({ email, joinedAt: new Date() })
        return res.status(201).json({ message: 'Added to waitlist', id: doc._id })
      } catch (err) {
        // Fallback to in-memory if DB operation fails
        useDb = false
      }
    }

    // Fallback: In-memory waitlist for demo
    // Check for duplicate
    if (waitlist.find(entry => entry.email === email)) {
      return res.status(200).json({ message: 'Already registered' })
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
