'use client';

import { useState, useEffect } from 'react';
import policyConfigData from '@/data/policy-config.json';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(policyConfigData?.content || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policyConfigData?.content) {
      setContent(policyConfigData.content);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <style jsx>{`
        .page-banner {
          background: linear-gradient(135deg, var(--dark, #2c3e50), #1e293b);
          color: white;
          padding: 60px 20px;
          text-align: center;
        }
        .page-banner h1 { font-size: 34px; font-weight: 800; margin-bottom: 12px; }
        .page-banner p { font-size: 16px; color: #cbd5e1; }
        .content-container { max-width: 1300px; margin: 50px auto; padding: 0 20px; }
        .policy-card { 
          background: white; 
          border-radius: 12px; 
          padding: 45px 50px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0; 
          line-height: 1.85;
          color: #334155;
        }
        @media (max-width: 768px) {
          .policy-card { padding: 30px 20px; }
        }
      `}</style>

      <div className="page-banner">
        <h1>রিফান্ড ও পেমেন্ট পলিসি</h1>
        <p>TopMCQBD প্ল্যাটফর্ম ব্যবহারের পূর্বে আমাদের পেমেন্ট ও রিফান্ড সংক্রান্ত নিয়মাবলী জেনে নিন</p>
      </div>

      <div className="content-container">
        <div className="policy-card">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              পলিসি লোড হচ্ছে...
            </p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </>
  );
}
