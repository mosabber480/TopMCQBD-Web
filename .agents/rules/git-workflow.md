# Terminal & Git Rules

- **Development Server Rule**:
  - Always make sure `npm.cmd run dev` is running after finishing code changes so the local dev server on http://localhost:3000 is always ready for the USER.
- **Strict Git Push Rule**:
  - Do NOT run `git push` or `git commit` automatically/autonomously.
  - ONLY run `git push` / `git commit` when the USER explicitly commands you to do so (e.g. "git push koro", "push koro").
- **Allowed Read-Only Git Commands**:
  - `git status` (Read-only status check)
  - `git remote -v` (Read-only remote list)
- **Dev & Build Commands**:
  - `npm.cmd run dev` (Start / manage development server)
  - Build/test validation commands when needed.
