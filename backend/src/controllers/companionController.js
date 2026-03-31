const CompanionRequest = require('../models/CompanionRequest');
const User = require('../models/User');

// @desc    Create a companion request
// @route   POST /api/companion/request
// @access  Private
const createRequest = async (req, res) => {
    const { destination, startDate, endDate, interests, budgetRange } = req.body;

    try {
        // If in demo mode
        if (!process.env.MONGODB_URI) {
            return res.status(201).json({
                _id: 'demo_req_123',
                userId: req.user._id,
                destination,
                dates: { startDate, endDate },
                interests,
                budgetRange,
                status: 'active'
            });
        }

        const request = await CompanionRequest.create({
            userId: req.user._id,
            destination,
            dates: { startDate, endDate },
            interests,
            budgetRange,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Match companions based on similarity
// @route   POST /api/companion/match
// @access  Private
const matchCompanions = async (req, res) => {
    const { destination, travelDate, budgetRange, interests } = req.body;
    const userInterests = Array.isArray(interests) ? interests : (interests ? [interests] : []);

    try {
        let results = [];

        if (process.env.MONGODB_URI) {
            // Use MongoDB aggregation pipeline for efficient matching
            const matchStage = {
                userId: { $ne: req.user._id },
                status: 'active'
            };

            // Filter by destination if provided (improves performance)
            if (destination) {
                matchStage.destination = { $regex: destination, $options: 'i' };
            }

            results = await CompanionRequest.find(matchStage)
                .populate('userId', 'name interests')
                .limit(50);
        } else {
            // Mock data for demo
            results = [
                { _id: 'm1', userId: { name: 'Rahul Sharma', interests: ['Photography', 'Food', 'Hiking'] }, destination: 'Goa', dates: { startDate: '2024-05-10' }, budgetRange: '5000-10000', interests: ['Photography', 'Food'] },
                { _id: 'm2', userId: { name: 'Priya Patel', interests: ['Culture', 'History'] }, destination: 'Jaipur', dates: { startDate: '2024-06-15' }, budgetRange: '2000-5000', interests: ['Culture', 'History'] },
                { _id: 'm3', userId: { name: 'Amit Kumar', interests: ['Adventure', 'Food'] }, destination: 'Jaipur', dates: { startDate: '2024-06-10' }, budgetRange: '5000-10000', interests: ['Adventure', 'Food'] }
            ];
        }

        const matches = results.map(r => {
            let score = 0;
            
            // 1. Destination Match (Weight: 0.4)
            if (destination && r.destination.toLowerCase() === destination.toLowerCase()) {
                score += 0.4;
            }

            // 2. Date Match (Weight: 0.3)
            if (travelDate && r.dates && r.dates.startDate) {
                const reqDate = new Date(travelDate);
                const matchDate = new Date(r.dates.startDate);
                const diffDays = Math.abs(reqDate - matchDate) / (1000 * 60 * 60 * 24);
                if (diffDays <= 7) score += 0.3; // Within a week
                else if (diffDays <= 14) score += 0.15; // Within 2 weeks
            }

            // 3. Interests Match (Weight: 0.3)
            const otherInterests = r.interests || (r.userId && r.userId.interests) || [];
            if (userInterests.length > 0) {
                const intersection = userInterests.filter(i => otherInterests.includes(i));
                score += (intersection.length / userInterests.length) * 0.3;
            }

            return {
                _id: r._id,
                userId: r.userId,
                destination: r.destination,
                dates: r.dates,
                budgetRange: r.budgetRange,
                interests: r.interests,
                similarityScore: Math.round(score * 100)
            };
        }).filter(m => m.similarityScore > 0);

        res.json({ matches: matches.sort((a, b) => b.similarityScore - a.similarityScore) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active companion requests (legacy/listing)
// @route   GET /api/companion/matches
// @access  Private
const getMatches = async (req, res) => {
    try {
        let results = [];
        if (process.env.MONGODB_URI) {
            results = await CompanionRequest.find({ status: 'active' }).populate('userId', 'name interests');
        } else {
            results = [
                { _id: 'm1', userId: { name: 'Rahul Sharma', interests: ['Photography', 'Food', 'Hiking'] }, destination: 'Goa', budgetRange: '5000-10000' },
                { _id: 'm2', userId: { name: 'Priya Patel', interests: ['Culture', 'History'] }, destination: 'Jaipur', budgetRange: '2000-5000' }
            ];
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getMatches,
    matchCompanions
};
