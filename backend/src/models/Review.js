const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Can be Destination, Hostel, or Restaurant ID
    },
    placeType: {
        type: String,
        enum: ['Destination', 'Hostel', 'Restaurant'],
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
