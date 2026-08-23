import { MongoClient } from 'mongodb';

const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

async function testFreeSRV() {
  console.log('Testing Free SRV URI:', DEFAULT_FREE_URI);
  const start = Date.now();
  try {
    const client = new MongoClient(DEFAULT_FREE_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const cols = await client.db('TopMCQBD_DB_Free').listCollections().toArray();
    console.log('✅ Free SRV Connected in', Date.now() - start, 'ms. Collections:', cols.map(c => c.name));
    await client.close();
  } catch (e) {
    console.error('❌ Free SRV Error:', e.message);
  }
}

testFreeSRV();
