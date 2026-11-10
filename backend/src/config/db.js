const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('[DB] MONGODB_URI is not set. Starting backend in demo/mock mode without MongoDB.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB] MongoDB unavailable; continuing in demo/mock mode. ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: Production environment requires a reachable MongoDB instance.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
