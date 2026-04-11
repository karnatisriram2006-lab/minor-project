const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, nationality, language } = req.body;

    // Demo mode fallback
    if (!process.env.MONGODB_URI) {
        return res.status(201).json({
            _id: 'demo_user_123',
            name,
            email,
            token: generateToken('demo_user_123'),
            message: 'Demo mode active. User not actually saved to DB.'
        });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            nationality,
            language
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Demo mode fallback
    if (!process.env.MONGODB_URI) {
        return res.json({
            _id: 'demo_user_123',
            name: 'Demo User',
            email,
            token: generateToken('demo_user_123'),
            message: 'Demo mode active. Logged in with demo account.'
        });
    }

    try {
        const user = await User.findOne({ email });

        // Always same error for wrong email/password to prevent user enumeration
        const INVALID_MSG = 'Invalid email or password';

        if (!user) {
            return res.status(401).json({ message: INVALID_MSG });
        }

        // Check if account is locked
        if (user.isLocked) {
            const unlockTime = new Date(user.lockUntil).toLocaleTimeString('en-IN');
            return res.status(423).json({
                message: `Account temporarily locked due to too many failed attempts. Try again after ${unlockTime}.`
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            await user.incrementLoginAttempts();
            const remaining = 5 - (user.loginAttempts + 1);
            const warningMsg = remaining <= 2 && remaining > 0
                ? `${INVALID_MSG}. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lock.`
                : INVALID_MSG;
            return res.status(401).json({ message: warningMsg });
        }

        // Successful login — reset attempts
        await user.resetLoginAttempts();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
    // `req.user` is populated by the authMiddleware
    res.json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};
