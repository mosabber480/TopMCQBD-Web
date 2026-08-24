import fs from 'fs';
import path from 'path';

function patchLibDir(dirPath, isBson = false) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      patchLibDir(fullPath, isBson);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.cjs'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      if (isBson && content.includes('resetState')) {
        content = content
          .replace(/static\s+index\s*=\s*0;/g, 'static index = Math.floor(Math.random() * 0x1000000);')
          .replace(/static\s+resetState\s*=\s*\(\)\s*=>\s*\{/g, 'static resetState() {')
          .replace(/this\.index/g, 'ObjectId.index')
          .replace(/this\.PROCESS_UNIQUE/g, 'ObjectId.PROCESS_UNIQUE')
          .replace(/static\s*\{[\s\S]*?addDeserializeCallback[\s\S]*?\}\s*\}/g, '');
        modified = true;
      }

      if (content.includes('static { this.')) {
        // Convert `static { this.KEY = VALUE; }` to `static KEY = VALUE;` so esbuild transforms them as safe static fields
        content = content.replace(/static\s*\{\s*this\.([A-Za-z0-9_$]+)\s*=\s*([^;]+);\s*\}/g, 'static $1 = $2;');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Patched static initializers in ${entry.name}`);
      }
    }
  }
}

const bsonLibDir = path.resolve('node_modules', 'bson', 'lib');
const mongoLibDir = path.resolve('node_modules', 'mongodb', 'lib');

patchLibDir(bsonLibDir, true);
patchLibDir(mongoLibDir, false);






