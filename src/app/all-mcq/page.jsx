'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPaidApiUrl } from '@/lib/config';

export default function AllMcqPage() {
  const [loading, setLoading] = useState(true);
  const [categoryTree, setCategoryTree] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const [catRes, qRes] = await Promise.all([
          fetch(getPaidApiUrl('/api/categories')).catch(() => null),
          fetch(getPaidApiUrl('/api/questions')).catch(() => null)
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
