import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || DIRECT_PAID_URI;

async function testMongo() {
  let client;
  try {
    console.log('Connecting via MongoClient...');
    client = new MongoClient(MONGODB_URI_PAID, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db('TopMCQBD_DB');
    const users = await db.collection('users').find({}).toArray();
    console.log('Users in MongoDB Paid DB:', users.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role })));
  } catch (err) {
    console.error('MongoClient Error:', err);
  } finally {
    if (client) await client.close();
  }
}

testMongo();
