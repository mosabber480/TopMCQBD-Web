import { parseClusterHost, getDbConfig, getPaidDb, getFreeDb } from '../utils/db.js';

export async function onRequest(context) {
  const dbConfig = getDbConfig(context);

  const results = {
    timestamp: new Date().toISOString(),
    server: 'Cloudflare Pages Edge Function',
    runtime: 'Cloudflare Pages Functions (Edge Fast)',
    paidDb: {
      name: dbConfig.paidDbName,
      status: 'pending',
      connected: false,
      latencyMs: null,
      host: parseClusterHost(dbConfig.paidUri),
      collections: [],
      error: null
    },
    freeDb: {
      name: dbConfig.freeDbName,
      status: 'pending',
      connected: false,
      latencyMs: null,
      host: parseClusterHost(dbConfig.freeUri),
      collections: [],
      error: null
    }
  };

  // Test Paid DB
  const startPaid = Date.now();
  try {
    const db = await getPaidDb(context);
    await db.command({ ping: 1 });
    const cols = await db.listCollections().toArray();
    results.paidDb.connected = true;
    results.paidDb.status = 'Connected';
    results.paidDb.latencyMs = Date.now() - startPaid;
    results.paidDb.collections = cols.map(c => c.name);
  } catch (err) {
    results.paidDb.connected = false;
    results.paidDb.status = 'Error';
    results.paidDb.error = err.message || String(err);
  }

  // Test Free DB
  const startFree = Date.now();
  try {
    const db = await getFreeDb(context);
    await db.command({ ping: 1 });
    const cols = await db.listCollections().toArray();
    results.freeDb.connected = true;
    results.freeDb.status = 'Connected';
    results.freeDb.latencyMs = Date.now() - startFree;
    results.freeDb.collections = cols.map(c => c.name);
  } catch (err) {
    results.freeDb.connected = false;
    results.freeDb.status = 'Error';
    results.freeDb.error = err.message || String(err);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}

