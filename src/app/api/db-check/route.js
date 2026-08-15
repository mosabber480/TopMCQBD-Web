import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

export const dynamic = 'force-dynamic';

export async function GET() {
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

  // 1. Test Paid Database
  let clientPaid;
  try {
    const startPaid = Date.now();
    clientPaid = new MongoClient(MONGODB_URI_PAID, {
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });
    await clientPaid.connect();
    const dbPaid = clientPaid.db(MONGODB_DB_NAME_PAID);
    await dbPaid.command({ ping: 1 });
    const collectionsPaid = await dbPaid.listCollections().toArray();

    results.paidDb.connected = true;
    results.paidDb.status = 'Connected';
    results.paidDb.latencyMs = Date.now() - startPaid;
    results.paidDb.collections = collectionsPaid.map(c => c.name);
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
    const startFree = Date.now();
    clientFree = new MongoClient(MONGODB_URI_FREE, {
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });
    await clientFree.connect();
    const dbFree = clientFree.db(MONGODB_DB_NAME_FREE);
    await dbFree.command({ ping: 1 });
    const collectionsFree = await dbFree.listCollections().toArray();

    results.freeDb.connected = true;
    results.freeDb.status = 'Connected';
    results.freeDb.latencyMs = Date.now() - startFree;
    results.freeDb.collections = collectionsFree.map(c => c.name);
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
