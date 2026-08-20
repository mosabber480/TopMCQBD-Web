# Next.js Project Architecture & Developer Guide Rule

Antigravity AI must automatically recognize, read, and adhere to the project guide defined in [`next.js project guide.txt`](file:///c:/Users/Mosabber/Downloads/Mosabber/TopMCQBD-Web/next.js%20project%20guide.txt).

### Project Context & Core Rules:
1. **Architecture & Scope**:
   - Next.js App Router (`src/app/`) with Cloudflare Pages Functions (`functions/`).
   - Native MongoDB driver (`MongoClient`) with `nodejs_compat` support.

2. **Dual System Setup (Paid & Free)**:
   - Primary / Paid DB: `TopMCQBD_DB` (`topmcqbd.pages.dev`)
   - Secondary / Free DB: `TopMCQBD_DB_Free` (`topmcqbd-web-free.pages.dev`)

3. **Environment & Secrets Handling**:
   - Utilize `.env` and `.dev.vars` for secrets (`MONGODB_URI_PAID`, `MONGODB_URI_FREE`, `BREVO_API_KEY`, etc.).
   - Maintain DNS fallback & direct replica set connection URIs for local Windows development resilience.

4. **Security & Deployment Isolation**:
   - `next.js project guide.txt` is a local-only developer reference. It MUST remain in `.gitignore` and untracked so it is never pushed to GitHub or deployed to Cloudflare.
