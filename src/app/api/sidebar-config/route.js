import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import AdminSidebarConfig from '@/models/AdminSidebarConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultMenuItems = [
  { href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
  { href: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
  { href: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
  { href: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
  { href: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
  { href: '/admin/questions-dashboard', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
  { href: '/admin/packages-dashboard', icon: 'fa-solid fa-box-open', label: 'প্যাকেজসমূহ পেজ', subMenus: [] },
  { href: '/admin/users', icon: 'fa-solid fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন', subMenus: [] },
  { href: '/admin/admin-menu-dashboard', icon: 'fa-solid fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল', subMenus: [] },
  { href: '/admin/policy-dashboard', icon: 'fa-solid fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি', subMenus: [] },
  { href: '/admin/free-mcqs-dashboard', icon: 'fa-solid fa-gift', label: 'ফ্রি এমসিকিউ কন্ট্রোল', subMenus: [] }
];

const defaultHeaderButtons = [
  { text: 'ওয়েবসাইট ভিজিট', url: '/', icon: 'fa-solid fa-globe', color: 'success', targetBlank: true, action: 'link' },
  { text: 'হোম পেজ এডিটর', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', color: 'primary', targetBlank: false, action: 'link' },
  { text: 'প্রশ্ন ব্যাংক কন্ট্রোল', url: '/admin/questions-dashboard', icon: 'fa-solid fa-file-circle-question', color: 'info', targetBlank: false, action: 'link' },
  { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning', targetBlank: false, action: 'link' }
];

export async function GET() {
  try {
    await connectDB();
    let config = await AdminSidebarConfig.findOne();

    if (!config) {
      return NextResponse.json({
        menus: defaultMenuItems.map(m => ({
          title: m.label,
          url: m.href,
          icon: m.icon,
          subMenus: m.subMenus
        })),
        headerButtons: defaultHeaderButtons
      });
    }

    const menus = config.menus && config.menus.length > 0
      ? config.menus
      : defaultMenuItems.map(m => ({
          title: m.label,
          url: m.href,
          icon: m.icon,
          subMenus: m.subMenus
        }));

    const headerButtons = config.headerButtons && config.headerButtons.length > 0
      ? config.headerButtons
      : defaultHeaderButtons;

    return NextResponse.json({
      menus,
      headerButtons
    });
  } catch (err) {
    console.error('GET SIDEBAR CONFIG ERROR:', err);
    return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await request.json();
    const { menus, headerButtons } = body;

    let config = await AdminSidebarConfig.findOne();
    if (config) {
      if (menus !== undefined) config.menus = menus;
      if (headerButtons !== undefined) config.headerButtons = headerButtons;
      await config.save();
    } else {
      config = new AdminSidebarConfig({
        menus: menus || defaultMenuItems.map(m => ({ title: m.label, url: m.href, icon: m.icon, subMenus: [] })),
        headerButtons: headerButtons || defaultHeaderButtons
      });
      await config.save();
    }

    return NextResponse.json({ success: true, message: 'সাইডবার ও হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', config });
  } catch (err) {
    console.error('SAVE SIDEBAR CONFIG ERROR:', err);
    return NextResponse.json({ success: false, message: 'Server Error', error: err.message }, { status: 500 });
  }
}
