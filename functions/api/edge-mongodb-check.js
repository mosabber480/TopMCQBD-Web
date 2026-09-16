/**
 * Cloudflare Pages Function: /api/edge-mongodb-check
 * Direct Edge Connection Diagnostic for all 6 MongoDB Atlas Clusters
 * Runs directly on Cloudflare Edge with nodejs_compat
 */

import { CLUSTERS, pingEdgeCluster } from '../_shared/mongodb.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const targetCluster = url.searchParams.get('cluster');

  // If a specific cluster is requested
  if (targetCluster && CLUSTERS[targetCluster]) {
    const result = await pingEdgeCluster(context.env, targetCluster);
    return jsonResponse(result, result.connected ? 200 : 500);
  }

  // Otherwise ping all 6 clusters in parallel
  const clusterKeys = Object.keys(CLUSTERS);
  const startTime = Date.now();

  const results = await Promise.all(
    clusterKeys.map(key => pingEdgeCluster(context.env, key))
  );

  const totalConnected = results.filter(r => r.connected).length;

  return jsonResponse({
    success: totalConnected > 0,
    runtime: 'Cloudflare Pages Functions (V8 Edge Isolate)',
    mode: 'Direct MongoDB TCP / Shard Socket (nodejs_compat)',
    totalClusters: clusterKeys.length,
    connectedClusters: totalConnected,
    totalDurationMs: Date.now() - startTime,
    clusters: results,
    timestamp: new Date().toISOString()
  });
}
