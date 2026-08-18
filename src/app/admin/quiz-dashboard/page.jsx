'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const getBanglaLetter = (index) => {
  const letters = ['ক', 'খ', 'গ', 'ঘ'];
  return letters[index] || `অপশন ${index + 1}`;
};

export default function AdminQuizDashboardPage() {
  // Category Tree Data: { [mainCat]: { [subCat]: [topic1, topic2] } }
  const [categoryData, setCategoryData] = useState({});
  const [loadingCats, setLoadingCats] = useState(true);

  // Selected Category State
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newMainCatInput, setNewMainCatInput] = useState('');

  // Inline forms state in Category Tree
  const [inlineSubInput, setInlineSubInput] = useState({}); // { [mainCat]: string }
  const [inlineTopicInput, setInlineTopicInput] = useState({}); // { [`${mainCat}_${subCat}`]: string }
  const [renamingCat, setRenamingCat] = useState(null); // { type: 'main'|'sub'|'topic', main, sub, topic, value }

  // Expanded Tree Nodes
  const [expandedNodes, setExpandedNodes] = useState({}); // { [id]: boolean }

  // Reorder flags
  const [isCatReordered, setIsCatReordered] = useState(false);
  const [isQReordered, setIsQReordered] = useState(false);

  // Existing Questions State
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editFormData, setEditFormData] = useState({ q: '', options: ['', '', '', ''], ans: 0, explanation: '' });

  // Bulk CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Manual Quiz Builder MCQ Blocks
  const [manualMCQs, setManualMCQs] = useState([
    { id: 1, q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
  ]);
  const [submittingManual, setSubmittingManual] = useState(false);

  // Compute selected category path (e.g. "bcs/bangla/sahitto" or "বিসিএস/বাংলা/সাহিত্য")
  const getSelectedCategoryPath = () => {
    if (!selectedMainCat) return '';
    let path = selectedMainCat;
    if (selectedSubCat) path += `/${selectedSubCat}`;
    if (selectedTopic) path += `/${selectedTopic}`;
    return path;
  };

  const currentPath = getSelectedCategoryPath();

  // Load distinct categories from MongoDB
  const loadCategories = async () => {
    setLoadingCats(true);
    let initialCatData = {};

    try {
      const localSaved = localStorage.getItem('my_quiz_categories_backup');
      if (localSaved) {
        initialCatData = JSON.parse(localSaved);
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const rawCategories = data.categories || data.data || [];

      rawCategories.forEach((item) => {
        const parts = item.split(/[/>]/).map((p) => p.trim()).filter(Boolean);
        const main = parts[0];
        const sub = parts[1] || null;
        const topic = parts[2] || null;

        if (main) {
          if (!initialCatData[main]) initialCatData[main] = {};
          if (sub) {
            if (!initialCatData[main][sub]) initialCatData[main][sub] = [];
            if (topic && !initialCatData[main][sub].includes(topic)) {
              initialCatData[main][sub].push(topic);
            }
          }
        }
      });

      setCategoryData(initialCatData);

      // Auto-select first category if available
      const mainKeys = Object.keys(initialCatData);
      if (mainKeys.length > 0 && !selectedMainCat) {
        setSelectedMainCat(mainKeys[0]);
        const subKeys = Object.keys(initialCatData[mainKeys[0]] || {});
        if (subKeys.length > 0) {
          setSelectedSubCat(subKeys[0]);
          const topics = initialCatData[mainKeys[0]][subKeys[0]] || [];
          if (topics.length > 0) {
            setSelectedTopic(topics[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategoryData(initialCatData);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Save Category State locally & update state
  const saveCategoryState = (newData) => {
    setCategoryData(newData);
    try {
      localStorage.setItem('my_quiz_categories_backup', JSON.stringify(newData));
    } catch (e) {}
  };

  // Load questions whenever category path changes
  const loadExistingQuestions = async (catPath) => {
    if (!catPath) {
      setLoadedQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch(`/api/questions?category=${encodeURIComponent(catPath)}&limit=150`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data.questions || data.mcqs || [];
      setLoadedQuestions(list);
      setIsQReordered(false);
    } catch (err) {
      console.error('Error loading questions:', err);
      setLoadedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (currentPath) {
      loadExistingQuestions(currentPath);
    } else {
      setLoadedQuestions([]);
    }
  }, [currentPath]);

  // Main Category changes
  const handleMainCatChange = (main) => {
    setSelectedMainCat(main);
    const subKeys = Object.keys(categoryData[main] || {});
    if (subKeys.length > 0) {
      setSelectedSubCat(subKeys[0]);
      const topics = categoryData[main][subKeys[0]] || [];
      setSelectedTopic(topics.length > 0 ? topics[0] : '');
    } else {
      setSelectedSubCat('');
      setSelectedTopic('');
    }
  };

  // Sub Category changes
  const handleSubCatChange = (sub) => {
    setSelectedSubCat(sub);
    const topics = categoryData[selectedMainCat]?.[sub] || [];
    setSelectedTopic(topics.length > 0 ? topics[0] : '');
  };

  // Category Tree Add & Delete operations
  const handleAddMainCategory = (e) => {
    e.preventDefault();
    const name = newMainCatInput.trim();
    if (!name) {
      showTopAlert('ক্যাটাগরির নাম দেওয়া আবশ্যক!', 'warning');
      return;
    }
    if (categoryData[name]) {
      showTopAlert('এই নামের ক্যাটাগরি ইতিমধ্যে রয়েছে!', 'warning');
      return;
    }
    const updated = { ...categoryData, [name]: {} };
    saveCategoryState(updated);
    setNewMainCatInput('');
    setSelectedMainCat(name);
    showTopAlert(`✅ ক্যাটাগরি '${name}' সফলভাবে যুক্ত হয়েছে!`, 'success');
  };

  const handleAddSubCategory = (main) => {
    const name = (inlineSubInput[main] || '').trim();
    if (!name) return;
    if (categoryData[main]?.[name]) {
      showTopAlert('এই সাব-ক্যাটাগরি ইতিমধ্যে রয়েছে!', 'warning');
      return;
    }
    const updated = {
      ...categoryData,
      [main]: { ...(categoryData[main] || {}), [name]: [] }
    };
    saveCategoryState(updated);
    setInlineSubInput({ ...inlineSubInput, [main]: '' });
    setExpandedNodes({ ...expandedNodes, [`main_${main}`]: true });
    showTopAlert(`✅ সাব-ক্যাটাগরি '${name}' যুক্ত হয়েছে!`, 'success');
  };

  const handleAddTopic = (main, sub) => {
    const key = `${main}_${sub}`;
    const name = (inlineTopicInput[key] || '').trim();
    if (!name) return;
    const currentTopics = categoryData[main]?.[sub] || [];
    if (currentTopics.includes(name)) {
      showTopAlert('এই টপিক ইতিমধ্যে রয়েছে!', 'warning');
      return;
    }
    const updated = {
      ...categoryData,
      [main]: {
        ...categoryData[main],
        [sub]: [...currentTopics, name]
      }
    };
    saveCategoryState(updated);
    setInlineTopicInput({ ...inlineTopicInput, [key]: '' });
    setExpandedNodes({ ...expandedNodes, [`sub_${main}_${sub}`]: true });
    showTopAlert(`✅ টপিক '${name}' যুক্ত হয়েছে!`, 'success');
  };

  // Rename Actions
  const handleSaveRename = () => {
    if (!renamingCat) return;
    const { type, main, sub, topic, value } = renamingCat;
    const newVal = value.trim();
    if (!newVal) {
      setRenamingCat(null);
      return;
    }

    const updated = { ...categoryData };

    if (type === 'main' && newVal !== main) {
      updated[newVal] = updated[main] || {};
      delete updated[main];
      if (selectedMainCat === main) setSelectedMainCat(newVal);
    } else if (type === 'sub' && newVal !== sub) {
      updated[main][newVal] = updated[main][sub] || [];
      delete updated[main][sub];
      if (selectedSubCat === sub) setSelectedSubCat(newVal);
    } else if (type === 'topic' && newVal !== topic) {
      const idx = updated[main][sub].indexOf(topic);
      if (idx !== -1) updated[main][sub][idx] = newVal;
      if (selectedTopic === topic) setSelectedTopic(newVal);
    }

    saveCategoryState(updated);
    setRenamingCat(null);
    showTopAlert('✅ নাম সফলভাবে পরিবর্তন হয়েছে!', 'success');
  };

  // Delete Category / Sub / Topic
  const handleDeleteCategory = async (main) => {
    if (!window.confirm(`আপনি কি '${main}' ক্যাটাগরি এবং এর সমস্ত প্রশ্ন মুছে ফেলতে চান?`)) return;
    const updated = { ...categoryData };
    delete updated[main];
    saveCategoryState(updated);

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      await fetch(`/api/questions?category=${encodeURIComponent(main)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showTopAlert(`✅ ক্যাটাগরি '${main}' মুছে ফেলা হয়েছে!`, 'success');
      loadCategories();
    } catch (e) {}
  };

  const handleDeleteSubCategory = async (main, sub) => {
    if (!window.confirm(`আপনি কি '${sub}' সাব-ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    const updated = { ...categoryData };
    delete updated[main][sub];
    saveCategoryState(updated);

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      await fetch(`/api/questions?category=${encodeURIComponent(main + '/' + sub)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showTopAlert(`✅ সাব-ক্যাটাগরি '${sub}' মুছে ফেলা হয়েছে!`, 'success');
      loadCategories();
    } catch (e) {}
  };

  const handleDeleteTopic = async (main, sub, topic) => {
    if (!window.confirm(`আপনি কি '${topic}' টপিক মুছে ফেলতে চান?`)) return;
    const updated = { ...categoryData };
    updated[main][sub] = (updated[main][sub] || []).filter((t) => t !== topic);
    saveCategoryState(updated);

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      await fetch(`/api/questions?category=${encodeURIComponent(main + '/' + sub + '/' + topic)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showTopAlert(`✅ টপিক '${topic}' মুছে ফেলা হয়েছে!`, 'success');
      loadCategories();
    } catch (e) {}
  };

  // Reorder Category Items (Up / Down)
  const moveMainCat = (index, dir) => {
    const keys = Object.keys(categoryData);
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === keys.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const temp = keys[index];
    keys[index] = keys[targetIdx];
    keys[targetIdx] = temp;

    const newObj = {};
    keys.forEach((k) => {
      newObj[k] = categoryData[k];
    });
    saveCategoryState(newObj);
    setIsCatReordered(true);
  };

  const moveSubCat = (main, index, dir) => {
    const subs = Object.keys(categoryData[main] || {});
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === subs.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const temp = subs[index];
    subs[index] = subs[targetIdx];
    subs[targetIdx] = temp;

    const newSubs = {};
    subs.forEach((s) => {
      newSubs[s] = categoryData[main][s];
    });
    const updated = { ...categoryData, [main]: newSubs };
    saveCategoryState(updated);
    setIsCatReordered(true);
  };

  const moveTopic = (main, sub, index, dir) => {
    const topics = [...(categoryData[main]?.[sub] || [])];
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === topics.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const temp = topics[index];
    topics[index] = topics[targetIdx];
    topics[targetIdx] = temp;

    const updated = {
      ...categoryData,
      [main]: { ...categoryData[main], [sub]: topics }
    };
    saveCategoryState(updated);
    setIsCatReordered(true);
  };

  // Question Actions: Inline Edit & Delete
  const handleStartEdit = (q) => {
    setEditingQuestionId(q._id);
    setEditFormData({
      q: q.q,
      options: [...q.options],
      ans: q.ans || 0,
      explanation: q.explanation || ''
    });
  };

  const handleSaveEdit = async (id) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editFormData,
          category: currentPath
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ প্রশ্ন সফলভাবে আপডেট হয়েছে!', 'success');
        setEditingQuestionId(null);
        loadExistingQuestions(currentPath);
      } else {
        showTopAlert('❌ ' + (data.message || 'প্রশ্ন আপডেট করতে ব্যর্থ হয়েছে'), 'danger');
      }
    } catch (err) {
      showTopAlert('Error updating question', 'danger');
    }
  };

  const handleDeleteSingleQuestion = async (id) => {
    if (!window.confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে!', 'success');
        loadExistingQuestions(currentPath);
      } else {
        showTopAlert('❌ প্রশ্ন মুছতে ব্যর্থ হয়েছে', 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting question', 'danger');
    }
  };

  const handleDeleteAllInTopic = async () => {
    if (!currentPath || loadedQuestions.length === 0) return;
    if (!window.confirm(`আপনি কি '${currentPath}' এর সমস্ত (${loadedQuestions.length}টি) প্রশ্ন মুছে ফেলতে চান?`)) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/questions?category=${encodeURIComponent(currentPath)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ '${currentPath}' এর সকল প্রশ্ন মুছে ফেলা হয়েছে!`, 'success');
        loadExistingQuestions(currentPath);
      } else {
        showTopAlert('❌ মুছতে ব্যর্থ হয়েছে', 'danger');
      }
    } catch (err) {
      showTopAlert('Error connecting to server', 'danger');
    }
  };

  // Move Question position (Up/Down)
  const moveQuestionPosition = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === loadedQuestions.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...loadedQuestions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLoadedQuestions(updated);
    setIsQReordered(true);
  };

  // CSV Upload
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!currentPath) {
      showTopAlert('দয়া করে প্রথমে টার্গেট ক্যাটাগরি সিলেক্ট করুন!', 'warning');
      return;
    }
    if (!csvFile) {
      showTopAlert('একটি CSV ফাইল সিলেক্ট করুন!', 'warning');
      return;
    }

    setUploadingCsv(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('category', currentPath);

    try {
      const res = await fetch('/api/questions/upload-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showTopAlert(`🎉 সফলভাবে ${result.count}টি প্রশ্ন '${currentPath}'-এ যুক্ত হয়েছে!`, 'success');
        setCsvFile(null);
        document.getElementById('csvFileInput').value = '';
        loadCategories();
        loadExistingQuestions(currentPath);
      } else {
        showTopAlert(`❌ এরর: ${result.message || result.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('CSV ফাইল আপলোড করতে সমস্যা হয়েছে!', 'danger');
    } finally {
      setUploadingCsv(false);
    }
  };

  // Manual Quiz Builder: Add block, remove block, submit all
  const addManualMCQBlock = () => {
    setManualMCQs([
      ...manualMCQs,
      { id: Date.now(), q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
    ]);
  };

  const removeManualMCQBlock = (id) => {
    setManualMCQs(manualMCQs.filter((m) => m.id !== id));
  };

  const handleManualMCQChange = (index, field, value) => {
    const updated = [...manualMCQs];
    updated[index][field] = value;
    setManualMCQs(updated);
  };

  const handleManualOptionChange = (qIndex, optIndex, value) => {
    const updated = [...manualMCQs];
    updated[qIndex].options[optIndex] = value;
    setManualMCQs(updated);
  };

  const handleSubmitManualQuiz = async (e) => {
    e.preventDefault();
    if (!currentPath) {
      showTopAlert('দয়া করে প্রথমে টার্গেট ক্যাটাগরি সিলেক্ট করুন!', 'warning');
      return;
    }

    setSubmittingManual(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const formattedPayload = manualMCQs.map((item) => ({
      q: item.q.trim(),
      options: item.options.map((o) => o.trim()),
      ans: parseInt(item.ans, 10),
      explanation: item.explanation.trim(),
      category: currentPath
    }));

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formattedPayload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showTopAlert(`🎉 সফলভাবে ${formattedPayload.length}টি প্রশ্ন '${currentPath}'-এ সংরক্ষিত হয়েছে!`, 'success');
        setManualMCQs([{ id: Date.now(), q: '', options: ['', '', '', ''], ans: 0, explanation: '' }]);
        loadCategories();
        loadExistingQuestions(currentPath);
      } else {
        showTopAlert(`❌ সেভ করতে ব্যর্থ: ${result.message || result.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        :root {
          --primary: #007bff;
          --primary-dark: #0056b3;
          --secondary: #17a2b8;
          --warning: #ff9f43;
          --danger: #dc3545;
          --dark: #2c3e50;
          --light: #f4f7f6;
          --main-dash-btn: #28a745;
        }

        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        h2,
        h3 {
          color: #1e293b;
          margin-top: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 14px;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 6px;
          color: #475569;
          font-size: 13.5px;
        }
        input,
        select,
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
        select:focus,
        textarea:focus {
          border-color: var(--primary);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }
        .ans-explanation-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 15px;
          margin-bottom: 10px;
        }
        .cat-select-row {
          display: flex;
          gap: 15px;
          max-width: 900px;
          flex-wrap: wrap;
        }
        .cat-select-row .form-group {
          flex: 1;
          min-width: 220px;
          margin-bottom: 0;
        }

        .mcq-block {
          background: #ffffff;
          padding: 20px 25px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          border-left: 6px solid #007bff;
          margin-bottom: 20px;
          position: relative;
        }
        .mcq-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #007bff;
        }

        .btn {
          padding: 9px 16px;
          border: none;
          border-radius: 5px;
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
        .btn-add {
          background-color: #007bff;
          color: white;
          width: 100%;
          justify-content: center;
          margin-bottom: 15px;
        }
        .btn-submit {
          background-color: #28a745;
          color: white;
          width: 100%;
          font-size: 15px;
          padding: 11px;
          justify-content: center;
        }
        .btn-csv {
          background-color: #17a2b8;
          color: white;
          width: 100%;
          font-size: 15px;
          padding: 11px;
          margin-top: 10px;
          justify-content: center;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn-success {
          background-color: #28a745;
          color: white;
        }

        /* Tree List */
        .tree-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .tree-node {
          margin-bottom: 8px;
        }
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
        }
        .cat-header:hover {
          background: #f1f5f9;
        }
        .cat-title {
          font-weight: bold;
          color: #1e293b;
          font-size: 14.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-grow: 1;
        }
        .cat-actions {
          display: flex;
          gap: 6px;
        }

        .sub-tree-list {
          list-style: none;
          padding-left: 25px;
          margin-top: 6px;
        }
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 8px 12px;
          border-radius: 5px;
          margin-bottom: 5px;
          border: 1px dashed #cbd5e1;
          border-left: 3px solid #17a2b8;
          cursor: pointer;
        }
        .topic-tree-list {
          list-style: none;
          padding-left: 25px;
          margin-top: 4px;
        }
        .topic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
          padding: 6px 12px;
          border-radius: 4px;
          margin-bottom: 4px;
          border: 1px solid #eee;
          border-left: 3px solid #28a745;
        }
        .inline-add-box {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          background: #eef6ff;
          border-radius: 5px;
          margin: 6px 0 8px 0;
          border: 1px solid #b6d4fe;
        }
        .edit-input {
          padding: 4px 8px;
          font-size: 13px;
          border: 1px solid #007bff;
          border-radius: 4px;
          width: auto;
          max-width: 220px;
        }
        .topic-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .q-card {
          background: #fdfdfd;
          border: 1px solid #ddd;
          padding: 18px 20px;
          border-radius: 8px;
          margin-bottom: 14px;
          border-left: 5px solid #ffc107;
        }
        .q-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }

        .arrow-btn-group {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 8px;
        }
        .btn-arrow {
          background: #e2e8f0;
          border: none;
          color: #475569;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 9px;
          cursor: pointer;
          line-height: 1;
        }
        .btn-arrow:hover {
          background: #007bff;
          color: white;
        }

        @media (max-width: 900px) {
          .options-grid {
            grid-template-columns: 1fr 1fr;
          }
          .ans-explanation-row {
            grid-template-columns: 1fr;
          }
          .cat-select-row {
            flex-direction: column;
            max-width: 100%;
          }
        }
      `}</style>

      {/* 1. CATEGORY MANAGER TREE */}
      <div className="box" style={{ borderLeft: '6px solid var(--primary, #007bff)' }}>
        <h2>
          <i className="fa-solid fa-folder-tree" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
          ক্যাটাগরি ও টপিক ম্যানেজার (Category Tree Builder)
        </h2>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>
          নতুন ক্যাটাগরি, সাব-ক্যাটাগরি বা টপিক যোগ করুন এবং ড্রপডাউন থেকে সাজিয়ে নিন।
        </p>

        {/* Add Main Category Input */}
        <form onSubmit={handleAddMainCategory} style={{ display: 'flex', gap: '10px', maxWidth: '550px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="নতুন মূল ক্যাটাগরি (যেমন: বিসিএস প্রস্তুতি)"
            value={newMainCatInput}
            onChange={(e) => setNewMainCatInput(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success" style={{ whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-plus"></i> ক্যাটাগরি যোগ করুন
          </button>
        </form>

        {/* Categories Tree View */}
        <ul className="tree-list">
          {loadingCats ? (
            <li style={{ color: '#64748b', padding: '10px' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> ক্যাটাগরি লোড হচ্ছে...
            </li>
          ) : Object.keys(categoryData).length === 0 ? (
            <li style={{ color: '#64748b', padding: '10px' }}>কোনো ক্যাটাগরি পাওয়া যায়নি। উপরে একটি তৈরি করুন!</li>
          ) : (
            Object.keys(categoryData).map((main, mIdx) => {
              const subCats = Object.keys(categoryData[main] || {});
              const isExpanded = expandedNodes[`main_${main}`];

              return (
                <li key={main} className="tree-node">
                  <div
                    className="cat-header"
                    onClick={() =>
                      setExpandedNodes({ ...expandedNodes, [`main_${main}`]: !isExpanded })
                    }
                  >
                    <span className="cat-title">
                      <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="btn-arrow" onClick={() => moveMainCat(mIdx, 'up')}>
                          ▲
                        </button>
                        <button type="button" className="btn-arrow" onClick={() => moveMainCat(mIdx, 'down')}>
                          ▼
                        </button>
                      </div>
                      <i className={`fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`} style={{ color: '#007bff' }}></i>
                      {renamingCat?.type === 'main' && renamingCat.main === main ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={renamingCat.value}
                          onChange={(e) => setRenamingCat({ ...renamingCat, value: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span>
                          <b>{main}</b>{' '}
                          <small style={{ color: '#64748b', fontWeight: 'normal' }}>
                            ({subCats.length} সাব-ক্যাটাগরি)
                          </small>
                        </span>
                      )}
                    </span>

                    <div className="cat-actions" onClick={(e) => e.stopPropagation()}>
                      {renamingCat?.type === 'main' && renamingCat.main === main ? (
                        <>
                          <button className="btn btn-success btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={handleSaveRename}>
                            💾 Save
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => setRenamingCat(null)}>
                            ❌ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() =>
                              setExpandedNodes({ ...expandedNodes, [`main_${main}`]: true, [`inline_sub_${main}`]: true })
                            }
                          >
                            + Sub-Cat
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => setRenamingCat({ type: 'main', main, value: main })}
                          >
                            ✏️ Rename
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleDeleteCategory(main)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline Add Sub-Category Input */}
                  {expandedNodes[`inline_sub_${main}`] && (
                    <div className="inline-add-box" style={{ marginLeft: '25px' }}>
                      <input
                        type="text"
                        placeholder="নতুন সাব-ক্যাটাগরির নাম (যেমন: বাংলা সাহিত্য)"
                        value={inlineSubInput[main] || ''}
                        onChange={(e) => setInlineSubInput({ ...inlineSubInput, [main]: e.target.value })}
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                        autoFocus
                      />
                      <button className="btn btn-success btn-sm" onClick={() => handleAddSubCategory(main)}>
                        💾 Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setExpandedNodes({ ...expandedNodes, [`inline_sub_${main}`]: false })}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}

                  {/* Sub Categories List */}
                  {isExpanded && (
                    <ul className="sub-tree-list">
                      {subCats.length === 0 ? (
                        <li style={{ color: '#94a3b8', fontSize: '12.5px', padding: '6px 0' }}>কোনো সাব-ক্যাটাগরি নেই।</li>
                      ) : (
                        subCats.map((sub, sIdx) => {
                          const topics = categoryData[main][sub] || [];
                          const isSubExpanded = expandedNodes[`sub_${main}_${sub}`];

                          return (
                            <li key={sub} className="tree-node">
                              <div
                                className="sub-header"
                                onClick={() =>
                                  setExpandedNodes({
                                    ...expandedNodes,
                                    [`sub_${main}_${sub}`]: !isSubExpanded
                                  })
                                }
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" className="btn-arrow" onClick={() => moveSubCat(main, sIdx, 'up')}>
                                      ▲
                                    </button>
                                    <button type="button" className="btn-arrow" onClick={() => moveSubCat(main, sIdx, 'down')}>
                                      ▼
                                    </button>
                                  </div>
                                  <i className="fa-solid fa-folder" style={{ color: '#17a2b8' }}></i>
                                  {renamingCat?.type === 'sub' && renamingCat.main === main && renamingCat.sub === sub ? (
                                    <input
                                      type="text"
                                      className="edit-input"
                                      value={renamingCat.value}
                                      onChange={(e) => setRenamingCat({ ...renamingCat, value: e.target.value })}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                    />
                                  ) : (
                                    <span>
                                      <b>{sub}</b>{' '}
                                      <small style={{ color: '#64748b' }}>({topics.length} টপিক)</small>
                                    </span>
                                  )}
                                </span>

                                <div className="cat-actions" onClick={(e) => e.stopPropagation()}>
                                  {renamingCat?.type === 'sub' && renamingCat.main === main && renamingCat.sub === sub ? (
                                    <>
                                      <button className="btn btn-success btn-sm" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={handleSaveRename}>
                                        💾 Save
                                      </button>
                                      <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={() => setRenamingCat(null)}>
                                        ❌ Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() =>
                                          setExpandedNodes({
                                            ...expandedNodes,
                                            [`sub_${main}_${sub}`]: true,
                                            [`inline_topic_${main}_${sub}`]: true
                                          })
                                        }
                                      >
                                        + Topic
                                      </button>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => setRenamingCat({ type: 'sub', main, sub, value: sub })}
                                      >
                                        ✏️ Rename
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => handleDeleteSubCategory(main, sub)}
                                      >
                                        🗑️ Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Inline Add Topic Input */}
                              {expandedNodes[`inline_topic_${main}_${sub}`] && (
                                <div className="inline-add-box" style={{ marginLeft: '25px' }}>
                                  <input
                                    type="text"
                                    placeholder="নতুন টপিকের নাম (যেমন: প্রাচীন ও মধ্যযুগ)"
                                    value={inlineTopicInput[`${main}_${sub}`] || ''}
                                    onChange={(e) =>
                                      setInlineTopicInput({
                                        ...inlineTopicInput,
                                        [`${main}_${sub}`]: e.target.value
                                      })
                                    }
                                    style={{ padding: '6px 10px', fontSize: '13px' }}
                                    autoFocus
                                  />
                                  <button className="btn btn-success btn-sm" onClick={() => handleAddTopic(main, sub)}>
                                    💾 Save
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                      setExpandedNodes({
                                        ...expandedNodes,
                                        [`inline_topic_${main}_${sub}`]: false
                                      })
                                    }
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              )}

                              {/* Topics List */}
                              {isSubExpanded && (
                                <ul className="topic-tree-list">
                                  {topics.length === 0 ? (
                                    <li style={{ color: '#94a3b8', fontSize: '12px', padding: '4px 0' }}>কোনো টপিক নেই।</li>
                                  ) : (
                                    topics.map((topic, tIdx) => (
                                      <li key={topic} className="topic-item">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <div className="arrow-btn-group">
                                            <button type="button" className="btn-arrow" onClick={() => moveTopic(main, sub, tIdx, 'up')}>
                                              ▲
                                            </button>
                                            <button type="button" className="btn-arrow" onClick={() => moveTopic(main, sub, tIdx, 'down')}>
                                              ▼
                                            </button>
                                          </div>
                                          <i className="fa-solid fa-thumbtack" style={{ color: '#28a745', fontSize: '12px' }}></i>
                                          {renamingCat?.type === 'topic' &&
                                          renamingCat.main === main &&
                                          renamingCat.sub === sub &&
                                          renamingCat.topic === topic ? (
                                            <input
                                              type="text"
                                              className="edit-input"
                                              value={renamingCat.value}
                                              onChange={(e) => setRenamingCat({ ...renamingCat, value: e.target.value })}
                                              autoFocus
                                            />
                                          ) : (
                                            <b>{topic}</b>
                                          )}
                                        </span>

                                        <div className="cat-actions">
                                          {renamingCat?.type === 'topic' &&
                                          renamingCat.main === main &&
                                          renamingCat.sub === sub &&
                                          renamingCat.topic === topic ? (
                                            <>
                                              <button className="btn btn-success btn-sm" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={handleSaveRename}>
                                                💾 Save
                                              </button>
                                              <button className="btn btn-secondary btn-sm" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => setRenamingCat(null)}>
                                                ❌ Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                className="btn btn-warning btn-sm"
                                                style={{ padding: '1px 6px', fontSize: '10px' }}
                                                onClick={() => setRenamingCat({ type: 'topic', main, sub, topic, value: topic })}
                                              >
                                                ✏️ Rename
                                              </button>
                                              <button
                                                className="btn btn-danger btn-sm"
                                                style={{ padding: '1px 6px', fontSize: '10px' }}
                                                onClick={() => handleDeleteTopic(main, sub, topic)}
                                              >
                                                🗑️ Delete
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </li>
                                    ))
                                  )}
                                </ul>
                              )}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* 2. CASCADING CATEGORY SELECTOR */}
      <div className="box" style={{ borderLeft: '6px solid var(--secondary, #17a2b8)' }}>
        <h2>
          <i className="fa-solid fa-filter" style={{ color: 'var(--secondary)', marginRight: '8px' }}></i>
          টার্গেট ক্যাটাগরি ও প্রশ্ন ব্যাংক ফিল্টার
        </h2>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>
          নিচে ক্যাটাগরি সিলেক্ট করলে স্বয়ংক্রিয়ভাবে সেই টপিকের প্রশ্নসমূহ নিচে লোড হবে এবং নতুন প্রশ্ন সেখানে যুক্ত হবে।
        </p>

        <div className="cat-select-row">
          <div className="form-group">
            <label>মূল ক্যাটাগরি (Main Category):</label>
            <select value={selectedMainCat} onChange={(e) => handleMainCatChange(e.target.value)}>
              {Object.keys(categoryData).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>সাব-ক্যাটাগরি (Sub-Category):</label>
            <select
              value={selectedSubCat}
              onChange={(e) => handleSubCatChange(e.target.value)}
              disabled={!selectedMainCat || Object.keys(categoryData[selectedMainCat] || {}).length === 0}
            >
              {selectedMainCat &&
                Object.keys(categoryData[selectedMainCat] || {}).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>টপিক (Topic):</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubCat || (categoryData[selectedMainCat]?.[selectedSubCat] || []).length === 0}
            >
              {selectedSubCat &&
                (categoryData[selectedMainCat]?.[selectedSubCat] || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {currentPath && (
          <div style={{ marginTop: '12px', fontSize: '13.5px', color: '#0f766e', fontWeight: 'bold' }}>
            📌 নির্বাচিত পাথ: <code>{currentPath}</code>
          </div>
        )}
      </div>

      {/* 3. MANAGE EXISTING QUESTIONS */}
      <div className="box" style={{ borderLeft: '6px solid #ffc107' }}>
        <div className="topic-header-bar">
          <div>
            <h2 style={{ margin: 0 }}>
              <i className="fa-solid fa-list-check" style={{ color: '#ffc107', marginRight: '8px' }}></i>
              বিদ্যমান প্রশ্ন ব্যাংক পরিচালনা (Edit / Delete Questions)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              নির্বাচিত টপিক: <b>{currentPath || 'কোনো ক্যাটাগরি সিলেক্ট করা হয়নি'}</b> (মোট{' '}
              <span style={{ color: '#007bff', fontWeight: 'bold' }}>{loadedQuestions.length}</span>টি প্রশ্ন)
            </p>
          </div>

          {loadedQuestions.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteAllInTopic}>
              <i className="fa-solid fa-trash"></i> সমস্ত প্রশ্ন মুছে ফেলুন ({loadedQuestions.length})
            </button>
          )}
        </div>

        {loadingQuestions ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i> প্রশ্ন লোড হচ্ছে...
          </div>
        ) : loadedQuestions.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>
            এই টপিকের অধীনে কোনো প্রশ্ন পাওয়া যায়নি। নিচে নতুন প্রশ্ন যোগ করুন।
          </p>
        ) : (
          <div>
            {loadedQuestions.map((q, index) => (
              <div key={q._id} className="q-card" style={{ background: editingQuestionId === q._id ? '#ffffff' : '#fdfdfd' }}>
                {editingQuestionId === q._id ? (
                  /* INLINE EDIT FORM */
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: '10px', fontSize: '15px' }}>
                      MCQ #{index + 1} এডিট করুন
                    </div>
                    <div className="form-group">
                      <label>প্রশ্ন:</label>
                      <input
                        type="text"
                        value={editFormData.q}
                        onChange={(e) => setEditFormData({ ...editFormData, q: e.target.value })}
                        required
                      />
                    </div>
                    <label>অপশনসমূহ (৪টি বিকল্প):</label>
                    <div className="options-grid">
                      {editFormData.options.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...editFormData.options];
                            newOpts[oIdx] = e.target.value;
                            setEditFormData({ ...editFormData, options: newOpts });
                          }}
                          placeholder={`অপশন (${getBanglaLetter(oIdx)})`}
                          required
                        />
                      ))}
                    </div>
                    <div className="ans-explanation-row">
                      <div className="form-group">
                        <label>সঠিক উত্তর:</label>
                        <select
                          value={editFormData.ans}
                          onChange={(e) => setEditFormData({ ...editFormData, ans: parseInt(e.target.value, 10) })}
                        >
                          <option value="0">অপশন (ক)</option>
                          <option value="1">অপশন (খ)</option>
                          <option value="2">অপশন (গ)</option>
                          <option value="3">অপশন (ঘ)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>ব্যাখ্যা (ঐচ্ছিক):</label>
                        <input
                          type="text"
                          value={editFormData.explanation}
                          onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                          placeholder="উত্তরের বিস্তারিত ব্যাখ্যা..."
                        />
                      </div>
                    </div>
                    <div className="q-actions">
                      <button className="btn btn-success" onClick={() => handleSaveEdit(q._id)}>
                        💾 সংরক্ষণ করুন
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingQuestionId(null)}>
                        ❌ বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  /* READ VIEW */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="arrow-btn-group">
                          <button type="button" className="btn-arrow" onClick={() => moveQuestionPosition(index, 'up')}>
                            ▲
                          </button>
                          <button type="button" className="btn-arrow" onClick={() => moveQuestionPosition(index, 'down')}>
                            ▼
                          </button>
                        </div>
                        <strong style={{ color: '#1e293b' }}>Q{index + 1}:</strong> &nbsp;
                        <span style={{ fontSize: '15px', color: '#1e293b' }}>{q.q}</span>
                      </span>
                    </div>

                    <div style={{ color: '#475569', fontSize: '13.5px', marginTop: '8px', lineHeight: '1.6' }}>
                      <b>বিকল্পসমূহ:</b> (ক) {q.options[0]} | (খ) {q.options[1]} | (গ) {q.options[2]} | (ঘ) {q.options[3]}
                      <span style={{ color: '#16a34a', marginLeft: '12px', fontWeight: 'bold' }}>
                        [ সঠিক উত্তর: ({getBanglaLetter(q.ans)}) ]
                      </span>
                    </div>

                    {q.explanation && (
                      <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                        <b>ব্যাখ্যা:</b> {q.explanation}
                      </div>
                    )}

                    <div className="q-actions">
                      <button className="btn btn-warning btn-sm" onClick={() => handleStartEdit(q)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSingleQuestion(q._id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. BULK CSV UPLOADER */}
      <div className="box" style={{ borderLeft: '6px solid var(--secondary, #17a2b8)' }}>
        <h2>
          <i className="fa-solid fa-file-csv" style={{ color: 'var(--secondary)', marginRight: '8px' }}></i>
          CSV / Excel ফাইল আপলোড করে এক ক্লিকে প্রশ্ন যুক্ত করুন
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          CSV ফাইলে অবশ্যই নিচের হেডার কলামগুলো থাকতে হবে: <code>question</code>, <code>opt0</code>, <code>opt1</code>,{' '}
          <code>opt2</code>, <code>opt3</code>, <code>ans</code>, <code>explanation</code>
        </p>

        <form onSubmit={handleCsvUpload}>
          <div className="form-group">
            <label>CSV ফাইল নির্বাচন করুন:</label>
            <input
              type="file"
              id="csvFileInput"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0] || null)}
              required
            />
          </div>
          <button type="submit" className="btn btn-csv" disabled={uploadingCsv}>
            <i className="fa-solid fa-cloud-arrow-up"></i> {uploadingCsv ? 'আপলোড হচ্ছে...' : '📁 Upload CSV File'}
          </button>
        </form>
      </div>

      {/* 5. MANUAL QUIZ BUILDER */}
      <div className="box" style={{ borderLeft: '6px solid #28a745' }}>
        <h2>
          <i className="fa-solid fa-pen-nib" style={{ color: '#28a745', marginRight: '8px' }}></i>
          ম্যানুয়াল কুইজ বিল্ডার (Manual Quiz Builder)
        </h2>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>
          একের পর এক প্রশ্ন লিখে এক ক্লিকে সরাসরি MongoDB ডাটাবেজে সংরক্ষণ করুন।
        </p>

        <form onSubmit={handleSubmitManualQuiz}>
          {manualMCQs.map((mcq, index) => (
            <div key={mcq.id} className="mcq-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="mcq-title" style={{ margin: 0 }}>
                  MCQ #{index + 1}
                </div>
                {manualMCQs.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeManualMCQBlock(mcq.id)}
                  >
                    <i className="fa-solid fa-trash"></i> Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>প্রশ্ন:</label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?"
                  value={mcq.q}
                  onChange={(e) => handleManualMCQChange(index, 'q', e.target.value)}
                  required
                />
              </div>

              <label>বিকল্পসমূহ (৪টি উত্তর):</label>
              <div className="options-grid">
                <input
                  type="text"
                  placeholder="অপশন (ক)"
                  value={mcq.options[0]}
                  onChange={(e) => handleManualOptionChange(index, 0, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (খ)"
                  value={mcq.options[1]}
                  onChange={(e) => handleManualOptionChange(index, 1, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (গ)"
                  value={mcq.options[2]}
                  onChange={(e) => handleManualOptionChange(index, 2, e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="অপশন (ঘ)"
                  value={mcq.options[3]}
                  onChange={(e) => handleManualOptionChange(index, 3, e.target.value)}
                  required
                />
              </div>

              <div className="ans-explanation-row">
                <div className="form-group">
                  <label>সঠিক উত্তর নির্বাচন করুন:</label>
                  <select
                    value={mcq.ans}
                    onChange={(e) => handleManualMCQChange(index, 'ans', e.target.value)}
                    required
                  >
                    <option value="0">অপশন (ক)</option>
                    <option value="1">অপশন (খ)</option>
                    <option value="2">অপশন (গ)</option>
                    <option value="3">অপশন (ঘ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ব্যাখ্যা (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="উত্তরের সঠিক ব্যাখ্যা প্রদান করুন..."
                    value={mcq.explanation}
                    onChange={(e) => handleManualMCQChange(index, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-add" onClick={addManualMCQBlock}>
            <i className="fa-solid fa-plus"></i> ➕ আরেকটি প্রশ্ন যোগ করুন
          </button>

          <button type="submit" className="btn btn-submit" disabled={submittingManual}>
            <i className="fa-solid fa-rocket"></i> {submittingManual ? 'সংরক্ষণ হচ্ছে...' : '🚀 সকল প্রশ্ন ডাটাবেজে সংরক্ষণ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
