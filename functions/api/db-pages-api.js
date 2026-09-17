/**
 * Cloudflare Pages Function: /api/db-pages-api
 * Edge Proxy to Cloudflare Worker Edge API
 * Zero-dependency, zero resetState bundling issue
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Forward to live Cloudflare Worker Edge API
  const targetUrl = new URL(`https://topmcqbd-backup-api.mosabber5266.workers.dev/api/db-pages-api`);
  targetUrl.search = url.search;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-From', 'Cloudflare-Pages-Functions');

  try {
    const isBodyAllowed = !['GET', 'HEAD'].includes(request.method.toUpperCase());
    const forwardReq = new Request(targetUrl.toString(), {
      method: request.method,
      headers,
      body: isBodyAllowed ? await request.blob() : undefined,
    });

    const response = await fetch(forwardReq);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Error forwarding to Worker Edge',
      target: targetUrl.toString(),
      runtime: 'Cloudflare Pages Functions Bridge'
    }, null, 2), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
