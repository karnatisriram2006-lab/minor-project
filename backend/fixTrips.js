const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

async function fixTrips() {
  try {
    await connectDB({ required: true });
    const Trip = mongoose.model(
      'Trip',
      new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed }),
      'trips'
    );

    const result = await Trip.updateMany(
      { userId: { $in: ['anonymous', null, undefined] } },
      { $set: { userId: new mongoose.Types.ObjectId('69ca6ebb6c48acc6603e9b9d') } }
    );

    console.log(`Updated ${result.modifiedCount} trips to link to user 69ca6ebb6c48acc6603e9b9d.`);
  } finally {
    await mongoose.disconnect();
  }
}

fixTrips().catch((error) => {
  console.error('[Trips] Could not update trips:', error.message);
  process.exitCode = 1;
});
