const express = require('express')
const router = express.Router()
const Message = require('../models/Message')

// Simple messages endpoint (demo/backwards-compatible)
router.post('/', async (req, res) => {
  const { toName, destination, message } = req.body || {}
  if (!toName || !message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Invalid payload' })
  }
  // In a real app, you'd attach req.user._id as fromUserId after JWT auth
  try {
    const doc = await Message.create({ toName, destination, message, /* fromUserId: req.user?.id */ })
    return res.status(201).json({ ok: true, id: doc._id })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save message' })
  }
})

module.exports = router
