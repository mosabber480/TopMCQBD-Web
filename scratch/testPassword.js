import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';

async function testPw() {
  const client = new MongoClient(DIRECT_PAID_URI);
  await client.connect();
  const users = await client.db('TopMCQBD_DB').collection('users').find({}).toArray();
  
  const passwordsToTest = ['admin123456', '123456', '12345678', 'password', 'mosabber123', 'admin123', 'Mosabber123'];
  
  for (const u of users) {
    console.log(`Checking user: ${u.email}`);
    for (const pw of passwordsToTest) {
      const match = await bcrypt.compare(pw, u.password);
      if (match) {
        console.log(`  MATCH FOUND! Email: ${u.email}, Password: "${pw}"`);
      }
    }
  }
  await client.close();
}

testPw();
