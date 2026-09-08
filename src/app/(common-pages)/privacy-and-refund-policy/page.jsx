'use client';

import { useState, useEffect } from 'react';
import policyConfigData from '@/data/policy-config.json';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(policyConfigData?.content || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/policy/get')
      .then(res => res.json())
      .then(data => {
        if (data?.content) {
          setContent(data.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
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
