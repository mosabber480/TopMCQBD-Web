import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import policyConfigData from '@/data/policy-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.CLOUDFLARE_D1_API_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

export async function GET() {
  // 1. Try reading live D1 config from Cloudflare Edge
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/policy`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-D1-Sync' }
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.content !== undefined) {
        return NextResponse.json(liveData);
      }
    }
  } catch (err) {}

  // 2. Fallback to local file / JSON
  try {
    const filePath = path.resolve(process.cwd(), 'src', 'data', 'policy-config.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return NextResponse.json(JSON.parse(raw));
    }
  } catch (error) {
    console.error('GET POLICY ERROR:', error);
  }
  return NextResponse.json(policyConfigData || { content: '' });
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const { content } = await request.json();
    const data = { content: content || '' };

    // 1. Forward and save to Cloudflare D1
    try {
      const cloudflareUrl = getCloudflareBaseUrl();
      await fetch(`${cloudflareUrl}/api/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (cfErr) {
      console.error('Failed to sync policy to Cloudflare D1:', cfErr);
    }

    // 2. Local file sync
    try {
      const filePath = path.resolve(process.cwd(), 'src', 'data', 'policy-config.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (fsErr) {
      console.error('Error writing policy-config.json:', fsErr);
    }

    return NextResponse.json({ success: true, message: 'Policy saved and synced with Cloudflare D1 successfully!' });
  } catch (error) {
    console.error('SAVE POLICY ERROR:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
