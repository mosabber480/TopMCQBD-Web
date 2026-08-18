'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminAboutDashboardPage() {
  const [missionInfo, setMissionInfo] = useState({
    sectionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
    sectionSubtitle: 'ডিজিটাল প্রযুক্তির মাধ্যমে চাকরি প্রার্থীদের প্রস্তুতিকে সহজ ও নিখুঁত করা',
    missionTitle: 'আমাদের মিশন',
    missionDesc: 'বাংলাদেশের প্রতিটি প্রান্তের শিক্ষার্থীদের জন্য মানসম্মত প্রশ্ন ব্যাংক ও সহজলভ্য মডেল টেস্ট পৌঁছে দেওয়া।',
    goalTitle: 'আমাদের ভিশন',
    goalDesc: 'স্মার্ট ও নির্ভুল অ্যানালিটিক্স দিয়ে চাকরি প্রার্থীদের সাফল্যের শীর্ষে পৌঁছে দেওয়া।'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/home-config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.missionSectionInfo) {
          setMissionInfo(data.missionSectionInfo);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const getRes = await fetch('/api/home-config');
      const currentConfig = await getRes.json();

      const res = await fetch('/api/home-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentConfig,
          missionSectionInfo: missionInfo
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ আমাদের সম্পর্কে পেজের তথ্য সফলভাবে সংরক্ষিত হয়েছে!', 'success');
      } else {
        showTopAlert('❌ সংরক্ষণ ব্যর্থ হয়েছে', 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 6px;
          font-size: 13.5px;
          color: #475569;
        }
        input,
        textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus,
        textarea:focus {
          border-color: #007bff;
        }
        .btn {
          padding: 9px 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn-success {
          background: #28a745;
          color: white;
        }
        .btn-primary {
          background: #007bff;
          color: white;
          text-decoration: none;
        }
      `}</style>

      <div className="box" style={{ borderLeft: '6px solid #20c997' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
              <i className="fa-solid fa-address-card" style={{ color: '#20c997', marginRight: '8px' }}></i>
              আমাদের সম্পর্কে (About Us Control Panel)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              পাবলিক &apos;আমাদের সম্পর্কে&apos; পেজের লক্ষ্য, উদ্দেশ্য ও বিবরণ সরাসরি ডাটাবেজে সম্পাদনা করুন।
            </p>
          </div>
          <Link href="/about-us" target="_blank" className="btn btn-primary">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> পাবলিক পেজ দেখুন
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>লোড হচ্ছে...</p>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>সেকশন শিরোনাম (Section Title):</label>
                <input
                  type="text"
                  value={missionInfo.sectionTitle || ''}
                  onChange={(e) => setMissionInfo({ ...missionInfo, sectionTitle: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>সাব-শিরোনাম (Subtitle):</label>
                <input
                  type="text"
                  value={missionInfo.sectionSubtitle || ''}
                  onChange={(e) => setMissionInfo({ ...missionInfo, sectionSubtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>মিশন শিরোনাম (Mission Title):</label>
              <input
                type="text"
                value={missionInfo.missionTitle || ''}
                onChange={(e) => setMissionInfo({ ...missionInfo, missionTitle: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>মিশন বিবরণ (Mission Description):</label>
              <textarea
                rows={3}
                value={missionInfo.missionDesc || ''}
                onChange={(e) => setMissionInfo({ ...missionInfo, missionDesc: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>ভিশন শিরোনাম (Vision / Goal Title):</label>
              <input
                type="text"
                value={missionInfo.goalTitle || ''}
                onChange={(e) => setMissionInfo({ ...missionInfo, goalTitle: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>ভিশন বিবরণ (Vision / Goal Description):</label>
              <textarea
                rows={3}
                value={missionInfo.goalDesc || ''}
                onChange={(e) => setMissionInfo({ ...missionInfo, goalDesc: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success" disabled={saving}>
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
