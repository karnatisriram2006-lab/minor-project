/**
 * Seed script to populate MongoDB with sample POIs, Hostels, and Restaurants.
 * Run: node src/seed/seedPOIs.js
 */
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const POI = require('../models/POI');
const Hostel = require('../models/Hostel');
const Restaurant = require('../models/Restaurant');

const connectDB = require('../config/db');

const sampleData = {
    pois: [
        {
            name: "AIIMS Delhi",
            category: "hospital",
            address: "Ansari Nagar East, New Delhi",
            phone: "011-26588500",
            location: { type: "Point", coordinates: [77.2090, 28.5672] },
            verified: true,
            open24Hours: true,
            city: "Delhi"
        },
        {
            name: "Delhi Police HQ",
            category: "police",
            address: "ITO, New Delhi",
            phone: "100",
            location: { type: "Point", coordinates: [77.2410, 28.6280] },
            verified: true,
            open24Hours: true,
            city: "Delhi"
        },
        {
            name: "Jaipur City Hospital",
            category: "hospital",
            address: "JLN Marg, Jaipur",
            phone: "0141-2566051",
            location: { type: "Point", coordinates: [75.8139, 26.9124] },
            verified: true,
            open24Hours: true,
            city: "Jaipur"
        },
        {
            name: "Goa Tourist Police",
            category: "police",
            address: "Panaji, Goa",
            phone: "1932",
            location: { type: "Point", coordinates: [73.8321, 15.4989] },
            verified: true,
            open24Hours: false,
            city: "Goa"
        }
    ],
    hostels: [
        {
            name: "Zostel Delhi",
            city: "Delhi",
            price: 800,
            rating: 4.5,
            location: { type: "Point", coordinates: [77.2295, 28.6328] },
            amenities: ["wifi", "lockers", "cafe"],
            imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Moustache Jaipur",
            city: "Jaipur",
            price: 600,
            rating: 4.7,
            location: { type: "Point", coordinates: [75.8235, 26.9239] },
            amenities: ["rooftop", "events", "bike-rental"],
            imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Goa Backpackers",
            city: "Goa",
            price: 1000,
            rating: 4.3,
            location: { type: "Point", coordinates: [73.7552, 15.5432] },
            amenities: ["pool", "beach-access", "bar"],
            imageUrl: "https://images.unsplash.com/photo-1571896349842-6e53ce41e8f2?auto=format&fit=crop&q=80&w=400"
        }
    ],
    restaurants: [
        {
            name: "Saravana Bhavan",
            city: "Delhi",
            cuisine: ["South Indian", "Vegetarian"],
            priceRange: "$$",
            rating: 4.6,
            dietaryTags: ["vegetarian", "jain", "vegan"],
            location: { type: "Point", coordinates: [77.2167, 28.6304] },
            imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Laxmi Misthan Bhandar",
            city: "Jaipur",
            cuisine: ["Rajasthani", "Sweets"],
            priceRange: "$",
            rating: 4.8,
            dietaryTags: ["vegetarian", "jain"],
            location: { type: "Point", coordinates: [75.8189, 26.9213] },
            imageUrl: "https://images.unsplash.com/photo-1517244683847-745431cd6028?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Thalassa",
            city: "Goa",
            cuisine: ["Greek", "Seafood"],
            priceRange: "$$$",
            rating: 4.5,
            dietaryTags: ["gluten-free", "nut-free"],
            location: { type: "Point", coordinates: [73.7489, 15.5678] },
            imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400"
        }
    ]
};

const seed = async () => {
    try {
        await connectDB();
        console.log('🗑️ Clearing old data...');
        await POI.deleteMany({});
        await Hostel.deleteMany({});
        await Restaurant.deleteMany({});

        console.log('🌱 Inserting POIs...');
        await POI.insertMany(sampleData.pois);
        console.log('🌱 Inserting Hostels...');
        await Hostel.insertMany(sampleData.hostels);
        console.log('🌱 Inserting Restaurants...');
        await Restaurant.insertMany(sampleData.restaurants);

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();
