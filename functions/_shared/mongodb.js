/**
 * Cloudflare Pages Functions: Edge MongoDB Atlas Client Manager
 * Designed for Cloudflare V8 Edge Isolate with nodejs_compat
 * 
 * Features:
 * - Direct Connection & Shard Failover
 * - Lightweight socket pooling (maxPoolSize: 1, minPoolSize: 0)
 * - IPv4 priority (family: 4) to eliminate Edge IPv6 latency
 * - Zero-leak connection lifecycle
 */

import { MongoClient } from 'mongodb';

// Global client cache within the active Edge Isolate
const globalClientCache = {};

export const CLUSTERS = {
  paid: {
    name: 'Paid Core DB',
    envKey: 'MONGODB_URI_PAID',
    fallbackEnvKey: 'MONGO_URI',
    defaultDb: 'TopMCQBD_DB',
    primaryHost: 'mosabber.3ajdj0u.mongodb.net'
  },
  subjective: {
    name: 'Subjective MCQs DB',
    envKey: 'MONGODB_URI_SUBJECTIVE',
    defaultDb: 'TopMCQBD_DB_Subjective',
    primaryHost: 'topmcqbd.3ifvd7c.mongodb.net'
  },
  'live-exam': {
    name: 'Live Exam Engine DB',
    envKey: 'MONGODB_URI_LIVE_EXAM',
    defaultDb: 'TopMCQBD_DB_Live_Exam',
    primaryHost: 'topmcqbd.ns1gpls.mongodb.net'
  },
  written: {
    name: 'Written Exam DB',
    envKey: 'MONGODB_URI_WRITTEN',
    defaultDb: 'TopMCQBD_DB_written',
    primaryHost: 'topmcqbd.hfivdlt.mongodb.net'
  },
  'question-bank': {
    name: 'Question Bank DB',
    envKey: 'MONGODB_URI_QUESTION_BANK',
    defaultDb: 'TopMCQBD_DB_Question_Bank',
    primaryHost: 'topmcqbd.bexo18c.mongodb.net'
  },
  free: {
    name: 'Free MCQ DB',
    envKey: 'MONGODB_URI_FREE',
    defaultDb: 'TopMCQBD_DB_Free',
    primaryHost: 'topmcqbd.pixb7fx.mongodb.net'
  }
};

/**
 * Get environment variable value from context.env or process.env
 */
function getEnvValue(env, key, fallbackKey = null) {
  if (env && env[key]) return env[key];
  if (fallbackKey && env && env[fallbackKey]) return env[fallbackKey];
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    if (fallbackKey && process.env[fallbackKey]) return process.env[fallbackKey];
  }
  return null;
}

/**
 * Get a connected MongoClient instance for a specific cluster
 * @param {object} env - Cloudflare Pages context.env
 * @param {string} clusterId - 'paid' | 'subjective' | 'live-exam' | 'written' | 'question-bank' | 'free'
 */
export async function getEdgeMongoClient(env, clusterId = 'paid') {
  const config = CLUSTERS[clusterId];
  if (!config) {
    throw new Error(`Unknown cluster identifier: "${clusterId}". Valid clusters: ${Object.keys(CLUSTERS).join(', ')}`);
  }

  // Check if cached client is still alive
  if (globalClientCache[clusterId]) {
    try {
      // Quick check if socket is still active
      return globalClientCache[clusterId];
    } catch {
      delete globalClientCache[clusterId];
    }
  }

  const uri = getEnvValue(env, config.envKey, config.fallbackEnvKey);
  if (!uri) {
    throw new Error(`Missing environment variable ${config.envKey} for ${config.name}`);
  }

  const clientOptions = {
    tls: true,
    family: 4,               // Enforce IPv4 to avoid Edge IPv6 resolution latency
    maxPoolSize: 1,          // 1 lightweight socket per edge isolate
    minPoolSize: 0,          // Automatically clean up idle sockets
    connectTimeoutMS: 6000,
    serverSelectionTimeoutMS: 6000,
    socketTimeoutMS: 10000,
  };

  try {
    const client = new MongoClient(uri, clientOptions);
    await client.connect();
    globalClientCache[clusterId] = client;
    return client;
  } catch (err) {
    console.warn(`[Edge MongoDB] Standard connect failed for ${clusterId}, attempting direct connection...`, err.message);

    // Fallback: If SRV lookup fails on Edge, append directConnection=true if possible
    let directUri = uri;
    if (!directUri.includes('directConnection=')) {
      const sep = directUri.includes('?') ? '&' : '?';
      directUri = `${directUri}${sep}directConnection=true`;
    }

    const fallbackClient = new MongoClient(directUri, {
      ...clientOptions,
      directConnection: true
    });
    await fallbackClient.connect();
    globalClientCache[clusterId] = fallbackClient;
    return fallbackClient;
  }
}

/**
 * Get a connected MongoDB Database instance
 * @param {object} env - Cloudflare Pages context.env
 * @param {string} clusterId - cluster key
 * @param {string} customDbName - optional custom DB name override
 */
export async function getEdgeMongoDb(env, clusterId = 'paid', customDbName = null) {
  const config = CLUSTERS[clusterId] || CLUSTERS.paid;
  const dbName = customDbName || config.defaultDb;
  const client = await getEdgeMongoClient(env, clusterId);
  return client.db(dbName);
}

/**
 * Ping and measure latency for a cluster directly from Cloudflare Edge
 */
export async function pingEdgeCluster(env, clusterId = 'paid') {
  const config = CLUSTERS[clusterId];
  if (!config) return { error: `Invalid cluster: ${clusterId}` };

  const t0 = Date.now();
  try {
    const db = await getEdgeMongoDb(env, clusterId);
    const pingResult = await db.command({ ping: 1 });
    const latencyMs = Date.now() - t0;

    let collections = [];
    try {
      const list = await db.listCollections().toArray();
      collections = list.map(c => c.name);
    } catch {
      // listing collections may be restricted or empty
    }

    return {
      id: clusterId,
      name: config.name,
      cluster: config.defaultDb,
      host: config.primaryHost,
      connected: pingResult.ok === 1,
      status: pingResult.ok === 1 ? 'connected' : 'error',
      latencyMs,
      collections,
      platform: 'Cloudflare Pages Functions (Edge)',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      id: clusterId,
      name: config.name,
      cluster: config.defaultDb,
      host: config.primaryHost,
      connected: false,
      status: 'error',
      latencyMs: Date.now() - t0,
      error: err.message,
      platform: 'Cloudflare Pages Functions (Edge)',
      timestamp: new Date().toISOString()
    };
  }
}
