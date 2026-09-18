# TopMCQBD Master Project Guides (Office & Home Sync Hub)
**Date:** 18 September 2026  
**Architecture:** Next.js + Cloudflare Pages (Functions) + Cloudflare Workers + D1 SQL + 6x MongoDB Atlas  

---

## 📌 Office & Home Workstation Synchronization Directive
এই ফোল্ডারটি (`project-guides-2026-09-18/`) অফিস এবং বাসা—উভয় স্থান থেকে প্রজেক্ট পরিচালনার একক বিশ্বস্ত উৎস (Single Source of Truth)।

> **🤖 ANTIGRAVITY AI STRICT DIRECTIVE:**
> ১. অফিস বা বাসার পিসি থেকে ইউজার যখনই এই ফোল্ডারে বা প্রজেক্ট রুটে কোনো নতুন বা আপডেট গাইড ফাইল দেবেন, Antigravity AI তা সাথে সাথে সম্পূর্ণ পড়বে এবং নিজের গাইড ও ইন্টারনাল রুলস ফাইল আপডেট করে নেবে।
> ২. ইউজারকে বারবার পুরনো আর্কিটেকচার বা রুলস বোঝাতে হবে না; AI স্বয়ংক্রিয়ভাবে নতুন গাইড অনুসারে কোডিং ও কনফিগারেশন পরিচালনা করবে।
> ৩. সমস্ত ডাটাবেজ সংযোগে বাধ্যতামূলকভাবে `mongodb+srv://` ফরম্যাট বজায় রাখতে হবে (কোনো ডিরেক্ট শার্ড/রেপ্লিকা সেট ব্যবহার নিষিদ্ধ)।
> ৪. ক্লাউডফ্লেয়ার ডিপ্লয়মেন্টে ম্যানুয়াল কন্ট্রোল বজায় রাখতে হবে:
>    - Pages (`mosabber480` Gmail): `npm run pages:deploy`
>    - Worker (`mosabber5266` Gmail): `npm run worker:deploy`
>    - `npx wrangler logout` ও `npx wrangler login` শুধুমাত্র ইউজার নিজে ম্যানুয়ালি রান করবেন (AI নয়)।

---

## 📁 ফোল্ডারের গাইড ফাইল ইনডেক্স:

1. **[`cloudflare-pages-workers-api-full-guide.txt`](./cloudflare-pages-workers-api-full-guide.txt)**
   - Cloudflare Pages Functions (১২টি লাইভ এন্ডপয়েন্ট) ও Cloudflare Workers ব্যাকআপ ইঞ্জিন।
   - Native `MongoClient` + `nodejs_compat` আর্কিটেকচার।
   - Cloudflare D1 SQL (`env.DB`) ক্যাশিং ও স্কিমা।
   - সম্পূর্ণ CRUD মেকানিজম (GET, POST, PUT, Batch Drag-Drop Reorder, DELETE)।
   - ডায়াগনস্টিক স্যুট (`/db-connection-api`) ও জিরো লোকালহোস্ট রুল।

2. **[`project-guide.local.txt`](./project-guide.local.txt)**
   - মাস্টার প্রজেক্ট ওভারভিউ ও মাইক্রোসার্ভিস আর্কিটেকচার।
   - ৬টি MongoDB ক্লাস্টার ও কালেকশন স্কিমা।
   - রাউট ইনভেন্টরি ও পেজ টু ডাটাবেজ ম্যাপিং।
   - Brevo Email Gateway ও Google Gemini AI টিউটর ইঞ্জিন।
   - Cloudflare ডুয়েল-অ্যাকাউন্ট ও ম্যানুয়াল ডিপ্লয়মেন্ট নিয়ন্ত্রণ (সেকশন ১৩)।

3. **[`mongodb-render-cloudflare-full-guide.local.txt`](./mongodb-render-cloudflare-full-guide.local.txt)**
   - MongoDB Atlas ৬টি ক্লাস্টার স্ট্রাকচার।
   - ৬টি Render মাইক্রোসার্ভিস কনফিগারেশন ও ২-ওয়ে D1 সিঙ্ক।
   - UptimeRobot 24/7 Keep-Alive ক্রন মেকানিজম।

4. **[`mongodb-render-cloudflare-full-guide.local.html`](./mongodb-render-cloudflare-full-guide.local.html)**
   - সম্পূর্ণ আর্কিটেকচারের ভিজ্যুয়াল ও ইন্টারঅ্যাক্টিভ এইচটিএমএল ড্যাশবোর্ড গাইড।
