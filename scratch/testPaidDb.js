import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const SRV_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';

async function test() {
  console.log('Testing SRV Paid URI...');
  try {
    const client = new MongoClient(SRV_PAID_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('✅ SRV Connected!');
    const users = await client.db('TopMCQBD_DB').collection('users').find({}).toArray();
    console.log(`Found ${users.length} users:`, users.map(u => ({ email: u.email, role: u.role, name: u.name })));
    await client.close();
  } catch (err) {
    console.error('❌ SRV Failed:', err.message);
  }

  console.log('\nTesting Direct Paid URI...');
  try {
    const client = new MongoClient(DIRECT_PAID_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('✅ Direct Connected!');
    const users = await client.db('TopMCQBD_DB').collection('users').find({}).toArray();
    console.log(`Found ${users.length} users:`, users.map(u => ({ email: u.email, role: u.role, name: u.name })));
    await client.close();
  } catch (err) {
    console.error('❌ Direct Failed:', err.message);
  }
}

test();
