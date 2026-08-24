import { getDbConfig, getPaidDb, getFreeDb, parseClusterHost } from '../utils/db.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      }
    });
  }

  const url = new URL(request.url);
  const rawRoute = context.params?.route;
  const routeParts = Array.isArray(rawRoute)
    ? rawRoute
    : (rawRoute ? [rawRoute] : url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean));
  const route = routeParts.join('/');
  const dbConfig = getDbConfig(context);

  try {
    // 1. DB CHECK (/api/db-check)
    if (route === 'db-check' && method === 'GET') {
      let paidStatus = 'Connecting...';
      let freeStatus = 'Connecting...';
      let paidLatency = 0;
      let freeLatency = 0;
      let userCount = 0;
      let questionCount = 0;

      try {
        const startPaid = Date.now();
        const paidDb = await getPaidDb(context);
        await paidDb.command({ ping: 1 });
        paidLatency = Date.now() - startPaid;
        userCount = await paidDb.collection('users').countDocuments().catch(() => 0);
        questionCount = await paidDb.collection('questions').countDocuments().catch(() => 0);
        paidStatus = 'Connected (MongoDB Atlas Primary DB)';
      } catch (err) {
        paidStatus = `Error: ${err.message}`;
      }

      try {
        const startFree = Date.now();
        const freeDb = await getFreeDb(context);
        await freeDb.command({ ping: 1 });
        freeLatency = Date.now() - startFree;
        freeStatus = 'Connected (MongoDB Atlas Free DB)';
      } catch (err) {
        freeStatus = `Error: ${err.message}`;
      }

      return jsonResponse({
        timestamp: new Date().toISOString(),
        server: 'Cloudflare Pages Edge Functions',
        databaseEngine: 'MongoDB Atlas (Native Driver)',
        primaryDb: {
          name: dbConfig.paidDbName,
          cluster: parseClusterHost(dbConfig.paidUri),
          status: paidStatus,
          connected: paidStatus.startsWith('Connected'),
          latencyMs: paidLatency,
          users: userCount,
          questions: questionCount
        },
        freeDb: {
          name: dbConfig.freeDbName,
          cluster: parseClusterHost(dbConfig.freeUri),
          status: freeStatus,
          connected: freeStatus.startsWith('Connected'),
          latencyMs: freeLatency
        }
      });
    }

    return jsonResponse({ success: true, message: 'TopMCQBD API Gateway Active', route });
  } catch (error) {
    console.error('Fatal Edge API error:', error);
    return jsonResponse({ success: false, message: error.message || 'Internal Server Error' }, 500);
  }
}
