const SavedTrip = require('../models/SavedTrip');
const Trip = require('../models/Trip');

// @desc    Save an itinerary (legacy)
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

// @desc    Save a trip with full itinerary (new format)
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
    console.log('[Trip Create] Received request:', JSON.stringify(req.body).substring(0, 200));
    try {
        const { title, destination, duration, budget, days, isPublic } = req.body;

        if (!title || !destination || !days) {
            console.log('[Trip Create] Missing fields:', { title: !!title, destination: !!destination, days: !!days });
            return res.status(400).json({ message: 'Title, destination, and days are required' });
        }

        // Demo mode — no MongoDB
        if (!process.env.MONGODB_URI) {
            console.log('[Trip Create] Demo mode — returning mock trip');
            return res.status(201).json({
                _id: 'demo_trip_' + Date.now(),
                userId: req.user?._id || 'demo_user',
                title,
                destination,
                duration: duration || days.length,
                budget: budget || 'medium',
                isPublic: isPublic || false,
                days,
                createdAt: new Date(),
                message: 'Trip saved temporarily (demo mode).'
            });
        }

        console.log('[Trip Create] Saving to MongoDB...');
        console.log('[Trip Create] days type:', typeof days, Array.isArray(days));
        console.log('[Trip Create] days[0].activities type:', typeof days?.[0]?.activities);
        
        const userId = req.user?._id || 'anonymous';
        
        // Ensure activities are arrays (AI sometimes returns them as JSON strings)
        const parsedDays = days.map(day => {
            let acts = day.activities;
            if (typeof acts === 'string') {
                try {
                    acts = JSON.parse(acts);
                    console.log('[Trip Create] Parsed activities from string to array');
                } catch (e) {
                    console.error('[Trip Create] Failed to parse activities JSON:', e.message);
                    acts = [];
                }
            }
            if (!Array.isArray(acts)) {
                console.warn('[Trip Create] activities is not an array, wrapping in array');
                acts = [acts];
            }
            return { ...day, activities: acts };
        });

        console.log('[Trip Create] Parsed day 0 activities:', JSON.stringify(parsedDays[0]?.activities).substring(0, 100));

        const trip = await Trip.create({
            userId,
            title,
            destination,
            duration: duration || parsedDays.length,
            budget: budget || 'medium',
            isPublic: isPublic || false,
            days: parsedDays,
        });

        console.log('[Trip Create] Saved trip:', trip._id);
        res.status(201).json(trip);
    } catch (error) {
        console.error('[Trip Create Error]', error.message);
        console.error('[Trip Create Error Stack]', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's trips
// @route   GET /api/trips
// @access  Private
const getUserTrips = async (req, res) => {
    try {
        let trips = [];

        if (process.env.MONGODB_URI) {
            const userId = req.user?._id;
            const query = userId ? { userId } : {};
            
            trips = await Trip.find(query)
                .sort({ createdAt: -1 })
                .lean();

            // Also fetch legacy SavedTrip for backward compat
            if (userId) {
                const legacyTrips = await SavedTrip.find({ userId })
                    .sort({ createdAt: -1 })
                    .lean();

                // Merge and normalize
                trips = [...trips, ...legacyTrips.map(t => ({
                    _id: t._id,
                    title: t.city || 'Untitled Trip',
                    destination: t.city,
                    duration: 0,
                    budget: t.budget,
                    days: t.itinerary || [],
                    createdAt: t.createdAt,
                    isPublic: false,
                }))];
            }
        } else {
            trips = [
                {
                    _id: 'demo_trip_1',
                    title: 'Jaipur Heritage',
                    destination: 'Jaipur',
                    duration: 3,
                    budget: 'medium',
                    days: [{ day: 1, activities: [{ name: 'Amer Fort', time: '09:00', type: 'monument' }] }],
                    createdAt: new Date(),
                    isPublic: false,
                }
            ];
        }

        res.json({ trips });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public (if public) / Private (if owner)
const getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).lean();

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (!trip.isPublic && (!req.user || trip.userId.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'This trip is private' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveTrip,
    getUserTrips,
    createTrip,
    getTrip,
    updateTrip,
    deleteTrip,
};
