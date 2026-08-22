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
          // Initialize index with random value directly
          .replace(/static\s+index\s*=\s*0;/g, 'static index = Math.floor(Math.random() * 0x1000000);')
          // Convert resetState to static class method
          .replace(/static\s+resetState\s*=\s*\(\)\s*=>\s*\{/g, 'static resetState() {')
          // Fix references inside resetState
          .replace(/this\.index/g, 'ObjectId.index')
          .replace(/this\.PROCESS_UNIQUE/g, 'ObjectId.PROCESS_UNIQUE')
          // Remove the V8 snapshot static block completely to prevent esbuild IIFE `this` evaluation error on Cloudflare Workers
          .replace(/static\s*\{[\s\S]*?addDeserializeCallback[\s\S]*?\}\s*\}/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched BSON static initializer in ${file}`);
      }
    }
  }
}





