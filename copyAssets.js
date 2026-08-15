import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const outDirs = [
  path.resolve('out'),
  path.resolve('.open-next', 'assets')
];

for (const targetDir of outDirs) {
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Copy public static assets
  const publicDir = path.resolve('public');
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, targetDir);
  }

  // 2. Copy Next.js client JS/CSS chunks (_next/static)
  const nextStaticDir = path.resolve('.next', 'static');
  if (fs.existsSync(nextStaticDir)) {
    copyDir(nextStaticDir, path.join(targetDir, '_next', 'static'));
  }

  // 3. Copy Prerendered HTML pages
  const nextAppServerDir = path.resolve('.next', 'server', 'app');
  if (fs.existsSync(nextAppServerDir)) {
    // Home page index.html
    const homeHtml = path.join(nextAppServerDir, 'index.html');
    if (fs.existsSync(homeHtml)) {
      fs.copyFileSync(homeHtml, path.join(targetDir, 'index.html'));
    }

    // 404 page
    const notFoundHtml = path.join(nextAppServerDir, '_not-found.html');
    if (fs.existsSync(notFoundHtml)) {
      fs.copyFileSync(notFoundHtml, path.join(targetDir, '404.html'));
    }

    // DB Connection check page
    const dbCheckHtml = path.join(nextAppServerDir, 'db-connection-check.html');
    if (fs.existsSync(dbCheckHtml)) {
      const dbCheckDir = path.join(targetDir, 'db-connection-check');
      fs.mkdirSync(dbCheckDir, { recursive: true });
      fs.copyFileSync(dbCheckHtml, path.join(dbCheckDir, 'index.html'));
      fs.copyFileSync(dbCheckHtml, path.join(targetDir, 'db-connection-check.html'));
    }
  }
}

console.log('✅ Synchronized Next.js production build assets to out/ and .open-next/assets/');
