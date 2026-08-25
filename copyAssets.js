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

function copyHtmlFilesRecursively(srcDir, targetDir, currentSubdir = '') {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullSrc = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      // Ignore internal next directories
      if (!entry.name.startsWith('_') && entry.name !== 'api') {
        copyHtmlFilesRecursively(fullSrc, targetDir, path.join(currentSubdir, entry.name));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const baseName = entry.name.replace(/\.html$/, '');

      if (baseName === 'index' && !currentSubdir) {
        // Root index.html
        fs.copyFileSync(fullSrc, path.join(targetDir, 'index.html'));
      } else if (baseName === '_not-found') {
        fs.copyFileSync(fullSrc, path.join(targetDir, '404.html'));
      } else {
        const routeName = currentSubdir ? path.join(currentSubdir, baseName) : baseName;
        const pageFolder = path.join(targetDir, routeName);
        fs.mkdirSync(pageFolder, { recursive: true });
        fs.copyFileSync(fullSrc, path.join(pageFolder, 'index.html'));
        fs.copyFileSync(fullSrc, path.join(targetDir, `${routeName}.html`));
      }
    }
  }
}



const outDirs = [
  path.resolve('out')
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
    copyHtmlFilesRecursively(nextAppServerDir, targetDir);
  }
}

console.log('✅ Synchronized Next.js production build assets to out/');
process.exit(0);

