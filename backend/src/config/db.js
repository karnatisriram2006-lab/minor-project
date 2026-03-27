const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If MONGODB_URI is not set, we'll just log and continue for demo purposes
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not found. Starting server without MongoDB connection (demo mode).');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ Error connecting to MongoDB: ${error.message}`);
    console.warn('Continuing to run server in demo mode without Database connection.');
    // process.exit(1); // Removed to prevent crashing the entire backend if DB fails
  }
};

module.exports = connectDB;
