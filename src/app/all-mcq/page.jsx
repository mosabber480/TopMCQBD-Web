'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AllMcqPage() {
  const [loading, setLoading] = useState(true);
  const [categoryTree, setCategoryTree] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const [catRes, qRes] = await Promise.all([
          fetch('/api/categories').catch(() => null),
          fetch('/api/questions').catch(() => null)
        ]);

        const tree = {};

        const addPathToTree = (pathStr) => {
          if (!pathStr || typeof pathStr !== 'string') return;
          const parts = pathStr.includes('>')
            ? pathStr.split(/\s*>\s*/)
            : pathStr.split('/');
          const cleaned = parts.map(p => p.trim()).filter(Boolean);
          if (cleaned.length === 0) return;

          const mainCat = cleaned[0] || 'অন্যান্য';
          const subCat = cleaned[1] || mainCat;
          const topic = cleaned[2] || subCat;

          if (!tree[mainCat]) tree[mainCat] = {};
          if (!tree[mainCat][subCat]) tree[mainCat][subCat] = new Set();
          tree[mainCat][subCat].add(topic);
        };

        if (catRes && catRes.ok) {
          const catData = await catRes.json();
          const rawCats = Array.isArray(catData) ? catData : (catData.categories || catData.data || []);
          rawCats.forEach(addPathToTree);
        }

        if (qRes && qRes.ok) {
          const qData = await qRes.json();
          const rawQuestions = Array.isArray(qData) ? qData : (qData.mcqs || qData.questions || []);
          rawQuestions.forEach(q => {
            if (q.category) addPathToTree(q.category);
          });
        }

        setCategoryTree(tree);
        setLoading(false);
      } catch (err) {
        console.error('All MCQ Error:', err);
        setError('ক্যাটাগরি ডাটা লোড করতে সমস্যা হয়েছে!');
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const mainCategories = Object.keys(categoryTree);

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '30px auto', padding: '0 20px' }}>
      <style jsx>{`
        .all-mcq-card {
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          position: relative;
          border: 1px solid #e2e8f0;
          width: 100%;
        }
        .btn-home {
          position: absolute;
          top: 0;
          left: 0;
          background-color: var(--primary, #007bff);
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-bottom-right-radius: 8px;
          border-top-left-radius: 9px;
          font-size: 13px;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s ease;
        }
        .btn-home:hover { background-color: var(--primary-dark, #0056b3); }
        .page-title { 
          text-align: center; 
          color: var(--dark, #2c3e50); 
          margin-top: 15px; 
          margin-bottom: 25px; 
          font-size: 26px;
          font-weight: 700;
        }
        .main-category-card { 
          border: 1px solid #cbd5e1; 
          border-radius: 8px; 
          margin-bottom: 20px; 
          background: #ffffff; 
          overflow: hidden; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .main-category-header { 
          background: #f8fafc; 
          padding: 14px 20px; 
          font-size: 18px; 
          font-weight: 700; 
          color: var(--dark, #2c3e50); 
          border-bottom: 1px solid #e2e8f0; 
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sub-category-block {
          padding: 15px 20px;
          border-bottom: 1px dashed #e2e8f0;
        }
        .sub-category-block:last-child {
          border-bottom: none;
        }
        .sub-category-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topic-btn-group { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 10px; 
          padding-left: 10px;
        }
        .topic-btn { 
          background-color: #f1f5f9; 
          color: #334155; 
          text-decoration: none; 
          padding: 8px 14px; 
          border-radius: 6px; 
          font-size: 13px; 
          font-weight: 600; 
          border: 1px solid #cbd5e1;
          transition: all 0.2s ease; 
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .topic-btn:hover { 
          background-color: var(--primary, #007bff); 
          color: #ffffff; 
          border-color: var(--primary, #007bff);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .topic-btn {
            width: 100%;
            justify-content: center;
          }
          .page-title {
            font-size: 20px;
            margin-top: 25px;
          }
        }
      `}</style>

      <div className="all-mcq-card">
        <Link href="/" className="btn-home">
          <i className="fa-solid fa-arrow-left"></i> হোম পেজ
        </Link>
        <h1 className="page-title">
          <i className="fa-solid fa-layer-group" style={{ color: 'var(--primary, #007bff)', marginRight: '8px' }}></i>
          সকল কুইজ ও প্রশ্নব্যাংক ক্যাটাগরি (All Questions)
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
            ক্যাটাগরি ডাটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'var(--danger)', padding: '30px 0' }}>
            {error}
          </p>
        ) : mainCategories.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            কোনো ক্যাটাগরি পাওয়া যায়নি!
          </p>
        ) : (
          <div className="category-wrapper">
            {mainCategories.map(mainCat => {
              const subCats = Object.keys(categoryTree[mainCat] || {});

              return (
                <div key={mainCat} className="main-category-card">
                  <div className="main-category-header">
                    <span>
                      <i className="fa-solid fa-folder-open" style={{ color: 'var(--primary, #007bff)', marginRight: '8px' }}></i>
                      {mainCat}
                    </span>
                  </div>

                  {subCats.map(subCat => {
                    const topics = Array.from(categoryTree[mainCat][subCat] || []);

                    return (
                      <div key={subCat} className="sub-category-block">
                        <div className="sub-category-title">
                          <i className="fa-solid fa-folder" style={{ color: '#17a2b8' }}></i>
                          {subCat}
                        </div>

                        <div className="topic-btn-group">
                          {topics.map(topic => {
                            const fullCategoryPath = `${mainCat} > ${subCat} > ${topic}`;

                            return (
                              <Link
                                key={topic}
                                href={`/questions?category=${encodeURIComponent(fullCategoryPath)}`}
                                className="topic-btn"
                              >
                                <i className="fa-regular fa-file-lines"></i> {topic}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
