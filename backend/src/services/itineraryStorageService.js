const fs = require('fs').promises;
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../../cache/itineraryCache.json');
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
        const data = await fs.readFile(CACHE_PATH, 'utf8');
        const cache = JSON.parse(data);
        return cache[key] || null;
    } catch (error) {
        console.error('[Storage Service] Error reading cache:', error.message);
        return null;
    }
};

/**
 * Save itinerary to cache
 */
const saveToCache = async (key, itinerary) => {
    try {
        const data = await fs.readFile(CACHE_PATH, 'utf8');
        const cache = JSON.parse(data);
        cache[key] = itinerary;
        await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
        console.log(`[Storage Service] Cached new itinerary for: ${key}`);
    } catch (error) {
        console.error('[Storage Service] Error writing to cache:', error.message);
    }
};

module.exports = {
    getTouristPlaces,
    getFromCache,
    saveToCache
};
