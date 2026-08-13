const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const appDir = path.join(__dirname, '..', 'src', 'app');

walkDir(appDir, filePath => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("export const runtime = 'edge';")) {
      content = content.replace("export const runtime = 'edge';\n", "").replace("export const runtime = 'edge';", "");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Removed edge runtime from:', filePath);
    }
  }
});
