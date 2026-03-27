const mongoose = require('mongoose');

const savedTripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    dates: {
        startDate: { type: Date },
        endDate: { type: Date }
    },
    budget: {
        type: Number,
    },
    itinerary: {
        type: Object, // Structured JSON of the output
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('SavedTrip', savedTripSchema);
