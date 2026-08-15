import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LayoutConfig from '@/models/LayoutConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    let config = await LayoutConfig.findOne();
    if (!config) {
      config = {
        announcement: {
          text: "",
          link: ""
        },
        header: {
          siteTitle: "",
          logoUrl: "",
          seoTitle: "",
          faviconUrl: "",
          btnText: "",
          btnLink: "",
          menus: [],
          megaMenus: []
        },
        footer: {
          columns: []
        },
        copyright: {
          text: "",
          links: []
        }
      };
    }
    return NextResponse.json(config);
  } catch (err) {
    console.error('GET LAYOUT CONFIG ERROR:', err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { announcement, header, footer, copyright } = await request.json();

    let config = await LayoutConfig.findOne();
    if (config) {
      config.announcement = announcement;
      config.header = header;
      config.footer = footer;
      config.copyright = copyright;
      await config.save();
    } else {
      config = new LayoutConfig({ announcement, header, footer, copyright });
      await config.save();
    }

    return NextResponse.json({ success: true, message: 'Layout configuration saved successfully!', config });
  } catch (err) {
    console.error('SAVE LAYOUT CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Save failed', error: err.message }, { status: 500 });
  }
}
