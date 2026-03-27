const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    openTime: {
        type: String, // HH:MM format
    },
    closeTime: {
        type: String, // HH:MM format
    },
    category: {
        type: String,
        enum: ['monument', 'museum', 'nature', 'religious', 'adventure', 'shopping', 'other'],
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    imageUrl: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
