import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';
const DIRECT_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-bntyny-shard-0&authSource=admin';

export async function GET() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {}

  const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
  const MONGODB_URI_FREE = process.env.MONGODB_URI_FREE || 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';
  const MONGODB_DB_NAME_PAID = process.env.MONGODB_DB_NAME_PAID || 'TopMCQBD_DB';
  const MONGODB_DB_NAME_FREE = process.env.MONGODB_DB_NAME_FREE || 'TopMCQBD_DB_Free';

  const results = {
    timestamp: new Date().toISOString(),
    server: 'Localhost / Next.js Development Server',
    paidDb: {
      name: MONGODB_DB_NAME_PAID,
      status: 'Connecting...',
      connected: false,
      latencyMs: null,
      host: 'Configured',
      collections: [],
      error: null
    },
    freeDb: {
      name: MONGODB_DB_NAME_FREE,
      status: 'Connecting...',
      connected: false,
      latencyMs: null,
      host: 'Configured',
      collections: [],
      error: null
    }
  };

  const startPaid = Date.now();
  let paidClient = null;
  const paidUris = [DIRECT_PAID_URI, MONGODB_URI_PAID];

  for (const uri of paidUris) {
    try {
      paidClient = new MongoClient(uri, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        tls: true,
      });
      await paidClient.connect();
      const paidDb = paidClient.db(MONGODB_DB_NAME_PAID);
      await paidDb.command({ ping: 1 });
      const collections = await paidDb.listCollections().toArray();

      results.paidDb.connected = true;
      results.paidDb.status = 'Connected';
      results.paidDb.latencyMs = Date.now() - startPaid;
      results.paidDb.collections = collections.map(c => c.name);
      break;
    } catch (err) {
      results.paidDb.error = err.message;
    }
  }

  if (paidClient) {
    try { await paidClient.close(); } catch (e) {}
  }

  const startFree = Date.now();
  let freeClient = null;
  const freeUris = [DIRECT_FREE_URI, MONGODB_URI_FREE];

  for (const uri of freeUris) {
    try {
      freeClient = new MongoClient(uri, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        tls: true,
      });
      await freeClient.connect();
      const freeDb = freeClient.db(MONGODB_DB_NAME_FREE);
      await freeDb.command({ ping: 1 });
      const collections = await freeDb.listCollections().toArray();

      results.freeDb.connected = true;
      results.freeDb.status = 'Connected';
      results.freeDb.latencyMs = Date.now() - startFree;
      results.freeDb.collections = collections.map(c => c.name);
      break;
    } catch (err) {
      results.freeDb.error = err.message;
    }
  }

  if (freeClient) {
    try { await freeClient.close(); } catch (e) {}
  }

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}
