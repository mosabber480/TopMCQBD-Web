import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import layoutConfigData from '@/data/layout-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'layout-config.json');

function getLocalLayoutConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local layout-config.json:', err);
  }
  return layoutConfigData;
}

export async function GET() {
  // 1. Try reading live D1 config from Cloudflare Edge
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/layout-config`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Render-Sync' }
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && (liveData.header || liveData.announcement)) {
        return NextResponse.json(liveData);
      }
    }
  } catch (err) {
    // Cloudflare fetch failed, fallback to local
  }

  // 2. Fallback to local config
  const config = getLocalLayoutConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();
    const { announcement, header, footer, copyright } = body;
    const currentConfig = getLocalLayoutConfig();

    const newConfig = {
      ...currentConfig,
      announcement: announcement !== undefined ? announcement : currentConfig.announcement,
      header: header !== undefined ? header : currentConfig.header,
      footer: footer !== undefined ? footer : currentConfig.footer,
      copyright: copyright !== undefined ? copyright : currentConfig.copyright
    };

    // 1. Forward and save to Cloudflare D1
    try {
      const cloudflareUrl = getCloudflareBaseUrl();
      await fetch(`${cloudflareUrl}/api/layout-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (cfErr) {
      console.error('Failed to sync layout to Cloudflare D1:', cfErr);
    }

    // 2. Local fallback sync
    try {
      const filePath = getJsonPath();
      fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2), 'utf8');
    } catch (e) {}

    // 3. MongoDB sync if available
    try {
      const { connectDB } = await import('@/lib/db');
      const LayoutConfig = (await import('@/models/LayoutConfig')).default;
      await connectDB();
      let dbConfig = await LayoutConfig.findOne();
      if (dbConfig) {
        dbConfig.announcement = newConfig.announcement;
        dbConfig.header = newConfig.header;
        dbConfig.footer = newConfig.footer;
        dbConfig.copyright = newConfig.copyright;
        await dbConfig.save();
      } else {
        await LayoutConfig.create(newConfig);
      }
    } catch (dbErr) {}

    return NextResponse.json({
      success: true,
      message: 'Layout configuration saved and synced with Cloudflare D1!',
      config: newConfig
    });
  } catch (err) {
    console.error('SAVE LAYOUT CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Save failed', error: err.message }, { status: 500 });
  }
}
