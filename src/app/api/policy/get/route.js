import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import policyConfigData from '@/data/policy-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

export async function GET() {
  // 1. Try reading live D1 config from Cloudflare Edge
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/policy`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Render-Sync' }
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
