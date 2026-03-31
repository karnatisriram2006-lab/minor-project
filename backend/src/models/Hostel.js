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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    amenities: {
        type: [String],
        default: [],
    },
    imageUrl: {
        type: String,
    },
    // Legacy coordinates for backward compatibility
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

// 🔑 Geospatial index for "Near Me" queries
hostelSchema.index({ location: '2dsphere' });

// Pre-save hook to sync legacy coordinates with GeoJSON
hostelSchema.pre('save', function(next) {
    if (this.coordinates && this.coordinates.lat && this.coordinates.lng) {
        this.location = {
            type: 'Point',
            coordinates: [this.coordinates.lng, this.coordinates.lat]
        };
    }
    next();
});

module.exports = mongoose.model('Hostel', hostelSchema);
