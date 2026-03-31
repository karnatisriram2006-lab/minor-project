const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    cuisine: {
        type: [String],
        default: [],
    },
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$', '$$$$'],
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // Dietary tags for allergy-aware filtering
    dietaryTags: {
        type: [String],
        enum: ['vegetarian', 'vegan', 'jain', 'halal', 'gluten-free', 'nut-free', 'dairy-free'],
        default: []
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
restaurantSchema.index({ location: '2dsphere' });

// Pre-save hook to sync legacy coordinates with GeoJSON
restaurantSchema.pre('save', function(next) {
    if (this.coordinates && this.coordinates.lat && this.coordinates.lng) {
        this.location = {
            type: 'Point',
            coordinates: [this.coordinates.lng, this.coordinates.lat]
        };
    }
    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
