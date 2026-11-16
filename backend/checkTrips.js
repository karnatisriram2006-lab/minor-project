const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

async function checkTrips() {
  try {
    await connectDB({ required: true });
    const Trip = mongoose.model(
      'Trip',
      new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, title: String }),
      'trips'
    );

    const allTrips = await Trip.find({});
    console.log(`Total trips in database: ${allTrips.length}`);

    const byUser = {};
    for (const trip of allTrips) {
      const uid = String(trip.userId);
      byUser[uid] = (byUser[uid] || 0) + 1;
    }
    console.log('Trip counts by userId:', byUser);
  } finally {
    await mongoose.disconnect();
  }
}

checkTrips().catch((error) => {
  console.error('[Trips] Could not inspect trips:', error.message);
  process.exitCode = 1;
});
