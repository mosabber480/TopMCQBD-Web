import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCloudflareBaseUrl = () => {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');
};

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

    // 3. MongoDB sync
    try {
      const { connectDB } = await import('@/lib/db');
      const PolicyConfig = (await import('@/models/PolicyConfig')).default;
      await connectDB();

      let policy = await PolicyConfig.findOne();
      if (policy) {
        policy.content = content || '';
        policy.updatedAt = new Date();
        await policy.save();
      } else {
        await PolicyConfig.create(data);
      }
    } catch (dbErr) {}

    return NextResponse.json({ message: 'Policy saved and synced with Cloudflare D1 successfully!' });
  } catch (error) {
    console.error('SAVE POLICY ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
