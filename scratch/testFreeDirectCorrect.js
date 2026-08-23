import { MongoClient } from 'mongodb';

const DIRECT_FREE_URI_CORRECT = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-bntyny-shard-0&authSource=admin';

async function testCorrectFreeDirect() {
  console.log('Testing Corrected Direct Free URI...');
  const start = Date.now();
  try {
    const client = new MongoClient(DIRECT_FREE_URI_CORRECT, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const cols = await client.db('TopMCQBD_DB_Free').listCollections().toArray();
    console.log('✅ Corrected Direct Free Connected in', Date.now() - start, 'ms. Collections:', cols.map(c => c.name));
    await client.close();
  } catch (e) {
    console.error('❌ Corrected Direct Free Error:', e.message);
  }
}

testCorrectFreeDirect();
