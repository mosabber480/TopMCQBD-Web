import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'ফ্রি কুইজ অনুশীলন - TopMCQBD',
  description: 'TopMCQBD Free MCQs Practice'
};

export default function FreeMcqsPage() {
  return (
    <div style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div
        style={{
          background: 'white',
          padding: '60px 30px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid var(--main-dash-btn, #28a745)',
          maxWidth: '650px',
          margin: '0 auto'
        }}
      >
        <i className="fa-solid fa-gift" style={{ fontSize: '50px', color: '#28a745', marginBottom: '20px' }}></i>
        <h1 style={{ color: '#28a745', fontSize: '30px', marginBottom: '15px', fontWeight: 800 }}>
          Free MCQs Practice
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7', marginBottom: '25px' }}>
          ফ্রি কুইজ ও প্রশ্ন ব্যাংকের কাজ চলমান রয়েছে। খুব শীঘ্রই ফ্রিতে অনুশীলন করার সকল প্রশ্ন এখানে যুক্ত করা হবে।
        </p>
        <Link href="/questions" className="btn btn-success" style={{ padding: '12px 24px', fontSize: '15px' }}>
          <i className="fa-solid fa-play"></i> মূল প্রশ্নব্যাংক অনুশীলন করুন
        </Link>
      </div>
    </div>
  );
}
