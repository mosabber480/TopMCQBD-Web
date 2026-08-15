import './globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { connectDB } from '@/lib/db';
import LayoutConfig from '@/models/LayoutConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম।',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.png'
  }
};

async function getLayoutConfig() {
  try {
    await connectDB();
    const config = await LayoutConfig.findOne().lean();
    if (config) {
      const cleanConfig = JSON.parse(JSON.stringify(config));
      return {
        announcement: cleanConfig.announcement || null,
        header: cleanConfig.header || null,
        footer: cleanConfig.footer || null,
        copyright: cleanConfig.copyright || null
      };
    }
  } catch (err) {
    console.error('Error fetching LayoutConfig in RootLayout:', err);
  }
  return null;
}

export default async function RootLayout({ children }) {
  const layoutData = await getLayoutConfig();

  return (
    <html lang="bn">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppLayoutWrapper initialLayoutData={layoutData}>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  );
}
