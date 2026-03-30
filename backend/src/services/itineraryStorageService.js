const SavedTrip = require('../models/SavedTrip');
const Cache = require('../models/Cache');
const path = require('path');
const fs = require('fs').promises;

const DATASET_PATH = path.join(__dirname, '../../data/touristPlaces.json');

/**
 * Get all tourist places from the static dataset
 */
const getTouristPlaces = async () => {
    try {
        const data = await fs.readFile(DATASET_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[Storage Service] Error reading dataset:', error.message);
        return [];
    }
};

/**
 * Get itinerary from cache
 */
const getFromCache = async (key) => {
    try {
        if (!process.env.MONGODB_URI) return null;
        const entry = await Cache.findOne({ key });
        return entry ? entry.value : null;
    } catch (error) {
        console.error('[Storage Service] Cache read error:', error.message);
        return null;
    }
};

/**
 * Save itinerary to cache
 */
const saveToCache = async (key, itinerary) => {
    try {
        if (!process.env.MONGODB_URI) return;
        await Cache.findOneAndUpdate(
            { key },
            { value: itinerary },
            { upsert: true, new: true }
        );
        console.log(`[Storage Service] Cached new itinerary in MongoDB for: ${key}`);
    } catch (error) {
        console.error('[Storage Service] Cache write error:', error.message);
    }
};

module.exports = {
    getTouristPlaces,
    getFromCache,
    saveToCache
};
