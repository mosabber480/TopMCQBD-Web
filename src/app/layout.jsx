import './globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';

export const metadata = {
  title: 'TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম।',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.png'
  }
};

export default function RootLayout({ children }) {
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
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  );
}
