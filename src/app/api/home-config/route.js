import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import homeConfigData from '@/data/home-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getJsonPath = () => path.resolve(process.cwd(), 'src', 'data', 'home-config.json');

function getHomeConfig() {
  try {
    const filePath = getJsonPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading home-config.json:', err);
  }
  return homeConfigData;
}

function saveHomeConfig(data) {
  try {
    const filePath = getJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing home-config.json:', err);
  }
}

export async function GET() {
  const config = getHomeConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const currentConfig = getHomeConfig();

    const newConfig = {
      ...currentConfig,
      ...body
    };

    saveHomeConfig(newConfig);

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
    } catch (dbErr) {
      // Ignore DB sync error
    }

    return NextResponse.json({
      success: true,
      message: 'Home config saved successfully!',
      config: newConfig
    });
  } catch (err) {
    console.error('SAVE HOME CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Failed to save config: ' + err.message }, { status: 500 });
  }
}
