import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import dns from 'dns';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';
const DIRECT_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-13msb7-shard-0&authSource=admin';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

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
    server: 'TopMCQBD Render Backend Server',
    paidDb: {
      name: MONGODB_DB_NAME_PAID,
      status: 'pending',
      connected: false,
      latencyMs: null,
      collections: [],
      error: null
    },
    freeDb: {
      name: MONGODB_DB_NAME_FREE,
      status: 'pending',
      connected: false,
      latencyMs: null,
      collections: [],
      error: null
    }
  };

  // Helper to attempt connection
  const tryConnect = async (uri, fallbackUri, dbName) => {
    let client;
    const start = Date.now();
    try {
      client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      const db = client.db(dbName);
      await db.command({ ping: 1 });
      const collections = await db.listCollections().toArray();
      return {
        connected: true,
        latencyMs: Date.now() - start,
        collections: collections.map(c => c.name),
        client
      };
    } catch (err) {
      if (client) { try { await client.close(); } catch(e){} }
      if (fallbackUri) {
        try {
          const fallbackClient = new MongoClient(fallbackUri, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
          });
          await fallbackClient.connect();
          const db = fallbackClient.db(dbName);
          await db.command({ ping: 1 });
          const collections = await db.listCollections().toArray();
          return {
            connected: true,
            latencyMs: Date.now() - start,
            collections: collections.map(c => c.name),
            client: fallbackClient
          };
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
      throw err;
    }
  };

  // 1. Test Paid Database
  let clientPaid;
  try {
    const resPaid = await tryConnect(MONGODB_URI_PAID, DIRECT_PAID_URI, MONGODB_DB_NAME_PAID);
    clientPaid = resPaid.client;
    results.paidDb.connected = true;
    results.paidDb.status = 'Connected';
    results.paidDb.latencyMs = resPaid.latencyMs;
    results.paidDb.collections = resPaid.collections;
  } catch (err) {
    results.paidDb.connected = false;
    results.paidDb.status = 'Error';
    results.paidDb.error = {
      message: err.message || String(err),
      name: err.name
    };
  } finally {
    if (clientPaid) {
      try { await clientPaid.close(); } catch (e) {}
    }
  }

  // 2. Test Free Database
  let clientFree;
  try {
    const resFree = await tryConnect(MONGODB_URI_FREE, DIRECT_FREE_URI, MONGODB_DB_NAME_FREE);
    clientFree = resFree.client;
    results.freeDb.connected = true;
    results.freeDb.status = 'Connected';
    results.freeDb.latencyMs = resFree.latencyMs;
    results.freeDb.collections = resFree.collections;
  } catch (err) {
    let msg = err.message || String(err);
    if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert') || msg.includes('querySrv')) {
      msg = `${msg} (টিপস: MongoDB Atlas ড্যাশবোর্ডে Network Access > IP Access List এ 0.0.0.0/0 'Allow Access from Anywhere' এনাবল করা আছে কিনা চেক করুন)`;
    }
    results.freeDb.connected = false;
    results.freeDb.status = 'Error';
    results.freeDb.error = {
      message: msg,
      name: err.name
    };
  } finally {
    if (clientFree) {
      try { await clientFree.close(); } catch (e) {}
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
