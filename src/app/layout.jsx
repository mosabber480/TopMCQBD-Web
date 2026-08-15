import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TopAlert from '@/components/layout/TopAlert';

export const metadata = {
  title: 'TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম।',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.png'
  }
};

const defaultLayoutData = {
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
      { title: "প্রশ্ন অনুশীলন", url: "/questions" },
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
        type: "info",
        title: "সাইট তথ্য ও সোশাল লিংক",
        text: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
        fb: "",
        yt: "",
        wa: ""
      },
      {
        type: "links",
        title: "প্রয়োজনীয় লিংক",
        links: [
          { text: "হোম পেজ", url: "/" },
          { text: "প্রশ্ন অনুশীলন", url: "/questions" },
          { text: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" },
          { text: "প্যাকেজ ও মূল্য তালিকা", url: "/packages" }
        ]
      },
      {
        type: "links",
        title: "ক্যাটাগরি",
        links: [
          { text: "বিসিএস প্রস্তুতি", url: "/questions?category=bcs" },
          { text: "ব্যাংক জব", url: "/questions?category=bank" },
          { text: "প্রাথমিক শিক্ষক", url: "/questions?category=primary" }
        ]
      },
      {
        type: "links",
        title: "যোগাযোগ",
        links: [
          { text: "আমাদের সম্পর্কে", url: "/about-us" },
          { text: "যোগাযোগ করুন", url: "/contact" },
          { text: "সচরাচর জিজ্ঞাসা (FAQ)", url: "/faq" },
          { text: "রিফান্ড ও পেমেন্ট পলিসি", url: "/privacy-and-refund-policy" }
        ]
      }
    ]
  },
  copyright: {
    text: "© 2026 TopMCQ. All rights reserved.",
    links: [
      { title: "FAQ", url: "/faq" },
      { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
      { title: "System Status", url: "/status" }
    ]
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
        <TopAlert />
        <AnnouncementBar announcement={defaultLayoutData.announcement} />
        <Header headerData={defaultLayoutData.header} />

        <main>{children}</main>

        <Footer footerData={defaultLayoutData.footer} copyrightData={defaultLayoutData.copyright} />
      </body>
    </html>
  );
}
