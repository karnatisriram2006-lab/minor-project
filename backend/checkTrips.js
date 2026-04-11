const mongoose = require('mongoose');

async function checkTrips() {
  await mongoose.connect('mongodb+srv://karnatisriram2006_db_user:Srirama2@cluster0.mcg78uv.mongodb.net/?appName=Cluster0');
  const Trip = mongoose.model('Trip', new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, title: String }), 'trips');
  
  const allTrips = await Trip.find({});
  console.log(`Total trips in database: ${allTrips.length}`);
  
  const byUser = {};
  for(let t of allTrips) {
    let uid = String(t.userId);
    byUser[uid] = (byUser[uid] || 0) + 1;
  }
  console.log('Trip counts by userId:', byUser);
  
  process.exit(0);
}

checkTrips().catch(e => { console.error(e); process.exit(1); });
