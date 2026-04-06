const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toName: { type: String, required: true },
  destination: { type: String },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Message', messageSchema)
