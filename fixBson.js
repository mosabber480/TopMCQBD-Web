import fs from 'fs';
import path from 'path';

const bsonLibDir = path.resolve('node_modules', 'bson', 'lib');

if (fs.existsSync(bsonLibDir)) {
  const files = fs.readdirSync(bsonLibDir);
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      const filePath = path.join(bsonLibDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      if (content.includes('ObjectId.resetState?.();')) {
        content = content.replace(/ObjectId\.resetState\?\.\(\);/g, 'try { typeof ObjectId !== "undefined" && ObjectId?.resetState?.(); } catch (e) {}');
        modified = true;
      }
      if (content.includes('this.resetState();')) {
        content = content.replace(/this\.resetState\(\);/g, 'try { typeof ObjectId !== "undefined" && ObjectId?.resetState?.(); } catch (e) {}');
        modified = true;
      }
      if (content.includes('startupSnapshot?.addDeserializeCallback?.(ObjectId.resetState);')) {
        content = content.replace(/startupSnapshot\?\.\addDeserializeCallback\?\.\(ObjectId\.resetState\);/g, 'try { if (typeof ObjectId !== "undefined" && ObjectId?.resetState) startupSnapshot?.addDeserializeCallback?.(ObjectId.resetState); } catch (e) {}');
        modified = true;
      }
      if (content.includes('startupSnapshot?.addDeserializeCallback?.(this.resetState);')) {
        content = content.replace(/startupSnapshot\?\.\addDeserializeCallback\?\.\(this\.resetState\);/g, 'try { if (typeof ObjectId !== "undefined" && ObjectId?.resetState) startupSnapshot?.addDeserializeCallback?.(ObjectId.resetState); } catch (e) {}');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Patched BSON static initializer in ${file}`);
      }
    }
  }
}

