const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_demo');

            // Use mocked or real user validation
            if (process.env.MONGODB_URI) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                // Fallback demo user
                req.user = { _id: decoded.id, name: 'Demo User', email: 'demo@example.com' };
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
