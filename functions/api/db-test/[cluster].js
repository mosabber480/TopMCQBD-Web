/**
 * Cloudflare Pages Function: /api/db-test/[cluster]
 * Provides clean RESTful URLs (e.g. /api/db-test/paid, /api/db-test/free, etc.)
 */

const CLUSTERS = {
  paid: {
    url: 'https://topmcqbd-paid-api.onrender.com/api/db-test/paid',
    name: 'TopMCQBD_DB (Paid Core)',
  },
  free: {
    url: 'https://topmcqbd-free-api.onrender.com/api/db-test/free',
    name: 'TopMCQBD_DB_Free (Open Free)',
  },
  subjective: {
    url: 'https://subjective-paid-api.onrender.com/api/db-test/subjective',
    name: 'TopMCQBD_DB_Subjective',
  },
  live_exam: {
    url: 'https://live-exam-paid-api.onrender.com/api/db-test/live-exam',
    name: 'TopMCQBD_DB_Live_Exam',
  },
  written: {
    url: 'https://written-paid-api.onrender.com/api/db-test/written',
    name: 'TopMCQBD_DB_written',
  },
  question_bank: {
    url: 'https://question-bank-paid-api.onrender.com/api/db-test/question-bank',
    name: 'TopMCQBD_DB_Question_Bank',
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

function resolveTarget(clusterParam) {
  const normalized = (clusterParam || 'paid').toLowerCase().replace(/-/g, '_');
  return CLUSTERS[normalized] || CLUSTERS.paid;
}

export async function onRequestGet(context) {
  const clusterParam = context.params?.cluster;
  const target = resolveTarget(clusterParam);

  const t0 = Date.now();
  try {
    const res = await fetch(target.url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const latency = Date.now() - t0;
    const data = await res.json().catch(() => ({}));

    return jsonResponse({
      success: res.ok,
      cluster: target.name,
      connected: res.ok && (data.connected !== false),
      latencyMs: data.latencyMs || latency,
      totalItems: data.totalItems || (Array.isArray(data.items) ? data.items.length : 0),
      items: data.items || [],
      collections: data.collections || [],
      runtime: 'Cloudflare Pages (V8 Isolate)',
      timestamp: new Date().toISOString(),
    }, res.status);
  } catch (err) {
    return jsonResponse({
      success: false,
      cluster: target.name,
      connected: false,
      error: err.message,
      latencyMs: Date.now() - t0,
      items: [],
    }, 500);
  }
}

export async function onRequestPost(context) {
  const clusterParam = context.params?.cluster;
  const target = resolveTarget(clusterParam);

  try {
    const body = await context.request.json();
    const res = await fetch(target.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return jsonResponse(data, res.status);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut(context) {
  const clusterParam = context.params?.cluster;
  const target = resolveTarget(clusterParam);

  try {
    const body = await context.request.json();
    const res = await fetch(target.url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return jsonResponse(data, res.status);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const clusterParam = context.params?.cluster;
  const target = resolveTarget(clusterParam);
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  try {
    const deleteUrl = id ? `${target.url}?id=${encodeURIComponent(id)}` : target.url;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    return jsonResponse(data, res.status);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
