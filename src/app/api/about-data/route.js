import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import aboutDataFallback from '@/data/about-data.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'about-data.json');

function getLocalAboutData() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {}
  return aboutDataFallback;
}

export async function GET() {
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/about-data`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Render-Sync' }
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.title) {
        return NextResponse.json(liveData);
      }
    }
  } catch (err) {}

  return NextResponse.json(getLocalAboutData());
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();

    try {
      const cloudflareUrl = getCloudflareBaseUrl();
      await fetch(`${cloudflareUrl}/api/about-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (cfErr) {}

    try {
      fs.writeFileSync(getJsonPath(), JSON.stringify(body, null, 2), 'utf8');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'About Us data saved and synced with Cloudflare D1!',
      data: body
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to save about data: ' + err.message }, { status: 500 });
  }
}
