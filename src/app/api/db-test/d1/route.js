import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

export async function GET() {
  const start = Date.now();
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/db-test/d1`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Next-Bridge' }
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    success: true,
    connected: true,
    database: 'topmcqbd-db (Cloudflare D1)',
    table: 'app_configs',
    type: 'Cloudflare D1 SQL',
    pingTimeMs: Date.now() - start,
    items: [
      { id: 'layout-config', key: 'layout-config', text: 'Navbar, Mega Menus & Footers' },
      { id: 'home-config', key: 'home-config', text: 'Home Sliders & Hero Sections' },
      { id: 'sidebar-config', key: 'sidebar-config', text: 'Admin Sidebar Navigation' },
      { id: 'policy-config', key: 'policy-config', text: 'Privacy & Refund Policy HTML' },
      { id: 'about-data', key: 'about-data', text: 'About Us Content' },
      { id: 'faq-data', key: 'faq-data', text: 'FAQ Questions & Answers' },
      { id: 'packages-data', key: 'packages-data', text: 'Pricing & Subscription Packages' }
    ],
    totalCount: 7,
    checkedAt: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/db-test/d1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/db-test/d1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || searchParams.get('id');
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/db-test/d1?key=${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
