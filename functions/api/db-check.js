import { getPaidDb, getFreeDb, parseClusterHost, getDbConfig } from '../utils/db.js';

export async function onRequest(context) {
  const dbConfig = getDbConfig(context);

  let paidStatus = 'Testing...';
  let paidConnected = false;
  let paidLatency = 0;
  let paidCollectionsList = [];
  let paidError = null;

  try {
    const startPaid = Date.now();
    const { client, db, error } = await getPaidDb(context);
    if (db && !error) {
      await db.command({ ping: 1 });
      paidLatency = Date.now() - startPaid;
      paidConnected = true;
      paidStatus = 'Connected (MongoDB Atlas Live)';
      const cols = await db.listCollections().toArray();
      paidCollectionsList = cols.map(c => c.name);
    } else {
      paidStatus = `Connection Failed: ${error}`;
      paidError = error;
    }
  } catch (err) {
    paidStatus = `Error: ${err.message}`;
    paidError = err.message;
  }

  let freeStatus = 'Testing...';
  let freeConnected = false;
  let freeLatency = 0;
  let freeCollectionsList = [];
  let freeError = null;

  try {
    const startFree = Date.now();
    const { client: freeClient, db: freeDbInstance, error: freeErr } = await getFreeDb(context);
    if (freeDbInstance && !freeErr) {
      await freeDbInstance.command({ ping: 1 });
      freeLatency = Date.now() - startFree;
      freeConnected = true;
      freeStatus = 'Connected (MongoDB Atlas Free Live)';
      const cols = await freeDbInstance.listCollections().toArray();
      freeCollectionsList = cols.map(c => c.name);
    } else {
      freeStatus = `Connection Failed: ${freeErr}`;
      freeError = freeErr;
    }
  } catch (err) {
    freeStatus = `Error: ${err.message}`;
    freeError = err.message;
  }

  const results = {
    timestamp: new Date().toISOString(),
    server: 'Cloudflare Pages Edge Function',
    runtime: 'Cloudflare Pages Functions (nodejs_compat)',
    paidDb: {
      name: dbConfig.paidDbName,
      status: paidStatus,
      connected: paidConnected,
      latencyMs: paidLatency,
      host: parseClusterHost(dbConfig.paidUri),
      collections: paidCollectionsList.length > 0 ? paidCollectionsList : ['policyconfigs', 'layoutconfigs', 'adminsidebarconfigs', 'users', 'questions', 'homeconfigs'],
      error: paidError
    },
    freeDb: {
      name: dbConfig.freeDbName,
      status: freeStatus,
      connected: freeConnected,
      latencyMs: freeLatency,
      host: parseClusterHost(dbConfig.freeUri),
      collections: freeCollectionsList.length > 0 ? freeCollectionsList : ['questions'],
      error: freeError
    }
  };

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
