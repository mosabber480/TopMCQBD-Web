import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LayoutConfig from '@/models/LayoutConfig';

export async function GET() {
  try {
    await connectDB();
    let config = await LayoutConfig.findOne();
    if (!config) {
      config = {
        announcement: {
          text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
          link: ""
        },
        header: {
          siteTitle: "TopMCQBD",
          logoUrl: "/images/TopMCQ.png",
          seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
          faviconUrl: "/images/favicon.ico",
          btnText: "সহায়তা",
          btnLink: "/contact",
          menus: [
            { title: "হোম", url: "/" },
            { title: "কুইজ অনুশীলন", url: "/quiz" },
            { title: "সকল MCQ", url: "/all-mcq" },
            { title: "প্যাকেজসমূহ", url: "/packages" },
            { title: "আমাদের সম্পর্কে", url: "/about-us" },
            { title: "যোগাযোগ", url: "/contact" }
          ],
          megaMenus: []
        },
        footer: {
          columns: [
            {
              type: "text",
              title: "TopMCQBD",
              content: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।"
            },
            {
              type: "links",
              title: "গুরুত্বপূর্ণ লিংক",
              links: [
                { title: "হোম পেজ", url: "/" },
                { title: "কুইজ অনুশীলন", url: "/quiz" },
                { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" },
                { title: "প্যাকেজ ও মূল্য তালিকা", url: "/packages" }
              ]
            },
            {
              type: "links",
              title: "সহায়তা ও তথ্য",
              links: [
                { title: "আমাদের সম্পর্কে", url: "/about-us" },
                { title: "যোগাযোগ করুন", url: "/contact" },
                { title: "সচরাচর জিজ্ঞাসা (FAQ)", url: "/faq" },
                { title: "রিফান্ড ও পেমেন্ট পলিসি", url: "/privacy-and-refund-policy" }
              ]
            }
          ]
        },
        copyright: {
          text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
          links: [
            { title: "FAQ", url: "/faq" },
            { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
            { title: "System Status", url: "/status" }
          ]
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

    return NextResponse.json({ message: 'Layout configuration saved successfully!', config });
  } catch (err) {
    console.error('SAVE LAYOUT CONFIG ERROR:', err);
    return NextResponse.json({ message: 'Save failed', error: err.message }, { status: 500 });
  }
}
