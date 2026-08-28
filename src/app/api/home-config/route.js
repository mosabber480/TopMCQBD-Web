import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import homeConfigData from '@/data/home-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'home-config.json');

function getLocalHomeConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local home-config.json:', err);
  }
  return homeConfigData;
}

export async function GET() {
  // 1. Try reading live D1 config from Cloudflare Edge
  try {
    const cloudflareUrl = getCloudflareBaseUrl();
    const res = await fetch(`${cloudflareUrl}/api/home-config`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TopMCQBD-Render-Sync' }
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && (liveData.sliders || liveData.seoTitle)) {
        return NextResponse.json(liveData);
      }
    }
  } catch (err) {}

  // 2. Fallback to local config
  const config = getLocalHomeConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();
    const currentConfig = getLocalHomeConfig();

    const newConfig = {
      ...currentConfig,
      ...body
    };

    // 1. Forward and save to Cloudflare D1
    try {
      const cloudflareUrl = getCloudflareBaseUrl();
      await fetch(`${cloudflareUrl}/api/home-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (cfErr) {
      console.error('Failed to sync home config to Cloudflare D1:', cfErr);
    }

    // 2. Local fallback sync
    try {
      const filePath = getJsonPath();
      fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2), 'utf8');
    } catch (e) {}

    // 3. MongoDB sync if available
    try {
      const { connectDB } = await import('@/lib/db');
      const HomeConfig = (await import('@/models/HomeConfig')).default;
      await connectDB();
      let dbConfig = await HomeConfig.findOne();
      if (dbConfig) {
        dbConfig.seoTitle = newConfig.seoTitle || '';
        dbConfig.seoDescription = newConfig.seoDescription || '';
        dbConfig.sliders = newConfig.sliders || [];
        dbConfig.demoQuizzes = newConfig.demoQuizzes || [];
        dbConfig.packages = newConfig.packages || [];
        dbConfig.demoSectionInfo = newConfig.demoSectionInfo || { title: '', subtitle: '' };
        dbConfig.packageSectionInfo = newConfig.packageSectionInfo || { title: '', subtitle: '' };
        dbConfig.missionSectionInfo = newConfig.missionSectionInfo || null;
        await dbConfig.save();
      } else {
        await HomeConfig.create(newConfig);
      }
    } catch (dbErr) {}

    return NextResponse.json({
      success: true,
      message: 'Home config saved and synced with Cloudflare D1!',
      config: newConfig
    });
  } catch (err) {
    console.error('SAVE HOME CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Failed to save config: ' + err.message }, { status: 500 });
  }
}
