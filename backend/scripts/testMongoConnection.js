const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

async function testMongoConnection() {
  let collection;
  const testId = `connection-check-${crypto.randomUUID()}`;
  let inserted = false;

  try {
    await connectDB({ required: true });
    collection = mongoose.connection.db.collection('_connection_smoke_tests');

    await collection.insertOne({ _id: testId, status: 'inserted', createdAt: new Date() });
    inserted = true;
    console.log('[DB Test] Insert succeeded.');

    const insertedDocument = await collection.findOne({ _id: testId });
    if (!insertedDocument) {
      throw new Error('Inserted smoke-test document could not be retrieved.');
    }
    console.log('[DB Test] Read succeeded.');

    const updateResult = await collection.updateOne(
      { _id: testId },
      { $set: { status: 'updated' } }
    );
    if (updateResult.modifiedCount !== 1) {
      throw new Error('Smoke-test document was not updated.');
    }
    console.log('[DB Test] Update succeeded.');

    const deleteResult = await collection.deleteOne({ _id: testId });
    if (deleteResult.deletedCount !== 1) {
      throw new Error('Smoke-test document was not deleted.');
    }
    inserted = false;
    console.log('[DB Test] Delete succeeded.');
    console.log('[DB Test] MongoDB connection and CRUD checks passed.');
  } finally {
    if (inserted) {
      await collection.deleteOne({ _id: testId });
    }
    await mongoose.disconnect();
  }
}

testMongoConnection().catch((error) => {
  console.error(`[DB Test] Failed: ${error.message}`);
  process.exitCode = 1;
});
