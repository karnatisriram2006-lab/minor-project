const mongoose = require('mongoose');

const companionRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    dates: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    },
    interests: {
        type: [String],
        default: [],
    },
    budgetRange: {
        type: String,
        default: '5000-10000',
    },
    status: {
        type: String,
        enum: ['active', 'matched', 'closed'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('CompanionRequest', companionRequestSchema);
