import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authorize } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getConfigPath = () => {
  return path.resolve(process.cwd(), 'src', 'data', 'free-recent-job-config.json');
};

const readConfig = () => {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading free-recent-job-config.json:', err);
  }
  return { categories: [], items: [] };
};

const writeConfig = (data) => {
  try {
    const p = getConfigPath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing free-recent-job-config.json:', err);
    return false;
  }
};

export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json({
      success: true,
      categories: config.categories || [],
      items: config.items || []
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();
    const current = readConfig();

    if (Array.isArray(body.categories)) {
      current.categories = body.categories;
    }
    if (Array.isArray(body.items)) {
      current.items = body.items;
    }

    const saved = writeConfig(current);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write config file' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Free recent job solution configuration updated successfully!',
      categories: current.categories,
      items: current.items
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
