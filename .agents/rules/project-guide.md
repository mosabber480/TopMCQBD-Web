# Next.js Project Architecture & Developer Guide Rule

Antigravity AI must automatically recognize, read, and adhere to the project guides defined in [`project-guide.local.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/project-guide.local.txt), [`cloudflare-pages-workers-master-guide.local.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/cloudflare-pages-workers-master-guide.local.txt), [`cloudflare-pages-mongodb-work.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/cloudflare-pages-mongodb-work.txt), and [`cloudflare-d1-bookmarks-guide.local.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/cloudflare-d1-bookmarks-guide.local.txt).

### Project Context & Core Rules:
1. **Architecture & Scope**:
   - Next.js App Router (`src/app/`) with Cloudflare Pages Functions (`functions/`).
   - Native MongoDB driver (`MongoClient`) with `nodejs_compat` support.
   - Cloudflare D1 SQL for Layout Configs & Bookmarks Architecture.

2. **Dual System Setup (Paid & Free)**:
   - Primary / Paid DB: `TopMCQBD_DB` (`topmcqbd.pages.dev`)
   - Secondary / Free DB: `TopMCQBD_DB_Free` (`topmcqbd-web-free.pages.dev`)

3. **Environment & Secrets Handling**:
   - Utilize `.env` and `.dev.vars` for secrets (`MONGODB_URI_PAID`, `MONGODB_URI_FREE`, `BREVO_API_KEY`, etc.).
   - Maintain DNS fallback & direct replica set connection URIs for local Windows development resilience.

4. **Security & Deployment Isolation**:
   - All `*.local.txt` and guide files are local-only developer references. They MUST remain in `.gitignore` and untracked so they are never pushed to GitHub or deployed to Cloudflare.
