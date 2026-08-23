import fs from 'fs';
import path from 'path';

function patchDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.cjs'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Patch BSON static initialization
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

      // Patch ReadPreference static initialization in mongodb
      if (content.includes('static { this.primary = new ReadPreference') || content.includes('this.primary = new ReadPreference')) {
        content = content.replace(/static\s*\{\s*this\.primary\s*=\s*new\s*ReadPreference\((.*?)\);\s*\}/g, 'static get primary() { return new ReadPreference($1); }');
        content = content.replace(/static\s*\{\s*this\.primaryPreferred\s*=\s*new\s*ReadPreference\((.*?)\);\s*\}/g, 'static get primaryPreferred() { return new ReadPreference($1); }');
        content = content.replace(/static\s*\{\s*this\.secondary\s*=\s*new\s*ReadPreference\((.*?)\);\s*\}/g, 'static get secondary() { return new ReadPreference($1); }');
        content = content.replace(/static\s*\{\s*this\.secondaryPreferred\s*=\s*new\s*ReadPreference\((.*?)\);\s*\}/g, 'static get secondaryPreferred() { return new ReadPreference($1); }');
        content = content.replace(/static\s*\{\s*this\.nearest\s*=\s*new\s*ReadPreference\((.*?)\);\s*\}/g, 'static get nearest() { return new ReadPreference($1); }');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Patched BSON/MongoDB initializer in ${entry.name}`);
      }
    }
  }
}

patchDir(path.resolve('node_modules', 'bson', 'lib'));
patchDir(path.resolve('node_modules', 'mongodb', 'lib'));
