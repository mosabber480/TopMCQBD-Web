import { getPaidDb } from '../functions/utils/db.js';
import bcrypt from 'bcryptjs';

async function testUserFlow() {
  try {
    const db = await getPaidDb();
    console.log('✅ Connected to MongoDB Paid DB via helper');
    const usersCollection = db.collection('users');

    const totalUsers = await usersCollection.countDocuments();
    console.log(`Total users in MongoDB: ${totalUsers}`);

    const sampleUsers = await usersCollection.find({}).project({ password: 0 }).limit(5).toArray();
    console.log('Sample Users:', sampleUsers);

    console.log('✅ Verification successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testUserFlow();
