const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[Server] Environment loaded. Groq Model:', process.env.GROQ_MODEL || 'llama3-8b-8192', '| API Key set:', !!process.env.GROQ_API_KEY);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const routeRoutes = require('./routes/routeRoutes');
const discoverRoutes = require('./routes/discoverRoutes');
const companionRoutes = require('./routes/companionRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const tripRoutes = require('./routes/tripRoutes');
const poiRoutes = require('./routes/poiRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const messagesRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profileRoutes');

// Connect to database
connectDB();

const app = express();

// Global Request/Response Logger for Debugging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.warn(`[BACKEND TRACE] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(base => base.trim()) 
    : ['*'];

console.log('[Server] CORS Allowed Origins:', allowedOrigins.includes('*') ? 'ALL (*)' : allowedOrigins.join(', '));

app.use(cors({
    origin: true, // Echo back the request origin for maximum compatibility with credentials
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

// Main Root Route
app.get('/', (req, res) => {
    res.send('Incredible India API is running...');
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/nearby', poiRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use((req, res, next) => {
    console.warn(`[404 NOT MATCHED] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(`[Error] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') console.error(err.stack);
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
