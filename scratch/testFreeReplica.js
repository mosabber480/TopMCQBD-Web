import { MongoClient } from 'mongodb';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

async function getReplicaSetName() {
  const client = new MongoClient(DEFAULT_FREE_URI);
  await client.connect();
  const admin = client.db('admin').admin();
  const status = await admin.command({ isMaster: 1 });
  console.log('Free ReplicaSet Name:', status.setName);
  console.log('Free Hosts:', status.hosts);
  await client.close();
}

getReplicaSetName();
