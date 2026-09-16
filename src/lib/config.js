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
 * Live Render API Endpoints Configuration
 */
export const API_CONFIG = {
  PAID_API_URL: process.env.NEXT_PUBLIC_PAID_API_URL || 'https://topmcqbd-paid-api.onrender.com',
  FREE_API_URL: process.env.NEXT_PUBLIC_FREE_API_URL || 'https://topmcqbd-free-api.onrender.com',
  SUBJECTIVE_API_URL: process.env.NEXT_PUBLIC_SUBJECTIVE_API_URL || 'https://subjective-paid-api.onrender.com',
  LIVE_EXAM_API_URL: process.env.NEXT_PUBLIC_LIVE_EXAM_API_URL || 'https://live-exam-paid-api.onrender.com',
  WRITTEN_API_URL: process.env.NEXT_PUBLIC_WRITTEN_API_URL || 'https://written-paid-api.onrender.com',
  QUESTION_BANK_API_URL: process.env.NEXT_PUBLIC_QUESTION_BANK_API_URL || 'https://question-bank-paid-api.onrender.com',
  BACKUP_WORKER_URL: process.env.NEXT_PUBLIC_BACKUP_WORKER_URL || '',
};

/**
 * Get full API endpoint URL for Paid Render Backend Service
 */
export function getPaidApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_PAID_API_URL || 'https://topmcqbd-paid-api.onrender.com';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_PAID_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

/**
 * Get full API endpoint URL for Live Exam Render Backend Service
 */
export function getLiveExamApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_LIVE_EXAM_API_URL || 'https://live-exam-paid-api.onrender.com';
  if (!endpoint) return `${baseUrl.replace(/\/$/, '')}/api/live-exam/exams`;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_LIVE_EXAM_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

/**
 * Get full API endpoint URL for Free MCQ Backend Service
 */
export function getFreeApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_FREE_API_URL || 'https://topmcqbd-free-api.onrender.com';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_FREE_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

/**
 * Get full API endpoint URL for Subjective MCQs Backend Service
 */
export function getSubjectiveApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_SUBJECTIVE_API_URL || 'https://subjective-paid-api.onrender.com';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_SUBJECTIVE_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

/**
 * Get full API endpoint URL for Written Exam Backend Service
 */
export function getWrittenApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_WRITTEN_API_URL || 'https://written-paid-api.onrender.com';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_WRITTEN_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

/**
 * Get full API endpoint URL for Question Bank Backend Service
 */
export function getQuestionBankApiUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_QUESTION_BANK_API_URL || 'https://question-bank-paid-api.onrender.com';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost || process.env.NEXT_PUBLIC_QUESTION_BANK_API_URL) {
      return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
}

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
  if (url === 'packages.html') return '/packages';
  if (url === 'about-us.html') return '/about-us';
  if (url === 'contact.html') return '/contact';
  if (url === 'FAQ.html' || url === 'faq.html') return '/faq';
  if (url === 'privacy-and-refund-policy.html') return '/privacy-and-refund-policy';
  if (url === 'free-mcqs.html') return '/free-mcqs';
  if (url === 'status.html') return '/status';
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

/**
 * Get Cloudflare Backup Worker API URL
 */
export function getBackupWorkerUrl(endpoint = '') {
  const baseUrl = process.env.NEXT_PUBLIC_BACKUP_WORKER_URL || '';
  if (!baseUrl) return '';
  if (!endpoint) return baseUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
}

/**
 * Smart Fetch with Automatic Failover:
 * 1. Tries the primary Render endpoint first.
 * 2. If Render takes > timeoutMs (default 3.5s) or returns 500/502/503/504,
 *    seamlessly falls back to the Cloudflare Worker API.
 */
export async function fetchWithFailover(renderUrl, workerEndpoint = '', options = {}) {
  const timeoutMs = options.timeout || 3500;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(renderUrl, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return res;

    if ([500, 502, 503, 504].includes(res.status)) {
      throw new Error(`Render status ${res.status}`);
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    const workerUrl = getBackupWorkerUrl(workerEndpoint);
    if (workerUrl) {
      console.warn(`[Failover] Primary request failed (${err.message}). Falling back to Worker:`, workerUrl);
      return fetch(workerUrl, options);
    }
    throw err;
  }
}

