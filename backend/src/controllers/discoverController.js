const Hostel = require('../models/Hostel');
const Restaurant = require('../models/Restaurant');

// @desc    Get nearby hostels
// @route   GET /api/discover/hostels
// @access  Public
const getHostels = async (req, res) => {
    const { city } = req.query;

    try {
        let query = {};
        if (city) {
            // Case insensitive search
            query.city = { $regex: new RegExp(city, 'i') };
        }

        // Since we don't have Google Maps configured right now, try finding in DB
        // Or return mock fallback
        let hostels = [];
        if (process.env.MONGODB_URI) {
            hostels = await Hostel.find(query).limit(10);
        }

        if (hostels.length === 0) {
            // Mock data
            hostels = [
                {
                    _id: 'mock_h_1',
                    name: 'Zostel Delhi',
                    city: city || 'Delhi',
                    price: 15,
                    rating: 4.5,
                    amenities: ['Free WiFi', 'AC', 'Common Room'],
                    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'
                },
                {
                    _id: 'mock_h_2',
                    name: 'Backpacker Panda',
                    city: city || 'Mumbai',
                    price: 12,
                    rating: 4.2,
                    amenities: ['Breakfast', 'Kitchen', 'Laundry'],
                    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427'
                }
            ];
        }

        res.json({ hostels });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get nearby restaurants
// @route   GET /api/discover/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
    const { city } = req.query;

    try {
        let query = {};
        if (city) {
            query.city = { $regex: new RegExp(city, 'i') };
        }

        let restaurants = [];
        if (process.env.MONGODB_URI) {
            restaurants = await Restaurant.find(query).limit(10);
        }

        if (restaurants.length === 0) {
            // Mock data
            restaurants = [
                {
                    _id: 'mock_r_1',
                    name: 'Spice Route Kitchen',
                    city: city || 'Delhi',
                    cuisine: ['North Indian', 'Mughlai'],
                    priceRange: '$$',
                    rating: 4.6,
                    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
                },
                {
                    _id: 'mock_r_2',
                    name: 'Coastal Flavours',
                    city: city || 'Goa',
                    cuisine: ['Seafood', 'Goan'],
                    priceRange: '$$$',
                    rating: 4.8,
                    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9'
                }
            ];
        }

        res.json({ restaurants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get popular tourist places
// @route   GET /api/discover/popular
// @access  Public
const getPopularPlaces = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.resolve(__dirname, '../../data/touristPlaces.json');
        
        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({ message: 'Tourist places dataset not found' });
        }

        const data = fs.readFileSync(dataPath, 'utf8');
        const places = JSON.parse(data);
        
        res.json({ places });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHostels,
    getRestaurants,
    getPopularPlaces
};
