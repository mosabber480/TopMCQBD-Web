import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const DIRECT_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-13msb7-shard-0&authSource=admin';

async function testConnections() {
  console.log('Testing Direct Paid URI...');
  const startPaid = Date.now();
  try {
    const clientPaid = new MongoClient(DIRECT_PAID_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 });
    await clientPaid.connect();
    const paidCols = await clientPaid.db('TopMCQBD_DB').listCollections().toArray();
    console.log('✅ Direct Paid Connected in', Date.now() - startPaid, 'ms. Collections:', paidCols.map(c => c.name));
    await clientPaid.close();
  } catch (e) {
    console.error('❌ Direct Paid Error:', e.message);
  }

  console.log('Testing Direct Free URI...');
  const startFree = Date.now();
  try {
    const clientFree = new MongoClient(DIRECT_FREE_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 });
    await clientFree.connect();
    const freeCols = await clientFree.db('TopMCQBD_DB_Free').listCollections().toArray();
    console.log('✅ Direct Free Connected in', Date.now() - startFree, 'ms. Collections:', freeCols.map(c => c.name));
    await clientFree.close();
  } catch (e) {
    console.error('❌ Direct Free Error:', e.message);
  }
}

testConnections();
