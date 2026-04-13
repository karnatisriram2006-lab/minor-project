const User = require('../models/User');
const Trip = require('../models/Trip');
const SavedTrip = require('../models/SavedTrip');

// @desc    Get user profile & statistics
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -loginAttempts -lockUntil')
            .populate('bookmarkedTrips', 'title destination duration isPublic likesCount createdAt');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Calculate statistics
        const tripsCount = await Trip.countDocuments({ userId: req.user.firebaseUid });
        
        // Find public trips to aggregate total likes received
        const publicTrips = await Trip.find({ userId: req.user.firebaseUid, isPublic: true });
        const totalLikesReceived = publicTrips.reduce((acc, trip) => acc + trip.likesCount, 0);

        res.json({
            user,
            stats: {
                tripsCount,
                publicTripsCount: publicTrips.length,
                totalLikesReceived,
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const { name, bio, nationality, language, interests } = req.body;

        user.name = name || user.name;
        if (bio !== undefined) user.bio = bio;
        if (nationality !== undefined) user.nationality = nationality;
        if (language !== undefined) user.language = language;
        if (interests !== undefined) user.interests = JSON.parse(interests || '[]');

        // If avatar file upload is added later, handle S3/Cloudinary URL here
        
        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            nationality: updatedUser.nationality,
            language: updatedUser.language,
            interests: updatedUser.interests,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get public profile of another traveler
// @route   GET /api/profile/:uid
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
    try {
        const { uid } = req.params;

        if (!process.env.MONGODB_URI) {
            // Demo mode fallback
            return res.json({
                user: {
                    name: 'Sriram Karnati',
                    bio: 'Loves exploring hidden gems in India.',
                    interests: ['Photography', 'Heritage', 'Food'],
                    avatar: null,
                },
                stats: {
                    trips: 12,
                    destinations: 45,
                    likes: 120
                }
            });
        }

        const user = await User.findOne({ firebaseUid: uid })
            .select('name avatar bio interests nationality language');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Calculate statistics
        const tripsCount = await Trip.countDocuments({ userId: uid });
        const publicTrips = await Trip.find({ userId: uid, isPublic: true });
        const totalLikesReceived = publicTrips.reduce((acc, trip) => acc + (trip.likesCount || 0), 0);

        res.json({
            user,
            stats: {
                trips: tripsCount,
                destinations: publicTrips.length,
                likes: totalLikesReceived
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Search public users
// @route   GET /api/profile/search?q=XYZ
// @access  Public
exports.searchUsers = async (req, res, next) => {
    try {
        const query = (req.query.q || '').toLowerCase();
        
        if (!query.trim()) {
            return res.json({ users: [] });
        }

        // Demo mode fallback — no MongoDB
        if (!process.env.MONGODB_URI) {
            const demoUsers = [
                {
                    firebaseUid: 'traveler_123',
                    name: 'Sriram Karnati',
                    avatar: null,
                    bio: 'Loves exploring hidden gems in India.'
                },
                {
                    firebaseUid: 'traveler_456',
                    name: 'Aishwarya Singh',
                    avatar: null,
                    bio: 'Mountain lover and photographer.'
                },
                {
                    firebaseUid: 'traveler_789',
                    name: 'Rahul Sharma',
                    avatar: null,
                    bio: 'Budget traveler and foodie.'
                }
            ];

            const filtered = demoUsers.filter(u => 
                u.name.toLowerCase().includes(query)
            );

            return res.json({ users: filtered });
        }

        const regex = new RegExp(query, 'i');
        
        // Find users matching name
        const users = await User.find({
            name: { $regex: regex }
        })
        .select('name avatar bio firebaseUid')
        .limit(10)
        .lean();

        res.json({ users });
    } catch (err) {
        next(err);
    }
};
