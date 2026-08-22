# Ignore Unnecessary Build & Dependency Files

Antigravity must strictly avoid reading, scanning, or processing generated, compiled, or dependency directories/files.

### Excluded Directories & Files:
1. `node_modules/` - Third-party Node.js packages
2. `.next/` - Next.js build cache, server bundles, and trace logs
3. `.open-next/` - OpenNext Cloudflare deployment output
4. `.wrangler/` - Cloudflare Wrangler local state & build cache
5. `out/` & `build/` - Static build exports
6. `_worker.bundle` - Compiled worker bundle file
7. `package-lock.json` - Large dependency lockfile
8. `*.log` - Execution log files
9. `TopMCQBD-Demo/` - Local demo folder (must never be tracked/uploaded)

### Allowed & Primary Focus Areas:
- Source code in `src/` (components, pages, API routes, app layout)
- Worker functions in `functions/`
- Configuration files (`package.json`, `next.config.mjs`, `wrangler.toml`, `jsconfig.json`)
