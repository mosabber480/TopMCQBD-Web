import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';

async function check() {
  const client = new MongoClient(DIRECT_PAID_URI);
  await client.connect();
  const users = await client.db('TopMCQBD_DB').collection('users').find({}).toArray();
  console.log('Users in MongoDB TopMCQBD_DB:');
  for (const u of users) {
    console.log(`- Email: "${u.email}", Role: "${u.role}", Password Hash: "${u.password}"`);
  }
  await client.close();
}

check();
