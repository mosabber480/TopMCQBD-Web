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

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');

walkDir(apiDir, filePath => {
  if (filePath.endsWith('route.js') || filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("export const runtime = 'edge'")) {
      content = "export const runtime = 'edge';\n" + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Added edge runtime to:', filePath);
    }
  }
});
