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

            // 1. Firebase Token Verification (RS256)
            let decoded;
            let firebaseUser = null;
            const { verifyFirebaseToken } = require('../utils/firebaseTokenVerifier');

            try {
                firebaseUser = await verifyFirebaseToken(token);
                decoded = { id: firebaseUser.sub, email: firebaseUser.email, name: firebaseUser.name || 'Traveler' };
            } catch (firebaseErr) {
                // Fallback to custom JWT if necessary
                try {
                    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_demo');
                } catch (jwtErr) {
                    throw new Error('Invalid authentication token');
                }
            }

            // 2. User Resolution / Auto-Creation
            if (process.env.MONGODB_URI) {
                let user = await User.findOne({ 
                    $or: [ { firebaseUid: decoded.id }, { email: decoded.email } ]
                });

                if (!user && firebaseUser) {
                    user = await User.create({
                        name: decoded.name,
                        email: decoded.email,
                        firebaseUid: decoded.id,
                        password: require('crypto').randomBytes(16).toString('hex'),
                        nationality: 'India',
                        language: 'English'
                    });
                    console.log(`[Auth] Auto-created user for UID: ${decoded.id}`);
                }

                req.user = user || { _id: decoded.id, firebaseUid: decoded.id, name: decoded.name, email: decoded.email };
            } else {
                req.user = { _id: decoded.id, firebaseUid: decoded.id, name: decoded.name, email: decoded.email };
            }

            return next();
        } catch (error) {
            console.error('[Auth Middleware] Verification Error:', error.message);
            return res.status(401).json({ message: `Not authorized, token verification failed: ${error.message}` });
        }
    }

    if (!token) {
        console.warn(`[Auth Middleware] No token provided for protected route: ${req.originalUrl}`);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            let decoded;
            let firebaseUser = null;
            const { verifyFirebaseToken } = require('../utils/firebaseTokenVerifier');

            try {
                firebaseUser = await verifyFirebaseToken(token);
                decoded = { id: firebaseUser.sub, email: firebaseUser.email, name: firebaseUser.name || 'Traveler' };
            } catch (firebaseErr) {
                try {
                    decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'fallback_secret_for_demo');
                } catch (jwtErr) {
                    throw new Error('Invalid authentication token');
                }
            }

            if (process.env.MONGODB_URI) {
                const User = require('../models/User');
                let user = await User.findOne({ 
                    $or: [ { firebaseUid: decoded.id }, { email: decoded.email } ]
                });
                req.user = user || { _id: decoded.id, firebaseUid: decoded.id, name: decoded.name, email: decoded.email };
            } else {
                req.user = { _id: decoded.id, firebaseUid: decoded.id, name: decoded.name, email: decoded.email };
            }
        } catch (error) {
            console.error('[Optional Auth Middleware] Verification Error:', error.message);
        }
    }
    // Proceed regardless of token presence
    next();
};

module.exports = { protect, optionalAuth };
