import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(req) {
  const url = new URL(req.url);
  const cluster = url.searchParams.get('cluster') || 'paid';
  const origin = url.origin;

  try {
    const res = await fetch(`${origin}/api/db-test/${cluster}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, cluster },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req) {
  const url = new URL(req.url);
  const cluster = url.searchParams.get('cluster') || 'paid';
  const origin = url.origin;

  try {
    const body = await req.json();
    const res = await fetch(`${origin}/api/db-test/${cluster}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, cluster },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(req) {
  const url = new URL(req.url);
  const cluster = url.searchParams.get('cluster') || 'paid';
  const origin = url.origin;

  try {
    const body = await req.json();
    const res = await fetch(`${origin}/api/db-test/${cluster}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, cluster },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const cluster = url.searchParams.get('cluster') || 'paid';
  const id = url.searchParams.get('id');
  const origin = url.origin;

  try {
    const res = await fetch(`${origin}/api/db-test/${cluster}?id=${encodeURIComponent(id || '')}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, cluster },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
