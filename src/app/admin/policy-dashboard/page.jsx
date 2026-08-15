'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminPolicyDashboardPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/policy/get')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
      })
      .catch(err => console.error('Fetch policy error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch('/api/policy/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      if (res.ok) {
        showTopAlert('পলিসি কনটেন্ট সফলভাবে সেভ হয়েছে!', 'success');
      } else {
        showTopAlert(data.message || 'সেভ করতে ব্যর্থ হয়েছে।', 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার এরর হয়েছে।', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><i className="fa-solid fa-spinner fa-spin"></i> লোড হচ্ছে...</div>;
  }

  return (
    <div>
      <style jsx>{`
        .box {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        textarea {
          width: 100%;
          padding: 15px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          font-family: monospace;
          line-height: 1.6;
          outline: none;
        }
        textarea:focus {
          border-color: var(--primary);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: 'var(--dark)', margin: 0 }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            রিফান্ড ও পলিসি কন্ট্রোল
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            প্রাইভেসি ও রিফান্ড পলিসি পেজের সম্পূর্ণ HTML বা টেক্সট কনটেন্ট আপডেট করুন।
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি সেভ করুন'}
        </button>
      </div>

      <div className="box">
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>
              পলিসি কনটেন্ট (HTML বা টেক্সট লিখুন):
            </label>
            <textarea
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h3>১. সেবা ব্যবহারের শর্তাবলী</h3><p>বিস্তারিত বিবরণ...</p>"
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={saving}>
            <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি আপডেট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
