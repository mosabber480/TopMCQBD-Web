import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import HomeConfig from '@/models/HomeConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    let config = await HomeConfig.findOne();
    if (!config) {
      config = {
        seoTitle: '',
        seoDescription: '',
        sliders: [],
        demoQuizzes: [],
        packages: [],
        demoSectionInfo: { title: '', subtitle: '' },
        packageSectionInfo: { title: '', subtitle: '' },
        missionSectionInfo: null
      };
    }
    return NextResponse.json(config);
  } catch (err) {
    console.error('GET HOME CONFIG ERROR:', err);
    return NextResponse.json({
      seoTitle: '',
      seoDescription: '',
      sliders: [],
      demoQuizzes: [],
      packages: [],
      demoSectionInfo: { title: '', subtitle: '' },
      packageSectionInfo: { title: '', subtitle: '' },
      missionSectionInfo: null
    });
  }
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await request.json();

    let config = await HomeConfig.findOne();
    if (config) {
      config.seoTitle = body.seoTitle || '';
      config.seoDescription = body.seoDescription || '';
      config.sliders = body.sliders || [];
      config.demoQuizzes = body.demoQuizzes || [];
      config.packages = body.packages || [];
      config.demoSectionInfo = body.demoSectionInfo || { title: '', subtitle: '' };
      config.packageSectionInfo = body.packageSectionInfo || { title: '', subtitle: '' };
      config.missionSectionInfo = body.missionSectionInfo || {
        sectionTitle: '',
        sectionSubtitle: '',
        missionTitle: '',
        missionDesc: '',
        goalTitle: '',
        goalDesc: ''
      };
      await config.save();
    } else {
      config = await HomeConfig.create({
        seoTitle: body.seoTitle || '',
        seoDescription: body.seoDescription || '',
        sliders: body.sliders || [],
        demoQuizzes: body.demoQuizzes || [],
        packages: body.packages || [],
        demoSectionInfo: body.demoSectionInfo || { title: '', subtitle: '' },
        packageSectionInfo: body.packageSectionInfo || { title: '', subtitle: '' },
        missionSectionInfo: body.missionSectionInfo || {
          sectionTitle: '',
          sectionSubtitle: '',
          missionTitle: '',
          missionDesc: '',
          goalTitle: '',
          goalDesc: ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Home config saved successfully!',
      config
    });
  } catch (err) {
    console.error('SAVE HOME CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Failed to save config: ' + err.message }, { status: 500 });
  }
}
