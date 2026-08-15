# Git Workflow Rule

1. **Automatic Add & Commit**:
   - Always automatically run `git add .` and create descriptive commits `git commit -m "..."` upon completing coding tasks.
   - Do NOT ask or prompt the user to run `git add` or `git commit`.

2. **Manual Push by User**:
   - NEVER execute `git push` commands directly.
   - ALWAYS show only the final `git push` commands:
     ```bash
     git push mcq main
     git push free-mcq main
     ```
