# Next.js Project Architecture & Master Developer Guide Rules

> **PERMANENT MEMORY DIRECTIVE: ALL MASTER GUIDES IN ROOT & UPDATE FOLDERS (`project-guides-update-date/`)**
> All `.txt`, `.md`, and `.local.txt` files in `project-guides-update-date/` (or any latest `project-guides*/` folder) and in the root directory are official master project guides.
> 
> **OFFICE & HOME WORKSTATION AUTO-SYNC DIRECTIVE:**
> The user works from two workstations (Office PC and Home PC). Whenever the user provides or updates any guide file in the project from either office or home:
> 1. Antigravity AI must automatically recognize, read, and immediately integrate all updates into memory and master guides.
> 2. The user will NOT have to explain the architecture or rules repeatedly.
> 3. Antigravity AI must strictly adhere to the single source of truth in the updated guides:
>    - [`cloudflare-pages-workers-api-full-guide.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/cloudflare-pages-workers-api-full-guide.txt)
>    - [`project-guide.local.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/project-guide.local.txt)
>    - [`mongodb-render-cloudflare-full-guide.local.txt`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/mongodb-render-cloudflare-full-guide.local.txt)
>    - [`mongodb-render-cloudflare-full-guide.local.html`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/mongodb-render-cloudflare-full-guide.local.html)
>    - [`project-guides-update-date/README.md`](file:///c:/Users/bdCalling/Downloads/Mosabber/TopMCQBD-Web/project-guides-update-date/README.md)
> 
> **OFFLINE MASTER ZIP BACKUP ARCHIVE:**
> - Location: `project-guides-update-date/` & backup zip archives across workstations (Office & Home).
> - Contains all master guides, full architecture details, and `.env` backup.

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

7. **Cloudflare Dual-Account Architecture & Manual Deployment Control (USER ONLY)**:
   - **Cloudflare Account 1 (Pages Main Production)**: `https://topmcqbd.pages.dev`
     * সংশ্লিষ্ট জিমেইল: `mosabber480` (Gmail Account 1)
     * কমান্ড: `npm run pages:deploy`
   - **Cloudflare Account 2 (Worker Backup Gateway)**: `https://topmcqbd-backup-api.mosabber5266.workers.dev`
     * সংশ্লিষ্ট জিমেইল: `mosabber5266` (Gmail Account 2 — সম্পূর্ণ পৃথক ক্লাউডফ্লেয়ার একাউন্ট)
     * কমান্ড: `npm run worker:deploy`
   - **কঠোর নিয়ম (Manual Wrangler Auth Control)**:
     * দুটি আলাদা একাউন্টে কাজ বা ডিপ্লয় করার সময় একাউন্ট পরিবর্তন করার জন্য `npx wrangler logout` এবং `npx wrangler login` কমান্ড দুটি শুধুমাত্র ইউজার নিজে (ম্যানুয়ালি সিএমডি থেকে) কন্ট্রোল করবেন; Gemini বা AI কখনো স্বয়ংক্রিয়ভাবে লগআউট/লগইন করার চেষ্টা করবে না।
     * AI ইউজারের নির্দেশনা অনুযায়ী শুধুমাত্র ডিপ্লয় কমান্ডটি চালাবে, কিন্তু ক্রেডেনশিয়াল/টোকেন স্যুইচিংয়ের নিয়ন্ত্রণ একান্তই ইউজারের নিজস্ব দায়িত্বে থাকবে।
