/**
 * Sync Live Cloudflare D1 Configs to Local JSON files in src/data/
 * Usage: npm run sync:d1
 */

import fs from 'fs';
import path from 'path';

const CLOUDFLARE_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev').replace(/\/$/, '');

const ENDPOINTS = [
  { key: 'layout-config', file: 'layout-config.json', url: `${CLOUDFLARE_BASE_URL}/api/layout-config` },
  { key: 'home-config', file: 'home-config.json', url: `${CLOUDFLARE_BASE_URL}/api/home-config` },
  { key: 'sidebar-config', file: 'sidebar-config.json', url: `${CLOUDFLARE_BASE_URL}/api/sidebar-config` },
  { key: 'policy-config', file: 'policy-config.json', url: `${CLOUDFLARE_BASE_URL}/api/policy` },
  { key: 'about-data', file: 'about-data.json', url: `${CLOUDFLARE_BASE_URL}/api/about-data` },
  { key: 'faq-data', file: 'faq-data.json', url: `${CLOUDFLARE_BASE_URL}/api/faq-data` },
  { key: 'packages-data', file: 'packages-data.json', url: `${CLOUDFLARE_BASE_URL}/api/packages-data` },
];

async function syncAllConfigs() {
  console.log(`\n🔄 Fetching live configs from Cloudflare D1 (${CLOUDFLARE_BASE_URL})...\n`);

  const dataDir = path.resolve(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let successCount = 0;

  for (const item of ENDPOINTS) {
    try {
      const res = await fetch(item.url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const filePath = path.join(dataDir, item.file);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Synced: ${item.file}`);
        successCount++;
      } else {
        console.warn(`⚠️ Failed to fetch ${item.key} (${res.status} ${res.statusText})`);
      }
    } catch (err) {
      console.error(`❌ Error syncing ${item.file}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed! Successfully synced ${successCount}/${ENDPOINTS.length} JSON files from Cloudflare D1 to src/data/\n`);
}

syncAllConfigs();
