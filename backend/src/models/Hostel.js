const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    amenities: {
        type: [String],
        default: [],
    },
    imageUrl: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
