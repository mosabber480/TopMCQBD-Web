import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import dns from 'dns';

// Set public Google & Cloudflare DNS to bypass local Windows / ISP querySrv ECONNREFUSED issues
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

  // Helper to attempt connection (tries SRV first, then fallback direct replica set URI)
  const tryConnect = async (primaryUri, directFallbackUri, dbName) => {
    const uris = [primaryUri, directFallbackUri].filter(Boolean);
    let lastError = null;

    for (const uri of uris) {
      let client = null;
      const start = Date.now();
      try {
        client = new MongoClient(uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
          tls: true,
        });
        await client.connect();
        const db = client.db(dbName);
        await db.command({ ping: 1 });
        const collections = await db.listCollections().toArray();
        const latencyMs = Date.now() - start;
        await client.close().catch(() => {});
        return {
          connected: true,
          latencyMs,
          collections: collections.map(c => c.name)
        };
      } catch (err) {
        lastError = err;
        if (client) {
          await client.close().catch(() => {});
        }
      }
    }

    throw lastError;
  };

  // 1. Test Paid Database
  try {
    const resPaid = await tryConnect(MONGODB_URI_PAID, DIRECT_PAID_URI, MONGODB_DB_NAME_PAID);
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
  }

  // 2. Test Free Database
  try {
    const resFree = await tryConnect(MONGODB_URI_FREE, DIRECT_FREE_URI, MONGODB_DB_NAME_FREE);
    results.freeDb.connected = true;
    results.freeDb.status = 'Connected';
    results.freeDb.latencyMs = resFree.latencyMs;
    results.freeDb.collections = resFree.collections;
  } catch (err) {
    results.freeDb.connected = false;
    results.freeDb.status = 'Error';
    results.freeDb.error = {
      message: err.message || String(err),
      name: err.name
    };
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
