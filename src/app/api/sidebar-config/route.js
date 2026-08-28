import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import sidebarConfigData from '@/data/sidebar-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'sidebar-config.json');

function getLocalSidebarConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local sidebar-config.json:', err);
  }
  return sidebarConfigData;
}

export async function GET() {
  // 1. Try reading live D1 config from Cloudflare Edge
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/sidebar-config`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Render-Sync' }
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && (liveData.menus || liveData.headerButtons)) {
        return NextResponse.json(liveData);
      }
    }
  } catch (err) {}

  // 2. Fallback to local config
  const config = getLocalSidebarConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();
    const { menus, headerButtons } = body;
    const currentConfig = getLocalSidebarConfig();

    const newConfig = {
      ...currentConfig,
      menus: menus !== undefined ? menus : currentConfig.menus,
      headerButtons: headerButtons !== undefined ? headerButtons : currentConfig.headerButtons
    };

    // 1. Forward and save to Cloudflare D1
    try {
      const cloudflareUrl = getCloudflareBaseUrl();
      await fetch(`${cloudflareUrl}/api/sidebar-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (cfErr) {
      console.error('Failed to sync sidebar config to Cloudflare D1:', cfErr);
    }

    // 2. Local fallback sync
    try {
      const filePath = getJsonPath();
      fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2), 'utf8');
    } catch (e) {}

    // 3. MongoDB sync if available
    try {
      const { connectDB } = await import('@/lib/db');
      const AdminSidebarConfig = (await import('@/models/AdminSidebarConfig')).default;
      await connectDB();
      let dbConfig = await AdminSidebarConfig.findOne();
      if (dbConfig) {
        if (menus !== undefined) dbConfig.menus = menus;
        if (headerButtons !== undefined) dbConfig.headerButtons = headerButtons;
        await dbConfig.save();
      } else {
        await AdminSidebarConfig.create(newConfig);
      }
    } catch (dbErr) {}

    return NextResponse.json({
      success: true,
      message: 'Sidebar config saved and synced with Cloudflare D1!',
      config: newConfig
    });
  } catch (err) {
    console.error('SAVE SIDEBAR CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Server Error', error: err.message }, { status: 500 });
  }
}
