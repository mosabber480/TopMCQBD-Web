import { MongoClient } from 'mongodb';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

async function testFreeSRVWithDns() {
  console.log('Testing Free SRV URI with Google DNS...');
  const start = Date.now();
  try {
    const client = new MongoClient(DEFAULT_FREE_URI, { connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const cols = await client.db('TopMCQBD_DB_Free').listCollections().toArray();
    console.log('✅ Free SRV Connected in', Date.now() - start, 'ms. Collections:', cols.map(c => c.name));
    
    // Also resolve the direct hosts for Free cluster
    dns.resolveSrv('_mongodb._tcp.topmcqbd.pixb7fx.mongodb.net', (err, addresses) => {
      console.log('Free SRV Hosts:', addresses);
    });

    await client.close();
  } catch (e) {
    console.error('❌ Free SRV Error:', e.message);
  }
}

testFreeSRVWithDns();
