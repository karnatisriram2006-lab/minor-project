const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    requester: {
        type: String, // Firebase UID of the sender
        required: true,
        index: true
    },
    recipient: {
        type: String, // Firebase UID of the receiver
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate connection requests
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
