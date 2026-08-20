import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import layoutConfigData from '@/data/layout-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'layout-config.json');

function getLayoutConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading layout-config.json:', err);
  }
  return layoutConfigData;
}

function saveLayoutConfig(data) {
  try {
    const filePath = getJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing layout-config.json:', err);
  }
}

export async function GET() {
  const config = getLayoutConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const { announcement, header, footer, copyright } = await request.json();
    const currentConfig = getLayoutConfig();

    const newConfig = {
      ...currentConfig,
      announcement: announcement !== undefined ? announcement : currentConfig.announcement,
      header: header !== undefined ? header : currentConfig.header,
      footer: footer !== undefined ? footer : currentConfig.footer,
      copyright: copyright !== undefined ? copyright : currentConfig.copyright
    };

    saveLayoutConfig(newConfig);

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
    } catch (dbErr) {
      // Ignore DB sync error
    }

    return NextResponse.json({ success: true, message: 'Layout configuration saved successfully!', config: newConfig });
  } catch (err) {
    console.error('SAVE LAYOUT CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Save failed', error: err.message }, { status: 500 });
  }
}
