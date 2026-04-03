const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    budget: {
        type: String,
        default: 'medium',
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    // Use Mixed to accept any format (arrays, strings, objects) without casting errors
    days: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
