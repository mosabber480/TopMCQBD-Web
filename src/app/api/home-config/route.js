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
        sliders: [
          {
            title: 'TopMCQBD এ আপনাকে স্বাগতম!',
            subtitle: 'সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্মে নিজেকে প্রস্তুত করুন।',
            bgImage: 'images/slider-01.jpg',
            bgOpacity: 0.5,
            btn1Text: 'কুইজ শুরু করুন',
            btn1Link: '/quiz',
            btn2Text: 'সকল প্যাকেজ',
            btn2Link: '/packages'
          },
          {
            title: 'সহজ ও নির্ভুল প্রস্তুতি',
            subtitle: 'টপিকভিত্তিক প্রশ্নব্যাংক ও রিয়েল-টাইম টাইমার টেস্ট।',
            bgImage: 'images/slider-02.jpg',
            bgOpacity: 0.5,
            btn1Text: 'সকল ক্যাটাগরি',
            btn1Link: '/all-mcq',
            btn2Text: 'যোগাযোগ করুন',
            btn2Link: '/contact'
          }
        ],
        demoQuizzes: [],
        packages: [],
        demoSectionInfo: { title: 'ফ্রি ডেমো কুইজ (Free Demo Quiz)', subtitle: 'কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন' },
        packageSectionInfo: { title: 'আমাদের প্রিপারেশন প্যাকেজসমূহ', subtitle: 'আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন' },
        missionSectionInfo: {
          sectionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
          sectionSubtitle: 'শিক্ষার্থীদের প্রস্তুতিকে নির্ভুল ও প্রযুক্তিবান্ধব করা',
          missionTitle: 'আমাদের মিশন',
          missionDesc: 'একটি মানসম্মত ও বিষয়ভিত্তিক প্ল্যাটফর্ম তৈরি করা যাতে যে কেউ যেকোনো স্থান থেকে আত্মবিশ্বাসের সাথে প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতি নিতে পারে।',
          goalTitle: 'আমাদের ভিশন',
          goalDesc: 'বাংলাদেশের অন্যতম বিশ্বস্ত এবং সমৃদ্ধ ই-লার্নিং ও অনলাইন কুইজ প্ল্যাটফর্ম হিসেবে গড়ে তোলা।'
        }
      };
    }
    return NextResponse.json(config);
  } catch (err) {
    console.error('GET HOME CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Server error occurred' }, { status: 500 });
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
