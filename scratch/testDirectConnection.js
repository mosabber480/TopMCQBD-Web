import { MongoClient } from 'mongodb';

const SINGLE_NODE_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&authSource=admin&directConnection=true';
const SINGLE_NODE_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&authSource=admin&directConnection=true';

async function test() {
  console.log('Testing Single Node Direct Connection (Paid)...');
  try {
    const client = new MongoClient(SINGLE_NODE_PAID_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000, directConnection: true });
    await client.connect();
    console.log('✅ Paid DB Single Node Direct Connected!');
    const collections = await client.db('TopMCQBD_DB').listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('❌ Paid Single Node Failed:', err.message);
  }

  console.log('\nTesting Single Node Direct Connection (Free)...');
  try {
    const client = new MongoClient(SINGLE_NODE_FREE_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000, directConnection: true });
    await client.connect();
    console.log('✅ Free DB Single Node Direct Connected!');
    const collections = await client.db('TopMCQBD_DB_Free').listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('❌ Free Single Node Failed:', err.message);
  }
}

test();
