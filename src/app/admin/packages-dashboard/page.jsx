'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getPaidApiUrl } from '@/lib/config';

export default function AdminPackagesDashboardPage() {
  const [packages, setPackages] = useState([]);
  const [pkgSectionInfo, setPkgSectionInfo] = useState({ title: '', subtitle: '' });
  const [newPackage, setNewPackage] = useState({ title: '', price: '', duration: '', desc: '', link: '/packages' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/home-config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPackages(data.packages || []);
          setPkgSectionInfo(data.packageSectionInfo || { title: 'আমাদের প্রিপারেশন প্যাকেজসমূহ', subtitle: 'সাশ্রয়ী মূল্যে সেরা চাকরির প্রস্তুতি' });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (updatedPackages = packages, updatedInfo = pkgSectionInfo) => {
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
          packages: updatedPackages,
          packageSectionInfo: updatedInfo
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ প্যাকেজ তালিকা সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!', 'success');
      } else {
        showTopAlert('❌ সংরক্ষণ ব্যর্থ হয়েছে', 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!newPackage.title.trim() || !newPackage.price.trim()) return;
    const updated = [...packages, newPackage];
    setPackages(updated);
    setNewPackage({ title: '', price: '', duration: '', desc: '', link: '/packages' });
    handleSave(updated);
  };

  const handleDeletePackage = (index) => {
    if (!window.confirm('আপনি কি এই প্যাকেজটি মুছে ফেলতে চান?')) return;
    const updated = packages.filter((_, idx) => idx !== index);
    setPackages(updated);
    handleSave(updated);
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
          margin-bottom: 12px;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13.5px;
          color: #475569;
        }
        input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus {
          border-color: #007bff;
        }
        .btn {
          padding: 8px 14px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
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
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      <div className="box" style={{ borderLeft: '6px solid #6366f1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
              <i className="fa-solid fa-box-open" style={{ color: '#6366f1', marginRight: '8px' }}></i>
              প্যাকেজসমূহ কন্ট্রোল (Packages Dashboard)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              প্যাকেজের মূল্য, মেয়াদ ও অন্যান্য সেটিংস সরাসরি ডাটাবেজে সম্পাদনা করুন।
            </p>
          </div>
          <Link href="/packages" target="_blank" className="btn btn-primary">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> পাবলিক পেজ দেখুন
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>লোড হচ্ছে...</p>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>সেকশন শিরোনাম:</label>
                <input
                  type="text"
                  value={pkgSectionInfo.title}
                  onChange={(e) => setPkgSectionInfo({ ...pkgSectionInfo, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>সেকশন সাব-শিরোনাম:</label>
                <input
                  type="text"
                  value={pkgSectionInfo.subtitle}
                  onChange={(e) => setPkgSectionInfo({ ...pkgSectionInfo, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>বর্তমান প্যাকেজ তালিকা ({packages.length}):</label>
              {packages.map((pkg, index) => (
                <div key={index} className="item-card">
                  <div>
                    <strong style={{ fontSize: '15px', color: '#1e293b' }}>{pkg.title}</strong>{' '}
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', marginLeft: '6px' }}>
                      {pkg.price}
                    </span>{' '}
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({pkg.duration})</span>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{pkg.desc}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeletePackage(index)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Package Form */}
            <form onSubmit={handleAddPackage} style={{ background: '#fdfdfd', border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#007bff' }}>+ নতুন প্যাকেজ যোগ করুন</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr auto', gap: '8px', alignItems: 'flex-end' }}>
                <input
                  type="text"
                  placeholder="প্যাকেজের নাম"
                  value={newPackage.title}
                  onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="মূল্য (৯৯ টাকা)"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="মেয়াদ (১ মাস)"
                  value={newPackage.duration}
                  onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="বিবরণ"
                  value={newPackage.desc}
                  onChange={(e) => setNewPackage({ ...newPackage, desc: e.target.value })}
                />
                <button type="submit" className="btn btn-primary">
                  + যোগ করুন
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
