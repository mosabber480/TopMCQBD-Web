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
          // Convert arrow function static property to static method so esbuild keeps it inside the class definition
          .replace(/static\s+resetState\s*=\s*\(\)\s*=>\s*\{/g, 'static resetState() {')
          // Ensure index and PROCESS_UNIQUE refer to ObjectId
          .replace(/this\.index/g, 'ObjectId.index')
          .replace(/this\.PROCESS_UNIQUE/g, 'ObjectId.PROCESS_UNIQUE')
          // Make the static block initializer completely safe
          .replace(/this\.resetState\?\.\(\);/g, 'if (typeof this?.resetState === "function") this.resetState();')
          .replace(/ObjectId\.resetState\?\.\(\);/g, 'if (typeof ObjectId?.resetState === "function") ObjectId.resetState();');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched BSON static initializer in ${file}`);
      }
    }
  }
}




