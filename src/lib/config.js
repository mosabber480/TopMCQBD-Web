/**
 * Application Global Configuration
 */
export const APP_CONFIG = {
  SITE_NAME: 'TopMCQBD',
  TAGLINE: 'সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম',
  DEFAULT_SEO_TITLE: 'TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম',
  DEFAULT_SEO_DESC: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং যেকোনো প্রতিযোগিতামূলক পরীক্ষার জন্য সেরা অনলাইন এমসিকিউ ও মডেল টেস্ট প্ল্যাটফর্ম।',
  DEFAULT_ANNOUNCEMENT: {
    text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
    link: ""
  }
};

/**
 * Format URL safely for external, internal, and asset links
 */
export function formatURL(url) {
  if (!url || url === '#') return '#';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('assets/')
  ) {
    if (trimmed.startsWith('images/')) return '/' + trimmed;
    return trimmed;
  }
  if (trimmed.endsWith('.html')) {
    // Map legacy HTML routes to Next.js routes
    const cleanRoute = trimmed.replace(/\.html$/, '');
    if (cleanRoute === 'index') return '/';
    return '/' + cleanRoute;
  }
  if (!trimmed.includes('.')) return '/' + trimmed;
  return 'https://' + trimmed;
}

/**
 * Map legacy paths if needed
 */
export function mapLegacyUrl(url) {
  if (!url) return '/';
  if (url === 'index.html' || url === '/' || url === 'Home-hobe.html') return '/';
  if (url === 'login.html') return '/login';
  if (url === 'profile.html') return '/profile';
  if (url === 'quiz.html' || url === 'questions.html') return '/questions';
  if (url === 'all-mcq.html') return '/all-mcq';
  if (url === 'exams.html' || url === 'modeltest.html' || url === 'modeltest' || url === 'model-test' || url === 'model-test.html') return '/model-test';
  if (url === 'packages.html') return '/packages';
  if (url === 'about-us.html') return '/about-us';
  if (url === 'contact.html') return '/contact';
  if (url === 'FAQ.html' || url === 'faq.html') return '/faq';
  if (url === 'privacy-and-refund-policy.html') return '/privacy-and-refund-policy';
  if (url === 'free-mcqs.html') return '/free-mcqs';
  if (url.includes('admin/dashboard.html')) return '/admin/dashboard';
  if (url.includes('admin/quiz-dashboard.html') || url.includes('admin/questions-dashboard.html')) return '/admin/questions-dashboard';
  if (url.includes('admin/users.html')) return '/admin/users';
  if (url.includes('admin/home-dashboard.html')) return '/admin/home-dashboard';
  if (url.includes('admin/header-dashboard.html')) return '/admin/header-dashboard';
  if (url.includes('admin/footer-dashboard.html')) return '/admin/footer-dashboard';
  if (url.includes('admin/policy-dashboard.html')) return '/admin/policy-dashboard';
  if (url.includes('admin/admin-menu-dashboard.html')) return '/admin/admin-menu-dashboard';
  if (url.includes('admin/admin-profile.html')) return '/admin/admin-profile';
  if (url.includes('admin/about-dashboard.html')) return '/admin/about-dashboard';
  if (url.includes('admin/packages-dashboard.html')) return '/admin/packages-dashboard';
  if (url.includes('admin/free-mcqs-dashboard.html')) return '/admin/free-mcqs-dashboard';
  return formatURL(url);
}
