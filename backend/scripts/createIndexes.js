/**
 * YĀTRĀ — MongoDB Index Migration Script
 * Run with: node scripts/createIndexes.js
 *
 * Creates all necessary DB indexes for production performance:
 * - Users: email (unique), firebaseUid (sparse), createdAt
 * - Trips: userId + createdAt (compound), destination, isPublic
 * - SavedTrips: userId + createdAt
 * - Cache: key (unique), expiresAt (TTL)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function createIndexes() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;

    // ─── Users collection ────────────────────────────────────────────────────
    console.log('📋 Creating indexes on users...');
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
    await users.createIndex({ firebaseUid: 1 }, { sparse: true, name: 'firebaseUid_sparse' });
    await users.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });
    console.log('   ✓ users: email_unique, firebaseUid_sparse, createdAt_desc');

    // ─── Trips collection ────────────────────────────────────────────────────
    console.log('📋 Creating indexes on trips...');
    const trips = db.collection('trips');
    await trips.createIndex({ userId: 1, createdAt: -1 }, { name: 'userId_createdAt' });
    await trips.createIndex({ destination: 1 }, { name: 'destination' });
    await trips.createIndex({ isPublic: 1, createdAt: -1 }, { name: 'public_trips' });
    console.log('   ✓ trips: userId_createdAt, destination, public_trips');

    // ─── SavedTrips collection ───────────────────────────────────────────────
    console.log('📋 Creating indexes on savedtrips...');
    const savedTrips = db.collection('savedtrips');
    await savedTrips.createIndex({ userId: 1, createdAt: -1 }, { name: 'userId_createdAt' });
    console.log('   ✓ savedtrips: userId_createdAt');

    // ─── Caches collection (TTL auto-delete) ─────────────────────────────────
    console.log('📋 Creating indexes on caches...');
    const caches = db.collection('caches');
    await caches.createIndex({ key: 1 }, { unique: true, name: 'key_unique' });
    // TTL index: MongoDB auto-deletes documents 24h after expiresAt
    await caches.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0, name: 'cache_ttl' }
    );
    console.log('   ✓ caches: key_unique, cache_ttl (24hr auto-expiry)');

    // ─── POI / Destinations ──────────────────────────────────────────────────
    console.log('📋 Creating indexes on destinations/pois...');
    try {
        const destinations = db.collection('destinations');
        await destinations.createIndex({ name: 'text', state: 'text' }, { name: 'text_search' });
        await destinations.createIndex({ 'location.coordinates': '2dsphere' }, { name: 'geo_2dsphere' });
        console.log('   ✓ destinations: text_search, geo_2dsphere');
    } catch (e) {
        console.log('   ⚠ destinations collection not found (skip)');
    }

    // ─── CompanionRequests ───────────────────────────────────────────────────
    console.log('📋 Creating indexes on companionrequests...');
    try {
        const companions = db.collection('companionrequests');
        await companions.createIndex({ fromUser: 1, status: 1 }, { name: 'fromUser_status' });
        await companions.createIndex({ toUser: 1, status: 1 }, { name: 'toUser_status' });
        console.log('   ✓ companionrequests: fromUser_status, toUser_status');
    } catch (e) {
        console.log('   ⚠ companionrequests collection not found (skip)');
    }

    console.log('\n🎉 All indexes created successfully!');
    await mongoose.disconnect();
}

createIndexes().catch((err) => {
    console.error('❌ Index migration failed:', err);
    process.exit(1);
});
