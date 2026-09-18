# Next.js Project Architecture & Master Developer Guide Rules

> **PERMANENT MEMORY DIRECTIVE: ALL ROOT `.TXT` FILES ARE OFFICIAL MASTER GUIDES**
> All `.txt` files in the root directory of the project (`c:\Users\Mosabber\Downloads\Mosabber\TopMCQBD-Web\*.txt` and `*.local.txt`) are official master project guide files.
> Antigravity AI must automatically recognize, read, prioritize, and strictly adhere to the project guides in:
> 1. [`cloudflare-pages-workers-api-full-guide.txt`](file:///c:/Users/Mosabber/Downloads/Mosabber/TopMCQBD-Web/cloudflare-pages-workers-api-full-guide.txt) — Cloudflare Pages Functions, Workers API, D1 SQL, and Edge MongoDB Architecture.
> 2. [`project-guide.local.txt`](file:///c:/Users/Mosabber/Downloads/Mosabber/TopMCQBD-Web/project-guide.local.txt) — Master project overview, microservice matrix, collection definitions, credentials, and API mappings.
> 3. [`mongodb-render-cloudflare-full-guide.local.txt`](file:///c:/Users/Mosabber/Downloads/Mosabber/TopMCQBD-Web/mongodb-render-cloudflare-full-guide.local.txt) — MongoDB Atlas 6x Clusters, 6x Render Microservices, UptimeRobot Keep-Alive, and connection strings.
> 4. Any other current or future `*.txt` and `*.local.txt` guide files in the project root.
>
> Antigravity AI must consult these guide files as the single source of truth for all architectural, coding, database, and deployment tasks.

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
   - **STRICT DIRECTIVE (MANDATORY `mongodb+srv://`)**: Always and exclusively use the standard `mongodb+srv://` connection format for all database URIs across Cloudflare Pages Functions, Cloudflare Workers, and environment configs. Under NO circumstances should direct replica set / shard connection strings (`mongodb://...shard-00-00...`) be used.

4. **Security & Deployment Isolation**:
   - All `*.local.txt` and guide files are local-only developer references. They MUST remain in `.gitignore` and untracked so they are never pushed to GitHub or deployed to Cloudflare.

5. **Diagnostic Test Page Isolation (`/db-connection-api` Rule)**:
   - `/db-connection-api` এবং এর সকল সাব-পেজ (`/db-pages-api`, `/db-workers-api`, `/dbpaid-api`, `/db-mongodb-active-connection` ইত্যাদি) হলো একান্তই ব্যাকএন্ড ডায়াগনস্টিক ও টেস্ট পেজ।
   - **কঠোর নিয়ম (No Silent Fallback)**: টেস্ট পেজে কোনো সার্ভিস (Render 6x, Pages Functions, Worker API বা D1) ফেইল করলে বা স্লিপে থাকলে, অন্য কোনো সার্ভিস বা এপিআই দিয়ে সাইলেন্ট ফলব্যাক বা ব্যাকআপ দিয়ে চালানো সম্পূর্ণ নিষিদ্ধ। টেস্ট পেজে সরাসরি ব্যর্থতা (Disconnected/Error) দেখাতে হবে, যাতে এডমিন বুঝতে পারেন ঠিক কোন সার্ভিসটি ডাউন।
   - **মূল সাইট বনাম টেস্ট পেজ পার্থক্য**: মূল পাবলিক ওয়েবসাইটে স্মার্ট ফেইলওভার/ব্যাকআপ (Render -> Worker -> Local) যথারীতি সক্রিয় থাকবে যেন ইউজাররা নিরবচ্ছিন্ন সেবা পায়; কিন্তু `/db-connection-api` সুইটে প্রতিটি সার্ভিসকে সম্পূর্ণ আইসোলেটেডভাবে টেস্ট করতে হবে।

6. **No Localhost or Local Node.js API in `/db-connection-api`**:
   - `/db-connection-api` পেজগুলো ওয়েবসাইটের সাধারণ ইউজার পেজ নয়; শুধুমাত্র ইন্টারনাল ডাটাবেজ ও ক্লাউড ব্যাকএন্ড যাচাই করার টেস্ট পেজ।
   - লোকালহোস্টে (`http://localhost:3000/`) ব্রাউজ করা হলেও এই পেজগুলোতে কোনো লোকাল API বা লোকাল Node.js ব্যবহার হবে না।
   - প্রতিটি টেস্ট পেজ সরাসরি ও কেবল তার নির্ধারিত লাইভ ক্লাউড সার্ভিসকেই হিট করবে:
     * `db-pages-api` ও `dbd1-api` -> Cloudflare Pages Functions Live API (`https://topmcqbd.pages.dev/api/...`).
     * `db-workers-api` -> Cloudflare Workers Backup Live API (`https://topmcqbd-backup-api.mosabber5266.workers.dev/api/...`).
     * Render টেস্ট পেজসমূহ -> ডেডিকেটেড Render Live Microservices (`https://*.onrender.com/api/...`).
