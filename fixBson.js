import fs from 'fs';
import path from 'path';

const bsonLibDir = path.resolve('node_modules', 'bson', 'lib');

if (fs.existsSync(bsonLibDir)) {
  const files = fs.readdirSync(bsonLibDir);
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      const filePath = path.join(bsonLibDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('resetState')) {
        content = content
          .replace(/ObjectId\.resetState/g, 'this.resetState')
          .replace(/this\.index/g, 'ObjectId.index')
          .replace(/this\.PROCESS_UNIQUE/g, 'ObjectId.PROCESS_UNIQUE');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched BSON static initializer in ${file}`);
      }
    }
  }
}



