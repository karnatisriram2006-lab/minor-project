const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If MONGODB_URI is not set, we crash loudly in production.
    if (!process.env.MONGODB_URI) {
      console.error('FATAL: MONGODB_URI is not set. Exiting.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`FATAL: Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
