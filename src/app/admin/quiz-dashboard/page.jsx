'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminQuizDashboardPage() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Category Selection
  const [mainCat, setMainCat] = useState('');
  const [subCat, setSubCat] = useState('');
  const [topic, setTopic] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Existing Questions in category
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Dynamic MCQ blocks
  const [mcqList, setMcqList] = useState([
    { q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
  ]);
  const [submittingMCQs, setSubmittingMCQs] = useState(false);

  // CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Compute selected category path
  const getSelectedCategoryPath = () => {
    if (isCustomMode) return customPath.trim();
    if (!mainCat) return '';
    if (!subCat) return mainCat;
    if (!topic) return `${mainCat} > ${subCat}`;
    return `${mainCat} > ${subCat} > ${topic}`;
  };

  const selectedPath = getSelectedCategoryPath();

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCats(false);
    }
  };

  const loadQuestionsForPath = async (catPath) => {
    if (!catPath) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/questions?category=${encodeURIComponent(catPath)}&limit=100`);
      const data = await res.json();
      if (data && data.questions) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      loadQuestionsForPath(selectedPath);
    } else {
      setQuestions([]);
    }
  }, [selectedPath]);

  // Dynamic distinct levels from categories array
  const mainCategories = Array.from(
    new Set(categories.map(c => c.split(' > ')[0]).filter(Boolean))
  );

  const subCategories = mainCat
    ? Array.from(
        new Set(
          categories
            .filter(c => c.startsWith(mainCat + ' > '))
            .map(c => c.split(' > ')[1])
            .filter(Boolean)
        )
      )
    : [];

  const topicCategories = mainCat && subCat
    ? Array.from(
        new Set(
          categories
            .filter(c => c.startsWith(`${mainCat} > ${subCat} > `))
            .map(c => c.split(' > ')[2])
            .filter(Boolean)
        )
      )
    : [];

  // MCQ block handlers
  const handleAddMCQBlock = () => {
    setMcqList(prev => [
      ...prev,
      { q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
    ]);
  };

  const handleRemoveMCQBlock = (idx) => {
    if (mcqList.length <= 1) return;
    setMcqList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMCQChange = (idx, field, value) => {
    setMcqList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleOptionChange = (mcqIdx, optIdx, val) => {
    setMcqList(prev => {
      const updated = [...prev];
      const newOpts = [...updated[mcqIdx].options];
      newOpts[optIdx] = val;
      updated[mcqIdx] = { ...updated[mcqIdx], options: newOpts };
      return updated;
    });
  };

  // Submit All MCQs
  const handleSubmitAllMCQs = async (e) => {
    e.preventDefault();
    const catPath = getSelectedCategoryPath();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    if (!catPath) {
      showTopAlert('Please select or specify a Target Category!', 'warning');
      return;
    }
    if (!token) {
      showTopAlert('Please login as admin first!', 'warning');
      return;
    }

    setSubmittingMCQs(true);
    let successCount = 0;
    let hasError = false;

    for (const mcq of mcqList) {
      if (!mcq.q.trim()) continue;

      const payload = {
        q: mcq.q.trim(),
        options: mcq.options.map(o => o.trim()),
        ans: parseInt(mcq.ans, 10) || 0,
        explanation: (mcq.explanation || '').trim(),
        category: catPath
      };

      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          hasError = true;
        }
      } catch (err) {
        hasError = true;
      }
    }

    setSubmittingMCQs(false);

    if (!hasError && successCount > 0) {
      showTopAlert(`🎉 Success! ${successCount} questions saved under '${catPath}'.`, 'success');
      setMcqList([{ q: '', options: ['', '', '', ''], ans: 0, explanation: '' }]);
      loadCategories();
      loadQuestionsForPath(catPath);
    } else {
      showTopAlert(`Saved ${successCount} questions, but some errors occurred.`, 'danger');
      loadQuestionsForPath(catPath);
    }
  };

  // CSV File upload
  const handleCSVUpload = async (e) => {
    e.preventDefault();
    const catPath = getSelectedCategoryPath();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    if (!catPath) {
      showTopAlert('Please select Target Category!', 'warning');
      return;
    }
    if (!csvFile) {
      showTopAlert('Please choose a CSV file first!', 'warning');
      return;
    }

    setUploadingCsv(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('category', catPath);

    try {
      const res = await fetch('/api/questions/upload-csv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`🎉 Success! ${data.count} questions added to '${catPath}'.`, 'success');
        setCsvFile(null);
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.value = '';
        loadCategories();
        loadQuestionsForPath(catPath);
      } else {
        showTopAlert(`❌ Error: ${data.message || data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Failed to upload CSV file!', 'danger');
    } finally {
      setUploadingCsv(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id) => {
    const confirm = await showTopAlert('Are you sure you want to delete this question?', 'danger', true);
    if (!confirm) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Question deleted successfully!', 'success');
        loadQuestionsForPath(selectedPath);
      } else {
        showTopAlert('Failed to delete question!', 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting question!', 'danger');
    }
  };

  // Edit question modal submit
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingQuestion)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Question updated successfully!', 'success');
        setEditingQuestion(null);
        loadQuestionsForPath(selectedPath);
      } else {
        showTopAlert('Failed to update question!', 'danger');
      }
    } catch (err) {
      showTopAlert('Error updating question!', 'danger');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 25px 25px' }}>
      <style jsx>{`
        .section-card {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--dark, #2c3e50);
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-cat { border-left: 6px solid var(--primary, #007bff); }
        .card-csv { border-left: 6px solid #17a2b8; }
        .card-mcq { border-left: 6px solid #28a745; }
        .card-existing { border-left: 6px solid #ff9f43; }

        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: 600; margin-bottom: 6px; color: #475569; font-size: 13.5px; }
        input, select, textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--primary, #007bff); }
        .row { display: flex; gap: 15px; margin-bottom: 10px; flex-wrap: wrap; align-items: flex-start; }
        .row .form-group { flex: 1; min-width: 200px; }

        .btn {
          padding: 9px 18px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary { background-color: var(--primary, #007bff); color: white; }
        .btn-submit { background-color: #28a745; color: white; }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }

        .mcq-block {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
          position: relative;
        }
        .mcq-title {
          font-weight: bold;
          font-size: 15px;
          color: var(--primary, #007bff);
          margin-bottom: 12px;
        }
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 15px;
        }
        .ans-explanation-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .path-badge {
          display: inline-block;
          background: #e3f2fd;
          color: #007bff;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          margin-top: 10px;
          border: 1px solid #bad8f7;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 12px;
          border: 1px solid #e2e8f0;
          text-align: left;
          font-size: 13.5px;
        }
        th { background: #f8fafc; font-weight: bold; color: #475569; }
      `}</style>

      {/* 1. CATEGORY SELECTION CARD */}
      <div className="section-card card-cat">
        <div className="section-title">
          <i className="fa-solid fa-folder-tree" style={{ color: 'var(--primary)' }}></i> ১. ক্যাটাগরি ও বিষয় নির্ধারণ (Target Category)
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            type="button"
            className={`btn ${!isCustomMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsCustomMode(false)}
          >
            <i className="fa-solid fa-list"></i> ড্রপডাউন থেকে বাছাই
          </button>
          <button
            type="button"
            className={`btn ${isCustomMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsCustomMode(true)}
          >
            <i className="fa-solid fa-plus-circle"></i> কাস্টম নতুন ক্যাটাগরি পাথ
          </button>
        </div>

        {!isCustomMode ? (
          <div className="row">
            <div className="form-group">
              <label>মূল ক্যাটাগরি (Main Category - Level 1):</label>
              <select
                value={mainCat}
                onChange={(e) => {
                  setMainCat(e.target.value);
                  setSubCat('');
                  setTopic('');
                }}
              >
                <option value="">-- মূল ক্যাটাগরি নির্বাচন করুন --</option>
                {mainCategories.map((mc, idx) => (
                  <option key={idx} value={mc}>
                    {mc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>সাব-ক্যাটাগরি (Sub Category - Level 2):</label>
              <select
                value={subCat}
                onChange={(e) => {
                  setSubCat(e.target.value);
                  setTopic('');
                }}
                disabled={!mainCat}
              >
                <option value="">-- সাব-ক্যাটাগরি নির্বাচন করুন --</option>
                {subCategories.map((sc, idx) => (
                  <option key={idx} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>টপিক / বিষয় (Topic - Level 3):</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!mainCat || !subCat}
              >
                <option value="">-- টপিক নির্বাচন করুন --</option>
                {topicCategories.map((tc, idx) => (
                  <option key={idx} value={tc}>
                    {tc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>নতুন ক্যাটাগরি পাথ লিখুন (যেমন: বিসিএস প্রস্তুতি &gt; বাংলা ভাষা ও সাহিত্য &gt; সন্ধি):</label>
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="Main > Sub > Topic"
            />
          </div>
        )}

        <div>
          <strong>বর্তমান নির্ধারিত পাথ:</strong>{' '}
          {selectedPath ? (
            <span className="path-badge">{selectedPath}</span>
          ) : (
            <span style={{ color: '#dc3545', fontSize: '13px' }}>কোনো পাথ নির্বাচিত নেই!</span>
          )}
        </div>
      </div>

      {/* 2. CSV BULK UPLOAD CARD */}
      <div className="section-card card-csv">
        <div className="section-title">
          <i className="fa-solid fa-file-csv" style={{ color: '#17a2b8' }}></i> ২. CSV ফাইলের মাধ্যমে বাল্ক প্রশ্ন আপলোড
        </div>
        <p style={{ fontSize: '13.5px', color: '#666', marginBottom: '15px' }}>
          CSV ফরম্যাট: <code>question,option1,option2,option3,option4,correct_answer,explanation</code> (correct_answer = 0, 1, 2, 3 অথবা অপশন টেক্সট)
        </p>

        <form onSubmit={handleCSVUpload} className="row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>CSV ফাইল নির্বাচন করুন:</label>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" disabled={uploadingCsv}>
              {uploadingCsv ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> আপলোড হচ্ছে...</>
              ) : (
                <><i className="fa-solid fa-upload"></i> 📁 Upload CSV File</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. DYNAMIC MCQ FORM CARD */}
      <div className="section-card card-mcq">
        <div className="section-title">
          <i className="fa-solid fa-pen-to-square" style={{ color: '#28a745' }}></i> ৩. প্রশ্ন সংযোজন ফরম (Single / Multiple MCQs)
        </div>

        <form onSubmit={handleSubmitAllMCQs}>
          {mcqList.map((mcq, idx) => (
            <div key={idx} className="mcq-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mcq-title">MCQ #{idx + 1}</div>
                {mcqList.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '3px 8px', fontSize: '12px' }}
                    onClick={() => handleRemoveMCQBlock(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question (প্রশ্ন):</label>
                <input
                  type="text"
                  value={mcq.q}
                  onChange={(e) => handleMCQChange(idx, 'q', e.target.value)}
                  placeholder="যেমন: 'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?'"
                  required
                />
              </div>

              <label>Options (4 Choices):</label>
              <div className="options-grid">
                <input
                  type="text"
                  placeholder="অপশন (ক)"
                  value={mcq.options[0]}
                  onChange={(e) => handleOptionChange(idx, 0, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (খ)"
                  value={mcq.options[1]}
                  onChange={(e) => handleOptionChange(idx, 1, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (গ)"
                  value={mcq.options[2]}
                  onChange={(e) => handleOptionChange(idx, 2, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (ঘ)"
                  value={mcq.options[3]}
                  onChange={(e) => handleOptionChange(idx, 3, e.target.value)}
                  required
                />
              </div>

              <div className="ans-explanation-row">
                <div className="form-group" style={{ minWidth: '180px' }}>
                  <label>সঠিক উত্তর (Correct Answer):</label>
                  <select
                    value={mcq.ans}
                    onChange={(e) => handleMCQChange(idx, 'ans', parseInt(e.target.value))}
                    required
                  >
                    <option value={0}>অপশন (ক)</option>
                    <option value={1}>অপশন (খ)</option>
                    <option value={2}>অপশন (গ)</option>
                    <option value={3}>অপশন (ঘ)</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>ব্যাখ্যা (Explanation - ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={mcq.explanation}
                    onChange={(e) => handleMCQChange(idx, 'explanation', e.target.value)}
                    placeholder="সঠিক উত্তরের বিশদ বিবরণ বা ব্যাখ্যা লিখুন..."
                  />
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleAddMCQBlock}>
              <i className="fa-solid fa-plus"></i> Add Another Question
            </button>
            <button type="submit" className="btn btn-submit" disabled={submittingMCQs}>
              {submittingMCQs ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Saving Data...</>
              ) : (
                <><i className="fa-solid fa-rocket"></i> 🚀 Submit All Questions</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. EXISTING QUESTIONS CARD */}
      <div className="section-card card-existing">
        <div className="section-title">
          <i className="fa-solid fa-list-check" style={{ color: '#ff9f43' }}></i> ৪. নির্বাচিত পাথের প্রশ্নসমূহ ({questions.length})
        </div>

        {loadingQuestions ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>প্রশ্ন তালিকা লোড হচ্ছে...</p>
        ) : questions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            এই পাথে কোনো প্রশ্ন নেই। উপরে ফরম থেকে নতুন প্রশ্ন যুক্ত করুন।
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Correct</th>
                  <th>Explanation</th>
                  <th style={{ width: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, qIdx) => (
                  <tr key={q._id || qIdx}>
                    <td>{qIdx + 1}</td>
                    <td><strong>{q.q}</strong></td>
                    <td style={{ fontSize: '12px' }}>
                      ১. {q.options[0]} | ২. {q.options[1]}<br />
                      ৩. {q.options[2]} | ৪. {q.options[3]}
                    </td>
                    <td>
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        অপশন ({['ক', 'খ', 'গ', 'ঘ'][q.ans] || q.ans})
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>{q.explanation || 'None'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-warning"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setEditingQuestion(q)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => handleDeleteQuestion(q._id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              maxWidth: '650px',
              width: '100%',
              padding: '25px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>প্রশ্ন এডিট করুন</h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                onClick={() => setEditingQuestion(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion}>
              <div className="form-group">
                <label>Question:</label>
                <input
                  type="text"
                  value={editingQuestion.q}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, q: e.target.value })}
                  required
                />
              </div>

              <div className="options-grid">
                {editingQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="form-group">
                    <label>অপশন ({['ক', 'খ', 'গ', 'ঘ'][oIdx]}):</label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Correct Answer:</label>
                  <select
                    value={editingQuestion.ans}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, ans: parseInt(e.target.value) })}
                  >
                    <option value={0}>অপশন (ক)</option>
                    <option value={1}>অপশন (খ)</option>
                    <option value={2}>অপশন (গ)</option>
                    <option value={3}>অপশন (ঘ)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Explanation:</label>
                  <input
                    type="text"
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
