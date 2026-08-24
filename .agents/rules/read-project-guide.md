# TopMCQBD Project — Startup Rule

## MANDATORY: Read Project Guide at Conversation Start

At the very beginning of **every new conversation** in this workspace, you MUST:

1. Read the full project guide file:
   `c:\Users\Mosabber\Downloads\Mosabber\TopMCQBD-Web\next.js project guide.txt`

2. Keep this knowledge in memory throughout the conversation so you:
   - Know the exact file structure
   - Know which API routes exist
   - Know the database configuration
   - Know the Cloudflare deployment setup
   - Know the environment variables
   - Know the data source rules (MongoDB vs local JSON)

3. Do NOT ask the user to explain the project — you already know it from the guide.

4. **STRICT IMMUTABILITY**:
   - `next.js project guide.txt` is **STRICTLY READ-ONLY**.
   - **NEVER** edit, update, overwrite, or delete this file.
   - **NEVER** ask the user for permission to edit this file.

## Key Facts to Remember After Reading

- **Build command:** `npm run build:cloudflare` (= fixBson.js + next build + copyAssets.js)
- **Live URL:** https://topmcqbd.pages.dev
- **Edge API handler:** `functions/api/[[route]].js` (handles all /api/* on Cloudflare)
- **Users data:** Always live from MongoDB — NOT from liveConfigs.js snapshot
- **liveConfigs.js:** Only contains layout, home, sidebar, policy configs + user fallback
- **MongoDB Data API is DEPRECATED** — use native MongoClient only
- **Git push:** `git push mcq main` for main repo, `git push all main` for both
- **No `&&` in PowerShell** — use separate commands or semicolons
