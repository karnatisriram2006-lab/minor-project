const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['hospital', 'police', 'pharmacy', 'atm', 'embassy', 'tourist-info', 'fire-station'],
        required: true,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
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
    verified: {
        type: Boolean,
        default: false
    },
    open24Hours: {
        type: Boolean,
        default: false
    },
    city: {
        type: String,
    }
}, { timestamps: true });

// 🔑 Geospatial index for "Near Me" queries
poiSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('POI', poiSchema);
