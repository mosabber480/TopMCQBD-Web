import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import sidebarConfigData from '@/data/sidebar-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'sidebar-config.json');

function getSidebarConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading sidebar-config.json:', err);
  }
  return sidebarConfigData;
}

function saveSidebarConfig(data) {
  try {
    const filePath = getJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing sidebar-config.json:', err);
  }
}

export async function GET() {
  const config = getSidebarConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { menus, headerButtons } = body;
    const currentConfig = getSidebarConfig();

    const newConfig = {
      ...currentConfig,
      menus: menus !== undefined ? menus : currentConfig.menus,
      headerButtons: headerButtons !== undefined ? headerButtons : currentConfig.headerButtons
    };

    saveSidebarConfig(newConfig);

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
    } catch (dbErr) {
      // Ignore DB sync error
    }

    return NextResponse.json({ success: true, message: 'সাইডবার ও হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', config: newConfig });
  } catch (err) {
    console.error('SAVE SIDEBAR CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Server Error', error: err.message }, { status: 500 });
  }
}
