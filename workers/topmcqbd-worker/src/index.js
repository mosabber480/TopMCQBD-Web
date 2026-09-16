/**
 * TopMCQBD Backup Worker API
 * High-Availability Failover & Direct Edge MongoDB API
 * Runs on Cloudflare Workers with nodejs_compat
 */

import { MongoClient } from 'mongodb';

// Worker global client cache
const clients = {};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

async function getClient(uri) {
  if (!uri) throw new Error('MongoDB URI is not configured');
  if (clients[uri]) return clients[uri];

  const client = new MongoClient(uri, {
    tls: true,
    family: 4,
    directConnection: true,
    maxPoolSize: 1,
    minPoolSize: 0,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  clients[uri] = client;
  return client;
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. Root / Health endpoint
      if (path === '/' || path === '/api/health') {
        return jsonResponse({
          status: 'ok',
          service: 'TopMCQBD Cloudflare Backup Worker API',
          runtime: 'Cloudflare Workers (Edge V8 Isolate)',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Multi-Cluster Ping & Latency Check
      if (path === '/api/db-check') {
        const targetUri = env.MONGODB_URI_FREE || env.MONGODB_URI_PAID;
        const targetDb = env.MONGODB_DB_FREE || env.MONGODB_DB_PAID || 'TopMCQBD_DB_Free';

        if (!targetUri) {
          return jsonResponse({
            success: false,
            message: 'MONGODB_URI is not set in Worker environment variables',
          }, 500);
        }

        const t0 = Date.now();
        const client = await getClient(targetUri);
        const db = client.db(targetDb);
        const pingResult = await db.command({ ping: 1 });
        const latencyMs = Date.now() - t0;

        return jsonResponse({
          success: pingResult.ok === 1,
          database: targetDb,
          latencyMs,
          runtime: 'Cloudflare Worker',
          timestamp: new Date().toISOString(),
        });
      }

      // 3. Questions Endpoint (Fallback for Practice & Free MCQs)
      if (path === '/api/questions' || path === '/api/free-mcqs') {
        const uri = env.MONGODB_URI_FREE || env.MONGODB_URI_PAID;
        const dbName = env.MONGODB_DB_FREE || 'TopMCQBD_DB_Free';

        if (!uri) {
          return jsonResponse({ success: false, message: 'Database URI missing' }, 500);
        }

        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const page = parseInt(url.searchParams.get('page') || '1', 10);

        const client = await getClient(uri);
        const db = client.db(dbName);
        const collection = db.collection('questions');

        const filter = category ? { category } : {};
        const total = await collection.countDocuments(filter);
        const questions = await collection
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        return jsonResponse({
          success: true,
          total,
          page,
          count: questions.length,
          data: questions,
          source: 'Cloudflare Worker Backup API',
        }, 200, {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        });
      }

      // 4. Categories Endpoint
      if (path === '/api/categories') {
        const uri = env.MONGODB_URI_FREE || env.MONGODB_URI_PAID;
        const dbName = env.MONGODB_DB_FREE || 'TopMCQBD_DB_Free';

        const client = await getClient(uri);
        const db = client.db(dbName);
        const categories = await db.collection('questions').distinct('category');

        return jsonResponse({
          success: true,
          categories,
          source: 'Cloudflare Worker Backup API',
        }, 200, {
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        });
      }

      // Default 404
      return jsonResponse({ error: 'Endpoint not found on Backup Worker' }, 404);
    } catch (err) {
      console.error('[Worker Error]:', err);
      return jsonResponse({
        success: false,
        error: err.message || 'Internal Worker Error',
      }, 500);
    }
  },
};
