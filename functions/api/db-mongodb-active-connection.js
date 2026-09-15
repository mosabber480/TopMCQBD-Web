/**
 * Cloudflare Pages Function: /api/db-mongodb-active-connection
 * Server-Side Master Wakeup Endpoint for all 6 MongoDB Atlas Clusters + Cloudflare D1
 * Perfect for UptimeRobot (1-URL keep-alive ping) & Direct Automated Wakeup
 */

const ENDPOINTS = [
  {
    id: 'paid',
    name: '1. Paid Core DB',
    cluster: 'TopMCQBD_DB',
    host: 'mosabber.3ajdj0u.mongodb.net',
    url: 'https://topmcqbd-paid-api.onrender.com/api/db-test/paid'
  },
  {
    id: 'subjective',
    name: '2. Subjective MCQs DB',
    cluster: 'TopMCQBD_DB_Subjective',
    host: 'topmcqbd.3ifvd7c.mongodb.net',
    url: 'https://subjective-paid-api.onrender.com/api/db-test/subjective'
  },
  {
    id: 'live-exam',
    name: '3. Live Exam Engine DB',
    cluster: 'TopMCQBD_DB_Live_Exam',
    host: 'topmcqbd.ns1gpls.mongodb.net',
    url: 'https://live-exam-paid-api.onrender.com/api/db-test/live-exam'
  },
  {
    id: 'written',
    name: '4. Written Exam DB',
    cluster: 'TopMCQBD_DB_written',
    host: 'topmcqbd.hfivdlt.mongodb.net',
    url: 'https://written-paid-api.onrender.com/api/db-test/written'
  },
  {
    id: 'question-bank',
    name: '5. Question Bank DB',
    cluster: 'TopMCQBD_DB_Question_Bank',
    host: 'topmcqbd.bexo18c.mongodb.net',
    url: 'https://question-bank-paid-api.onrender.com/api/db-test/question-bank'
  },
  {
    id: 'free',
    name: '6. Free MCQ DB',
    cluster: 'TopMCQBD_DB_Free',
    host: 'topmcqbd.pixb7fx.mongodb.net',
    url: 'https://topmcqbd-free-api.onrender.com/api/db-test/free'
  },
  {
    id: 'd1',
    name: '7. Cloudflare D1 SQL DB',
    cluster: 'topmcqbd-db',
    host: 'Cloudflare APAC Edge',
    url: 'https://topmcqbd.pages.dev/api/db-test/d1'
  }
];

function jsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
  };

  return new Response(JSON.stringify(data, null, 2), { status, headers });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

export async function onRequestGet(context) {
  const startTime = Date.now();

  const pingPromises = ENDPOINTS.map(async (ep) => {
    const t0 = Date.now();
    try {
      const res = await fetch(ep.url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'User-Agent': 'TopMCQBD-Master-KeepAlive/2.0' },
        cache: 'no-store'
      });
      const t1 = Date.now();
      const data = await res.json().catch(() => ({}));
      return {
        id: ep.id,
        name: ep.name,
        cluster: ep.cluster,
        host: ep.host,
        status: res.ok ? 'connected' : 'error',
        connected: res.ok && (data.connected === true || data.success === true),
        latencyMs: t1 - t0,
        collections: data.collections || (data.collection ? [data.collection] : []),
        totalItems: data.totalItems ?? (Array.isArray(data.items) ? data.items.length : null),
        message: data.message || 'OK'
      };
    } catch (err) {
      return {
        id: ep.id,
        name: ep.name,
        cluster: ep.cluster,
        host: ep.host,
        status: 'failed',
        connected: false,
        latencyMs: Date.now() - t0,
        error: err.message
      };
    }
  });

  const results = await Promise.all(pingPromises);
  const totalLatency = Date.now() - startTime;
  const activeCount = results.filter((r) => r.connected).length;

  return jsonResponse({
    success: true,
    title: 'TopMCQBD All-in-One Database Active Connection & Keep-Alive',
    timestamp: new Date().toISOString(),
    totalDatabases: ENDPOINTS.length,
    activeDatabases: activeCount,
    overallLatencyMs: totalLatency,
    allConnected: activeCount === ENDPOINTS.length,
    databases: results
  });
}
