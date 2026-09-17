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

5. **Diagnostic Test Page Isolation (`/db-connection-api` Rule)**:
   - `/db-connection-api` এবং এর সকল সাব-পেজ (`/db-pages-api`, `/db-workers-api`, `/dbpaid-api`, `/db-mongodb-active-connection` ইত্যাদি) হলো একান্তই ব্যাকএন্ড ডায়াগনস্টিক ও টেস্ট পেজ।
   - **কঠোর নিয়ম (No Silent Fallback)**: টেস্ট পেজে কোনো সার্ভিস (Render 6x, Pages Functions, Worker API বা D1) ফেইল করলে বা স্লিপে থাকলে, অন্য কোনো সার্ভিস বা এপিআই দিয়ে সাইলেন্ট ফলব্যাক বা ব্যাকআপ দিয়ে চালানো সম্পূর্ণ নিষিদ্ধ। টেস্ট পেজে সরাসরি ব্যর্থতা (Disconnected/Error) দেখাতে হবে, যাতে এডমিন বুঝতে পারেন ঠিক কোন সার্ভিসটি ডাউন।
   - **মূল সাইট বনাম টেস্ট পেজ পার্থক্য**: মূল পাবলিক ওয়েবসাইটে স্মার্ট ফেইলওভার/ব্যাকআপ (Render -> Worker -> Local) যথারীতি সক্রিয় থাকবে যেন ইউজাররা নিরবচ্ছিন্ন সেবা পায়; কিন্তু `/db-connection-api` সুইটে প্রতিটি সার্ভিসকে সম্পূর্ণ আইসোলেটেডভাবে টেস্ট করতে হবে।
