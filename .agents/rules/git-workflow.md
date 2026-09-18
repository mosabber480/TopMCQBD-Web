# Terminal & Git Rules

- **Allowed Dev Commands**:
  - `npm run dev` (Start / manage development server)
  - Build/test validation commands when explicitly needed.

- **STRICT GIT PUSH RULE (USER EXPLICIT COMMAND ONLY)**:
  - **কখনো নিজে নিজে `git push`, `git add` বা `git commit` করা যাবে না।**
  - AI কখনো নিজের ইচ্ছায় বা স্বয়ংক্রিয়ভাবে গিটহাবে কোনো কিছু পুশ করবে না।
  - **শুধুমাত্র এবং কেবল যখন ইউজার সরাসরি চ্যাটে বলবেন** (যেমন: "git push koro", "git push dao" ইত্যাদি), ঠিক তখনই ইউজার নির্দেশ দিলে `git push` করা যাবে।
  - ইউজারের সুস্পষ্ট নির্দেশ ছাড়া যেকোনো প্রকার অটোমেটিক গিট পুশ সম্পূর্ণ নিষিদ্ধ।
