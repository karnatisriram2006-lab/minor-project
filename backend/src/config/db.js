const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let connectionPromise;

const getConnectionErrorMessage = (error) => {
  if (error?.code === 18 || /authentication failed/i.test(error?.message || '')) {
    return 'MongoDB authentication failed. Verify the Atlas database username and password, and percent-encode special characters.';
  }

  if (error?.name === 'MongoServerSelectionError') {
    return 'MongoDB server selection timed out. Check Atlas Network Access, DNS, and outbound network access.';
  }

  return `MongoDB connection failed (${error?.name || 'Error'}${error?.code ? `, code ${error.code}` : ''}).`;
};

const connectDB = async ({ required = false } = {}) => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    if (required) {
      throw new Error('MONGODB_URI is required for this operation.');
    }

    console.warn('[DB] MONGODB_URI is not set. Starting in demo/mock mode without MongoDB.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then(({ connection }) => {
        console.log(`[DB] Connected to MongoDB at ${connection.host}, database "${connection.name}".`);
        return connection;
      })
      .catch((error) => {
        const message = getConnectionErrorMessage(error);
        console.error(`[DB] ${message}`);
        throw new Error(message);
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB connection disconnected.');
});

module.exports = connectDB;
