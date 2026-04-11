const rateLimit = require('express-rate-limit');

/**
 * Global limiter — applied to all routes as a baseline DDoS guard.
 * 200 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});

/**
 * Auth limiter — stricter limit for login/register to prevent brute-force.
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
    message: {
        status: 429,
        message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    },
});

/**
 * AI limiter — protects expensive Groq API calls.
 * 30 requests per hour per IP. Generous for real users, blocks scrapers.
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'AI generation limit reached (30/hour). Please wait before generating more itineraries.',
    },
    handler: (req, res, next, options) => {
        console.warn(`[Rate Limit] AI limit hit from IP: ${req.ip} | Route: ${req.originalUrl}`);
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Discover/POI limiter — protects external geocoding API calls.
 * 60 requests per 10 minutes per IP.
 */
const discoverLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Discovery API limit reached. Please slow down your requests.',
    },
});

module.exports = { globalLimiter, authLimiter, aiLimiter, discoverLimiter };
