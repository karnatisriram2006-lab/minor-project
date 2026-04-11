const mongoose = require('mongoose');

async function fixTrips() {
  await mongoose.connect('mongodb+srv://karnatisriram2006_db_user:Srirama2@cluster0.mcg78uv.mongodb.net/?appName=Cluster0');
  const Trip = mongoose.model('Trip', new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed }), 'trips');
  
  // Update all anonymous trips to belong to the user
  const result = await Trip.updateMany(
    { userId: { $in: ['anonymous', null, undefined] } },
    { $set: { userId: new mongoose.Types.ObjectId('69ca6ebb6c48acc6603e9b9d') } }
  );
  
  console.log(`Updated ${result.modifiedCount} trips to link to user 69ca6ebb6c48acc6603e9b9d.`);
  process.exit(0);
}

fixTrips().catch(e => { console.error(e); process.exit(1); });
