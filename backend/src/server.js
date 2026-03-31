const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[Server] Environment loaded. Groq Model:', process.env.GROQ_MODEL || 'llama3-8b-8192', '| API Key set:', !!process.env.GROQ_API_KEY);
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(base => base.trim()) 
    : ['*'];

console.log('[Server] CORS Allowed Origins:', allowedOrigins.includes('*') ? 'ALL (*)' : allowedOrigins.join(', '));

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps/CURL) or if * is allowed
        if (!origin || allowedOrigins.includes('*')) {
            return callback(null, origin || true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            console.warn(`[CORS Blocked] Origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

// User requested aliases
app.post('/api/chat', (req, res) => res.redirect(307, '/api/ai/chat'));
app.post('/api/budget', (req, res) => res.redirect(307, '/api/budget/optimize'));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
