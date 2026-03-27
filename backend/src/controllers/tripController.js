const SavedTrip = require('../models/SavedTrip');

// @desc    Save an itinerary
// @route   POST /api/trips/save
// @access  Private
const saveTrip = async (req, res) => {
    const { city, startDate, endDate, budget, itinerary } = req.body;

    try {
        if (!process.env.MONGODB_URI) {
            return res.status(201).json({
                _id: 'demo_trip_123',
                userId: req.user._id,
                city,
                dates: { startDate, endDate },
                budget,
                itinerary,
                message: 'Demo trip saved temporarily.'
            });
        }

        const trip = await SavedTrip.create({
            userId: req.user._id,
            city,
            dates: { startDate, endDate },
            budget,
            itinerary
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all saved trips for user
// @route   GET /api/trips
// @access  Private
const getUserTrips = async (req, res) => {
    try {
        let trips = [];

        if (process.env.MONGODB_URI) {
            trips = await SavedTrip.find({ userId: req.user._id }).sort({ createdAt: -1 });
        } else {
            trips = [
                {
                    _id: 'demo_trip_1',
                    city: 'Jaipur',
                    dates: { startDate: '2023-11-10T00:00:00.000Z', endDate: '2023-11-14T00:00:00.000Z' },
                    budget: 500,
                    itinerary: [{ day: 1, activities: ['Amer Fort', 'Hawa Mahal'] }]
                }
            ];
        }

        res.json({ trips });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveTrip,
    getUserTrips
};
