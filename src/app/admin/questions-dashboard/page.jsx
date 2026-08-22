'use client';

import React, { useState, useEffect, useRef } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminQuestionsDashboardPage() {
  // Category Tree State
  const [categoryData, setCategoryData] = useState({});
  const [isCatReordered, setIsCatReordered] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // Expanded tree states: Set of expanded keys
  const [expandedTrees, setExpandedTrees] = useState({
    subLists: {}, // { [main]: boolean }
    topicLists: {} // { [`${main}-${sub}`]: boolean }
  });

  // Inline Category / Sub-Category / Topic Edit State
  const [editingCat, setEditingCat] = useState(null); // { type: 'main'|'sub'|'topic', main, sub, topic, value }
  const [inlineAddSub, setInlineAddSub] = useState(null); // { main, value }
  const [inlineAddTopic, setInlineAddTopic] = useState(null); // { main, sub, value }

  // Target Selection State
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Questions List State
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isQReordered, setIsQReordered] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState({
    q: '',
    options: ['', '', '', ''],
    ans: 0,
    explanation: ''
  });

  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const fileInputRef = useRef(null);

  // Manual MCQ Builder State
  const [manualMcqs, setManualMcqs] = useState([
    { id: 1, q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
  ]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Drag and Drop State
  const [dragItem, setDragItem] = useState(null); // { type: 'main-cat'|'sub-cat'|'topic'|'question', ... }
  const [dropIndicator, setDropIndicator] = useState(null); // { id, position: 'above'|'below' }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const getSelectedCategoryPath = () => {
    if (!selectedMainCat) return '';
    let path = selectedMainCat;
    if (selectedSubCat) path += `/${selectedSubCat}`;
    if (selectedTopic) path += `/${selectedTopic}`;
    return path;
  };

  const getBanglaLetter = (index) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    return letters[index] || index;
  };

  const toggleTree = (type, key) => {
    if (type === 'sub') {
      setExpandedTrees(prev => ({
        ...prev,
        subLists: { ...prev.subLists, [key]: !prev.subLists[key] }
      }));
    } else if (type === 'topic') {
      setExpandedTrees(prev => ({
        ...prev,
        topicLists: { ...prev.topicLists, [key]: !prev.topicLists[key] }
      }));
    }
  };

  // -------------------------------------------------------------
  // 1. Categories Management
  // -------------------------------------------------------------
  const saveCategoryState = (newData) => {
    setCategoryData(newData);
    try {
      localStorage.setItem('my_quiz_categories_backup', JSON.stringify(newData));
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    let catObj = {};
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem('my_quiz_categories_backup') : null;
    if (localSaved) {
      try {
        catObj = JSON.parse(localSaved);
      } catch (e) {
        catObj = {};
      }
    }

    try {
      const res = await fetch('/api/categories');
      const data = await res.json();

      let rawCategories = [];
      if (Array.isArray(data)) {
        rawCategories = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        rawCategories = data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        rawCategories = data.data;
      }

      rawCategories.forEach((item) => {
        if (!item || typeof item !== 'string') return;
        const parts = item.split('/');
        const main = parts[0]?.trim();
        const sub = parts[1]?.trim() || null;
        const topic = parts[2]?.trim() || null;

        if (main) {
          if (!catObj[main]) catObj[main] = {};
          if (sub) {
            if (!catObj[main][sub]) catObj[main][sub] = [];
            if (topic && !catObj[main][sub].includes(topic)) {
              catObj[main][sub].push(topic);
            }
          }
        }
      });

      setCategoryData({ ...catObj });
      setIsCatReordered(false);
      saveCategoryState(catObj);
    } catch (err) {
      console.error('Failed to load categories from API', err);
      setCategoryData({ ...catObj });
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Sync Dropdown Selections when categoryData changes
  useEffect(() => {
    const mainCats = Object.keys(categoryData);
    if (mainCats.length > 0) {
      if (!selectedMainCat || !categoryData[selectedMainCat]) {
        setSelectedMainCat(mainCats[0]);
      }
    } else {
      setSelectedMainCat('');
      setSelectedSubCat('');
      setSelectedTopic('');
    }
  }, [categoryData]);

  useEffect(() => {
    if (selectedMainCat && categoryData[selectedMainCat]) {
      const subCats = Object.keys(categoryData[selectedMainCat]);
      if (subCats.length > 0) {
        if (!selectedSubCat || !categoryData[selectedMainCat][selectedSubCat]) {
          setSelectedSubCat(subCats[0]);
        }
      } else {
        setSelectedSubCat('');
        setSelectedTopic('');
      }
    } else {
      setSelectedSubCat('');
      setSelectedTopic('');
    }
  }, [selectedMainCat, categoryData]);

  useEffect(() => {
    if (selectedMainCat && selectedSubCat && categoryData[selectedMainCat] && categoryData[selectedMainCat][selectedSubCat]) {
      const topics = categoryData[selectedMainCat][selectedSubCat];
      if (topics.length > 0) {
        if (!selectedTopic || !topics.includes(selectedTopic)) {
          setSelectedTopic(topics[0]);
        }
      } else {
        setSelectedTopic('');
      }
    } else {
      setSelectedTopic('');
    }
  }, [selectedSubCat, selectedMainCat, categoryData]);

  // Load questions when target topic/category changes
  useEffect(() => {
    const targetPath = getSelectedCategoryPath();
    if (targetPath) {
      loadExistingQuestions(targetPath);
    } else {
      setLoadedQuestions([]);
    }
  }, [selectedMainCat, selectedSubCat, selectedTopic]);

  const createCategory = () => {
    const catName = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!catName) {
      showTopAlert('Please enter a category name!', 'warning');
      return;
    }
    if (categoryData[catName]) {
      showTopAlert('Category already exists!', 'warning');
      return;
    }

    const updated = { ...categoryData, [catName]: {} };
    saveCategoryState(updated);
    setNewCatName('');
    showTopAlert(`Category '${catName}' added successfully!`, 'success');
  };

  const saveInlineAddSub = (main) => {
    if (!inlineAddSub || !inlineAddSub.value) return;
    const subName = inlineAddSub.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!subName) return;

    const mainObj = categoryData[main] || {};
    if (mainObj[subName]) {
      showTopAlert('Sub-category already exists!', 'warning');
      return;
    }

    const updated = {
      ...categoryData,
      [main]: {
        ...mainObj,
        [subName]: []
      }
    };
    saveCategoryState(updated);
    setInlineAddSub(null);
    setExpandedTrees(prev => ({ ...prev, subLists: { ...prev.subLists, [main]: true } }));
    showTopAlert(`Sub-category '${subName}' added!`, 'success');
  };

  const saveInlineAddTopic = (main, sub) => {
    if (!inlineAddTopic || !inlineAddTopic.value) return;
    const topic = inlineAddTopic.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!topic) return;

    const mainObj = categoryData[main] || {};
    const topics = mainObj[sub] || [];
    if (topics.includes(topic)) {
      showTopAlert('Topic already exists!', 'warning');
      return;
    }

    const updated = {
      ...categoryData,
      [main]: {
        ...mainObj,
        [sub]: [...topics, topic]
      }
    };
    saveCategoryState(updated);
    setInlineAddTopic(null);
    setExpandedTrees(prev => ({
      ...prev,
      subLists: { ...prev.subLists, [main]: true },
      topicLists: { ...prev.topicLists, [`${main}-${sub}`]: true }
    }));
    showTopAlert(`Topic '${topic}' added!`, 'success');
  };

  const saveCatRename = (oldCat) => {
    if (!editingCat || !editingCat.value) return;
    const newName = editingCat.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newName || newName === oldCat) {
      setEditingCat(null);
      return;
    }

    if (categoryData[newName]) {
      showTopAlert('Category name exists!', 'warning');
      return;
    }

    const updated = {};
    Object.keys(categoryData).forEach((k) => {
      if (k === oldCat) {
        updated[newName] = categoryData[oldCat];
      } else {
        updated[k] = categoryData[k];
      }
    });

    saveCategoryState(updated);
    setEditingCat(null);
  };

  const saveSubRename = (main, oldSub) => {
    if (!editingCat || !editingCat.value) return;
    const newSub = editingCat.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newSub || newSub === oldSub) {
      setEditingCat(null);
      return;
    }

    const mainObj = categoryData[main] || {};
    if (mainObj[newSub]) {
      showTopAlert('Sub-category name exists!', 'warning');
      return;
    }

    const updatedSubObj = {};
    Object.keys(mainObj).forEach((s) => {
      if (s === oldSub) {
        updatedSubObj[newSub] = mainObj[oldSub];
      } else {
        updatedSubObj[s] = mainObj[s];
      }
    });

    const updated = { ...categoryData, [main]: updatedSubObj };
    saveCategoryState(updated);
    setEditingCat(null);
  };

  const saveTopicRename = (main, sub, oldTopic) => {
    if (!editingCat || !editingCat.value) return;
    const newTopic = editingCat.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newTopic || newTopic === oldTopic) {
      setEditingCat(null);
      return;
    }

    const mainObj = categoryData[main] || {};
    const topics = [...(mainObj[sub] || [])];
    const idx = topics.indexOf(oldTopic);
    if (idx !== -1) {
      topics[idx] = newTopic;
    }

    const updated = {
      ...categoryData,
      [main]: {
        ...mainObj,
        [sub]: topics
      }
    };
    saveCategoryState(updated);
    setEditingCat(null);
  };

  const deleteCategory = async (catName) => {
    const confirmed = await showTopAlert(`Delete category '${catName}'?`, 'danger', true);
    if (!confirmed) return;

    const updated = { ...categoryData };
    delete updated[catName];
    saveCategoryState(updated);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      await fetch(`/api/categories?category=${encodeURIComponent(catName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubCategory = async (main, sub) => {
    const confirmed = await showTopAlert(`Delete sub-category '${sub}'?`, 'danger', true);
    if (!confirmed) return;

    const updatedSub = { ...categoryData[main] };
    delete updatedSub[sub];
    const updated = { ...categoryData, [main]: updatedSub };
    saveCategoryState(updated);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      await fetch(`/api/categories?category=${encodeURIComponent(main + '/' + sub)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTopic = async (main, sub, topic) => {
    const confirmed = await showTopAlert(`Delete topic '${topic}'?`, 'danger', true);
    if (!confirmed) return;

    const updatedTopics = (categoryData[main]?.[sub] || []).filter((t) => t !== topic);
    const updated = {
      ...categoryData,
      [main]: {
        ...categoryData[main],
        [sub]: updatedTopics
      }
    };
    saveCategoryState(updated);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      await fetch(`/api/categories?category=${encodeURIComponent(main + '/' + sub + '/' + topic)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const moveMainCatPosition = (mIdx, direction) => {
    const keys = Object.keys(categoryData);
    if ((direction === 'up' && mIdx > 0) || (direction === 'down' && mIdx < keys.length - 1)) {
      const targetIdx = direction === 'up' ? mIdx - 1 : mIdx + 1;
      const temp = keys[mIdx];
      keys[mIdx] = keys[targetIdx];
      keys[targetIdx] = temp;

      const newCatData = {};
      keys.forEach((k) => { newCatData[k] = categoryData[k]; });
      setCategoryData(newCatData);
      setIsCatReordered(true);
    }
  };

  const moveSubCatPosition = (main, sIdx, direction) => {
    const subCats = Object.keys(categoryData[main] || {});
    if ((direction === 'up' && sIdx > 0) || (direction === 'down' && sIdx < subCats.length - 1)) {
      const targetIdx = direction === 'up' ? sIdx - 1 : sIdx + 1;
      const temp = subCats[sIdx];
      subCats[sIdx] = subCats[targetIdx];
      subCats[targetIdx] = temp;

      const newSubData = {};
      subCats.forEach((s) => { newSubData[s] = categoryData[main][s]; });
      const updated = { ...categoryData, [main]: newSubData };
      setCategoryData(updated);
      setIsCatReordered(true);
    }
  };

  const moveTopicPosition = (main, sub, tIdx, direction) => {
    const topics = [...(categoryData[main]?.[sub] || [])];
    if ((direction === 'up' && tIdx > 0) || (direction === 'down' && tIdx < topics.length - 1)) {
      const targetIdx = direction === 'up' ? tIdx - 1 : tIdx + 1;
      const temp = topics[tIdx];
      topics[tIdx] = topics[targetIdx];
      topics[targetIdx] = temp;

      const updated = {
        ...categoryData,
        [main]: {
          ...categoryData[main],
          [sub]: topics
        }
      };
      setCategoryData(updated);
      setIsCatReordered(true);
    }
  };

  const saveCategoryReorder = () => {
    saveCategoryState(categoryData);
    setIsCatReordered(false);
    showTopAlert('✅ Category sequence saved successfully!', 'success');
  };

  const cancelCategoryReorder = () => {
    loadCategories();
  };

  // -------------------------------------------------------------
  // 2. Existing Questions Management
  // -------------------------------------------------------------
  const loadExistingQuestions = async (targetCategoryPath) => {
    if (!targetCategoryPath) {
      setLoadedQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token') || '';
      const res = await fetch(`/api/questions?category=${encodeURIComponent(targetCategoryPath)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data.mcqs && Array.isArray(data.mcqs)) {
        list = data.mcqs;
      } else if (data.questions && Array.isArray(data.questions)) {
        list = data.questions;
      }

      setLoadedQuestions(list);
      setIsQReordered(false);
    } catch (err) {
      console.error('Load Questions Error:', err);
      showTopAlert('Failed to load questions.', 'danger');
      setLoadedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const moveQuestionPosition = (qIdx, direction) => {
    if ((direction === 'up' && qIdx > 0) || (direction === 'down' && qIdx < loadedQuestions.length - 1)) {
      const targetIdx = direction === 'up' ? qIdx - 1 : qIdx + 1;
      const list = [...loadedQuestions];
      const temp = list[qIdx];
      list[qIdx] = list[targetIdx];
      list[targetIdx] = temp;

      setLoadedQuestions(list);
      setIsQReordered(true);
    }
  };

  const saveQuestionsReorder = () => {
    setIsQReordered(false);
    showTopAlert('✅ Questions order updated!', 'success');
  };

  const cancelQuestionsReorder = () => {
    loadExistingQuestions(getSelectedCategoryPath());
  };

  const startEditQuestion = (q, index) => {
    setEditingQuestionId(q._id);
    setEditQuestionForm({
      q: q.q || '',
      options: q.options ? [...q.options] : ['', '', '', ''],
      ans: q.ans !== undefined ? q.ans : 0,
      explanation: q.explanation || ''
    });
  };

  const saveInlineQuestionEdit = async (id) => {
    const category = getSelectedCategoryPath();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const updatedData = {
      q: editQuestionForm.q.trim(),
      options: editQuestionForm.options.map((o) => o.trim()),
      ans: parseInt(editQuestionForm.ans, 10),
      explanation: editQuestionForm.explanation.trim(),
      category: category
    };

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const result = await res.json();
      if (result.success) {
        showTopAlert('✅ Question updated successfully!', 'success');
        setEditingQuestionId(null);
        loadExistingQuestions(category);
      } else {
        showTopAlert('❌ Failed to update question!', 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Error updating question!', 'danger');
    }
  };

  const deleteSingleQuestion = async (id) => {
    const confirmed = await showTopAlert('Are you sure you want to delete this question?', 'danger', true);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showTopAlert('Question deleted successfully!', 'success');
      loadExistingQuestions(getSelectedCategoryPath());
    } catch (err) {
      showTopAlert('Error deleting question!', 'danger');
    }
  };

  const deleteAllQuestionsInTopic = async () => {
    const targetCategoryPath = getSelectedCategoryPath();
    if (!targetCategoryPath || loadedQuestions.length === 0) return;

    const confirmed = await showTopAlert(
      `Are you sure you want to delete ALL (${loadedQuestions.length}) questions under '${targetCategoryPath}'?`,
      'danger',
      true
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch(`/api/questions?category=${encodeURIComponent(targetCategoryPath)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        showTopAlert(`✅ All questions under '${targetCategoryPath}' deleted successfully!`, 'success');
        setLoadedQuestions([]);
      } else {
        showTopAlert(`❌ Failed: ${result.message || result.error || 'Could not delete questions'}`, 'danger');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      showTopAlert('❌ Error connecting to server!', 'danger');
    }
  };

  // -------------------------------------------------------------
  // 3. CSV Bulk Upload
  // -------------------------------------------------------------
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    const targetCategoryPath = getSelectedCategoryPath();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    if (!targetCategoryPath) {
      showTopAlert('Please select Target Category above first!', 'warning');
      return;
    }
    if (!csvFile) {
      showTopAlert('Please choose a CSV file first!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('category', targetCategoryPath);

    setIsUploadingCsv(true);
    try {
      const res = await fetch('/api/questions/upload-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        showTopAlert(`🎉 Success! ${result.count} questions added to '${targetCategoryPath}'.`, 'success');
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadCategories();
        loadExistingQuestions(targetCategoryPath);
      } else {
        showTopAlert(`❌ Error: ${result.message || result.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Failed to upload CSV file!', 'danger');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Manual Quiz Builder
  // -------------------------------------------------------------
  const addMCQField = () => {
    setManualMcqs([
      ...manualMcqs,
      { id: Date.now(), q: '', options: ['', '', '', ''], ans: 0, explanation: '' }
    ]);
  };

  const removeMCQField = (id) => {
    setManualMcqs(manualMcqs.filter((m) => m.id !== id));
  };

  const updateManualMcq = (id, field, value, optIdx = null) => {
    setManualMcqs(
      manualMcqs.map((m) => {
        if (m.id === id) {
          if (field === 'options' && optIdx !== null) {
            const newOpts = [...m.options];
            newOpts[optIdx] = value;
            return { ...m, options: newOpts };
          }
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const targetCategoryPath = getSelectedCategoryPath();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    if (!targetCategoryPath) {
      showTopAlert('Please select Target Category above first!', 'warning');
      return;
    }

    setIsSubmittingManual(true);
    let successCount = 0;
    let hasError = false;

    for (let mcq of manualMcqs) {
      const questionData = {
        q: mcq.q.trim(),
        options: mcq.options.map((o) => o.trim()),
        ans: parseInt(mcq.ans, 10),
        explanation: mcq.explanation.trim(),
        category: targetCategoryPath
      };

      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(questionData)
        });
        const result = await response.json();
        if (result.success) successCount++;
        else hasError = true;
      } catch (error) {
        hasError = true;
      }
    }

    setIsSubmittingManual(false);

    if (!hasError) {
      showTopAlert(`Success! ${successCount} questions saved under '${targetCategoryPath}'.`, 'success');
      setManualMcqs([{ id: Date.now(), q: '', options: ['', '', '', ''], ans: 0, explanation: '' }]);
      loadCategories();
      loadExistingQuestions(targetCategoryPath);
    } else {
      showTopAlert(`Added ${successCount} questions, but encountered issues.`, 'danger');
    }
  };

  // -------------------------------------------------------------
  // Drag and Drop Engine
  // -------------------------------------------------------------
  const handleDragStart = (e, dragData) => {
    e.stopPropagation();
    setDragItem(dragData);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setDragItem(null);
    setDropIndicator(null);
  };

  const handleDragOver = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropIndicator({ id, position: pos });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropData) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropIndicator?.position || 'below';
    setDropIndicator(null);

    if (!dragItem || dragItem.type !== dropData.type) {
      setDragItem(null);
      return;
    }

    // Main Category drop
    if (dropData.type === 'main-cat') {
      const fromIdx = dragItem.index;
      const toIdx = dropData.index;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;

        if (fromIdx !== insertIdx) {
          const keys = Object.keys(categoryData);
          const movedKey = keys.splice(fromIdx, 1)[0];
          keys.splice(insertIdx, 0, movedKey);

          const newCatData = {};
          keys.forEach((k) => { newCatData[k] = categoryData[k]; });
          setCategoryData(newCatData);
          setIsCatReordered(true);
        }
      }
    }

    // Sub Category drop
    if (dropData.type === 'sub-cat' && dragItem.main === dropData.main) {
      const fromIdx = dragItem.index;
      const toIdx = dropData.index;
      const main = dropData.main;

      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;

        if (fromIdx !== insertIdx) {
          const subCats = Object.keys(categoryData[main] || {});
          const movedSub = subCats.splice(fromIdx, 1)[0];
          subCats.splice(insertIdx, 0, movedSub);

          const newSubData = {};
          subCats.forEach((s) => { newSubData[s] = categoryData[main][s]; });
          const updated = { ...categoryData, [main]: newSubData };
          setCategoryData(updated);
          setIsCatReordered(true);
        }
      }
    }

    // Topic drop
    if (dropData.type === 'topic' && dragItem.main === dropData.main && dragItem.sub === dropData.sub) {
      const fromIdx = dragItem.index;
      const toIdx = dropData.index;
      const main = dropData.main;
      const sub = dropData.sub;

      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;

        if (fromIdx !== insertIdx) {
          const topics = [...(categoryData[main]?.[sub] || [])];
          const movedTopic = topics.splice(fromIdx, 1)[0];
          topics.splice(insertIdx, 0, movedTopic);

          const updated = {
            ...categoryData,
            [main]: {
              ...categoryData[main],
              [sub]: topics
            }
          };
          setCategoryData(updated);
          setIsCatReordered(true);
        }
      }
    }

    // Questions drop
    if (dropData.type === 'question') {
      const fromIdx = dragItem.index;
      const toIdx = dropData.index;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;

        if (fromIdx !== insertIdx) {
          const list = [...loadedQuestions];
          const movedQ = list.splice(fromIdx, 1)[0];
          list.splice(insertIdx, 0, movedQ);
          setLoadedQuestions(list);
          setIsQReordered(true);
        }
      }
    }

    setDragItem(null);
  };

  const mainCategories = Object.keys(categoryData);
  const targetCategoryPath = getSelectedCategoryPath();

  return (
    <div className="container" style={{ margin: '30px auto', padding: '0 25px 25px 25px', maxWidth: '1300px' }}>
      <style jsx>{`
        :root {
          --primary: #007bff;
          --primary-dark: #0056b3;
          --secondary: #17a2b8;
          --warning: #ff9f43;
          --danger: #dc3545;
          --dark: #2c3e50;
          --light: #f4f7f6;
          --gray-btn: #6c757d;
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

        h2, h3 { color: #333; margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 6px; color: #555; }
        input, select, textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #007bff;
          outline: none;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }
        .ans-explanation-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-bottom: 10px;
        }
        .cat-select-row {
          display: flex;
          gap: 15px;
          max-width: 900px;
        }
        .cat-select-row .form-group { flex: 1; margin-bottom: 0; }

        .mcq-block {
          background: #ffffff;
          padding: 25px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          border-left: 6px solid #007bff;
          margin-bottom: 25px;
          position: relative;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
        }
        .mcq-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #007bff; }

        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s ease;
        }
        .btn:hover { opacity: 0.9; }
        .btn-add { background-color: #007bff; color: white; margin-bottom: 20px; width: 100%; justify-content: center; }
        .btn-submit { background-color: #28a745; color: white; width: 100%; font-size: 16px; padding: 12px; justify-content: center; }
        .btn-csv { background-color: #17a2b8; color: white; width: 100%; font-size: 15px; padding: 11px; margin-top: 10px; justify-content: center; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn-success { background-color: #28a745; color: white; }

        .cat-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          max-width: 600px;
        }
        .btn-cat-add {
          white-space: nowrap;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
        }

        .tree-list { list-style: none; padding: 0; margin: 0; }
        .tree-node { margin-bottom: 10px; }
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cat-header:hover { background: #eef2f5; }
        .cat-title {
          font-weight: bold;
          color: #333;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-grow: 1;
        }
        .cat-actions { display: flex; gap: 8px; align-items: center; }

        .sub-tree-list { list-style: none; padding-left: 25px; margin-top: 8px; }
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 8px 14px;
          border-radius: 5px;
          margin-bottom: 6px;
          border: 1px dashed #ccc;
          border-left: 3px solid #17a2b8;
          cursor: pointer;
        }

        .topic-tree-list { list-style: none; padding-left: 25px; margin-top: 6px; }
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
          font-size: 14px;
          border: 1px solid #007bff;
          border-radius: 4px;
          width: auto;
          max-width: 200px;
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
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 5px solid #ffc107;
          transition: border 0.1s ease;
        }
        .q-actions { display: flex; gap: 10px; margin-top: 15px; align-items: center; }

        /* Draggable & Arrow Styles */
        .draggable-box {
          cursor: move;
          transition: transform 0.15s ease, opacity 0.15s ease, border-top 0.1s ease, border-bottom 0.1s ease;
        }
        .draggable-box.dragging {
          opacity: 0.4;
          background: #eef6ff !important;
        }
        .drag-handle {
          cursor: grab;
          color: #888;
          margin-right: 8px;
          font-size: 16px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }

        .drag-over-top {
          border-top: 2px solid #007bff !important;
        }
        .drag-over-bottom {
          border-bottom: 2px solid #007bff !important;
        }

        .arrow-btn-group {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 10px;
        }
        .btn-arrow {
          background: #e2e8f0;
          border: none;
          color: #475569;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          cursor: pointer;
          line-height: 1;
          transition: background 0.2s ease;
        }
        .btn-arrow:hover {
          background: #007bff;
          color: #ffffff;
        }

        .bottom-action-bar {
          margin-top: 15px;
          display: flex;
          gap: 10px;
          justify-content: flex-start;
          align-items: center;
        }

        @media (max-width: 900px) {
          .options-grid { grid-template-columns: 1fr 1fr; }
          .ans-explanation-row { grid-template-columns: 1fr; }
          .cat-select-row { flex-direction: column; max-width: 100%; }
          .cat-input-group { flex-direction: column; }
          .btn-cat-add { width: 100%; }
          .inline-add-box { flex-direction: column; }
          .topic-header-bar { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>

      {/* 1. Category Tree Management Box */}
      <div className="box">
        <h3>📂 Manage Categories, Sub-Categories & Topics</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          Structure: <b>Main Category &gt; Sub-Category &gt; Topic</b>. Click on items to expand levels.
        </p>

        <div className="cat-input-group">
          <input
            type="text"
            placeholder="Enter Main Category (e.g. prili, subjective)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createCategory()}
          />
          <button type="button" className="btn-cat-add" onClick={createCategory}>
            + Add Category
          </button>
        </div>

        <ul className="tree-list" id="categoryTreeList">
          {mainCategories.length === 0 ? (
            <li style={{ color: '#888' }}>No active categories found. Add one above!</li>
          ) : (
            mainCategories.map((main, mIdx) => {
              const subCats = Object.keys(categoryData[main] || {});
              const isSubExpanded = !!expandedTrees.subLists[main];
              const isEditingThisCat = editingCat?.type === 'main' && editingCat?.main === main;
              const isDraggingThis = dragItem?.type === 'main-cat' && dragItem?.index === mIdx;
              const dropPosThis = dropIndicator?.id === `main-${mIdx}` ? dropIndicator.position : null;

              return (
                <li
                  key={main}
                  className={`tree-node draggable-box ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drag-over-top' : ''} ${dropPosThis === 'below' ? 'drag-over-bottom' : ''}`}
                  draggable={!isEditingThisCat}
                  onDragStart={(e) => handleDragStart(e, { type: 'main-cat', index: mIdx })}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, `main-${mIdx}`, 'main-cat')}
                  onDrop={(e) => handleDrop(e, { type: 'main-cat', index: mIdx })}
                >
                  <div className="cat-header" onClick={() => toggleTree('sub', main)}>
                    <span className="cat-title">
                      <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস দিয়ে সরান"></i>
                      <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn-arrow"
                          onClick={() => moveMainCatPosition(mIdx, 'up')}
                          title="উপরে তুলুন"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="btn-arrow"
                          onClick={() => moveMainCatPosition(mIdx, 'down')}
                          title="নিচে নামান"
                        >
                          ▼
                        </button>
                      </div>
                      📁{' '}
                      {isEditingThisCat ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={editingCat.value}
                          onChange={(e) => setEditingCat({ ...editingCat, value: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.key === 'Enter' && saveCatRename(main)}
                          autoFocus
                        />
                      ) : (
                        <>
                          <b>{main}</b>{' '}
                          <small style={{ color: '#666', fontWeight: 'normal' }}>
                            ({subCats.length} sub-categories)
                          </small>
                        </>
                      )}
                    </span>

                    <div className="cat-actions" onClick={(e) => e.stopPropagation()}>
                      {isEditingThisCat ? (
                        <>
                          <button
                            className="btn btn-success"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => saveCatRename(main)}
                          >
                            💾 Save
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => setEditingCat(null)}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => {
                              toggleTree('sub', main);
                              setInlineAddSub({ main, value: '' });
                            }}
                          >
                            + Add Sub-Cat
                          </button>
                          <button
                            className="btn btn-warning"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => setEditingCat({ type: 'main', main, value: main })}
                          >
                            ✏️ Rename
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => deleteCategory(main)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline Add Sub-Category Input Box */}
                  {inlineAddSub?.main === main && (
                    <div className="inline-add-box" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Enter new sub-category name..."
                        value={inlineAddSub.value}
                        onChange={(e) => setInlineAddSub({ ...inlineAddSub, value: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && saveInlineAddSub(main)}
                        style={{ padding: '6px', fontSize: '13px' }}
                        autoFocus
                      />
                      <button
                        className="btn btn-success"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => saveInlineAddSub(main)}
                      >
                        💾 Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => setInlineAddSub(null)}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}

                  {/* Sub-Tree List */}
                  {isSubExpanded && (
                    <ul className="sub-tree-list">
                      {subCats.length === 0 ? (
                        <li className="sub-header" style={{ color: '#888', fontSize: '13px' }}>
                          No sub-categories in this main category.
                        </li>
                      ) : (
                        subCats.map((sub, sIdx) => {
                          const topics = categoryData[main][sub] || [];
                          const isTopicExpanded = !!expandedTrees.topicLists[`${main}-${sub}`];
                          const isEditingThisSub =
                            editingCat?.type === 'sub' && editingCat?.main === main && editingCat?.sub === sub;
                          const isDraggingSub =
                            dragItem?.type === 'sub-cat' && dragItem?.main === main && dragItem?.index === sIdx;
                          const dropPosSub =
                            dropIndicator?.id === `sub-${main}-${sIdx}` ? dropIndicator.position : null;

                          return (
                            <li
                              key={sub}
                              className={`tree-node draggable-box ${isDraggingSub ? 'dragging' : ''} ${dropPosSub === 'above' ? 'drag-over-top' : ''} ${dropPosSub === 'below' ? 'drag-over-bottom' : ''}`}
                              draggable={!isEditingThisSub}
                              onDragStart={(e) =>
                                handleDragStart(e, { type: 'sub-cat', main, index: sIdx })
                              }
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, `sub-${main}-${sIdx}`, 'sub-cat')}
                              onDrop={(e) => handleDrop(e, { type: 'sub-cat', main, index: sIdx })}
                            >
                              <div className="sub-header" onClick={() => toggleTree('topic', `${main}-${sub}`)}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                  <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস দিয়ে সরান"></i>
                                  <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      className="btn-arrow"
                                      onClick={() => moveSubCatPosition(main, sIdx, 'up')}
                                      title="উপরে তুলুন"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-arrow"
                                      onClick={() => moveSubCatPosition(main, sIdx, 'down')}
                                      title="নিচে নামান"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  📂{' '}
                                  {isEditingThisSub ? (
                                    <input
                                      type="text"
                                      className="edit-input"
                                      value={editingCat.value}
                                      onChange={(e) =>
                                        setEditingCat({ ...editingCat, value: e.target.value })
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => e.key === 'Enter' && saveSubRename(main, sub)}
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <b>{sub}</b>{' '}
                                      <small style={{ color: '#666', marginLeft: '5px' }}>
                                        ({topics.length} topics)
                                      </small>
                                    </>
                                  )}
                                </span>

                                <div className="cat-actions" onClick={(e) => e.stopPropagation()}>
                                  {isEditingThisSub ? (
                                    <>
                                      <button
                                        className="btn btn-success"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => saveSubRename(main, sub)}
                                      >
                                        💾 Save
                                      </button>
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => setEditingCat(null)}
                                      >
                                        ❌ Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => {
                                          setExpandedTrees(prev => ({
                                            ...prev,
                                            topicLists: { ...prev.topicLists, [`${main}-${sub}`]: true }
                                          }));
                                          setInlineAddTopic({ main, sub, value: '' });
                                        }}
                                      >
                                        + Add Topic
                                      </button>
                                      <button
                                        className="btn btn-warning"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() =>
                                          setEditingCat({ type: 'sub', main, sub, value: sub })
                                        }
                                      >
                                        ✏️ Rename
                                      </button>
                                      <button
                                        className="btn btn-danger"
                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                        onClick={() => deleteSubCategory(main, sub)}
                                      >
                                        🗑️ Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Inline Add Topic Box */}
                              {inlineAddTopic?.main === main && inlineAddTopic?.sub === sub && (
                                <div
                                  className="inline-add-box"
                                  style={{ marginLeft: '25px' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    placeholder="Enter new topic name..."
                                    value={inlineAddTopic.value}
                                    onChange={(e) =>
                                      setInlineAddTopic({ ...inlineAddTopic, value: e.target.value })
                                    }
                                    onKeyDown={(e) =>
                                      e.key === 'Enter' && saveInlineAddTopic(main, sub)
                                    }
                                    style={{ padding: '6px', fontSize: '13px' }}
                                    autoFocus
                                  />
                                  <button
                                    className="btn btn-success"
                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                    onClick={() => saveInlineAddTopic(main, sub)}
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                    onClick={() => setInlineAddTopic(null)}
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              )}

                              {/* Topic Tree List */}
                              {isTopicExpanded && (
                                <ul className="topic-tree-list">
                                  {topics.length === 0 ? (
                                    <li className="topic-item" style={{ color: '#888', fontSize: '12px' }}>
                                      No topics in this sub-category.
                                    </li>
                                  ) : (
                                    topics.map((topic, tIdx) => {
                                      const isEditingThisTopic =
                                        editingCat?.type === 'topic' &&
                                        editingCat?.main === main &&
                                        editingCat?.sub === sub &&
                                        editingCat?.topic === topic;
                                      const isDraggingTopic =
                                        dragItem?.type === 'topic' &&
                                        dragItem?.main === main &&
                                        dragItem?.sub === sub &&
                                        dragItem?.index === tIdx;
                                      const dropPosTopic =
                                        dropIndicator?.id === `topic-${main}-${sub}-${tIdx}`
                                          ? dropIndicator.position
                                          : null;

                                      return (
                                        <li
                                          key={topic}
                                          className={`topic-item draggable-box ${isDraggingTopic ? 'dragging' : ''} ${dropPosTopic === 'above' ? 'drag-over-top' : ''} ${dropPosTopic === 'below' ? 'drag-over-bottom' : ''}`}
                                          draggable={!isEditingThisTopic}
                                          onDragStart={(e) =>
                                            handleDragStart(e, {
                                              type: 'topic',
                                              main,
                                              sub,
                                              index: tIdx
                                            })
                                          }
                                          onDragEnd={handleDragEnd}
                                          onDragOver={(e) =>
                                            handleDragOver(
                                              e,
                                              `topic-${main}-${sub}-${tIdx}`,
                                              'topic'
                                            )
                                          }
                                          onDrop={(e) =>
                                            handleDrop(e, {
                                              type: 'topic',
                                              main,
                                              sub,
                                              index: tIdx
                                            })
                                          }
                                        >
                                          <span style={{ display: 'flex', alignItems: 'center' }}>
                                            <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস দিয়ে সরান"></i>
                                            <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                              <button
                                                type="button"
                                                className="btn-arrow"
                                                onClick={() => moveTopicPosition(main, sub, tIdx, 'up')}
                                                title="উপরে তুলুন"
                                              >
                                                ▲
                                              </button>
                                              <button
                                                type="button"
                                                className="btn-arrow"
                                                onClick={() => moveTopicPosition(main, sub, tIdx, 'down')}
                                                title="নিচে নামান"
                                              >
                                                ▼
                                              </button>
                                            </div>
                                            📌{' '}
                                            {isEditingThisTopic ? (
                                              <input
                                                type="text"
                                                className="edit-input"
                                                value={editingCat.value}
                                                onChange={(e) =>
                                                  setEditingCat({ ...editingCat, value: e.target.value })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) =>
                                                  e.key === 'Enter' &&
                                                  saveTopicRename(main, sub, topic)
                                                }
                                                autoFocus
                                              />
                                            ) : (
                                              <b>{topic}</b>
                                            )}
                                          </span>

                                          <div className="cat-actions" onClick={(e) => e.stopPropagation()}>
                                            {isEditingThisTopic ? (
                                              <>
                                                <button
                                                  className="btn btn-success"
                                                  style={{ padding: '1px 6px', fontSize: '10px' }}
                                                  onClick={() => saveTopicRename(main, sub, topic)}
                                                >
                                                  💾 Save
                                                </button>
                                                <button
                                                  className="btn btn-secondary"
                                                  style={{ padding: '1px 6px', fontSize: '10px' }}
                                                  onClick={() => setEditingCat(null)}
                                                >
                                                  ❌ Cancel
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <button
                                                  className="btn btn-warning"
                                                  style={{ padding: '1px 6px', fontSize: '10px' }}
                                                  onClick={() =>
                                                    setEditingCat({
                                                      type: 'topic',
                                                      main,
                                                      sub,
                                                      topic,
                                                      value: topic
                                                    })
                                                  }
                                                >
                                                  ✏️ Rename
                                                </button>
                                                <button
                                                  className="btn btn-danger"
                                                  style={{ padding: '1px 6px', fontSize: '10px' }}
                                                  onClick={() => deleteTopic(main, sub, topic)}
                                                >
                                                  🗑️ Delete
                                                </button>
                                              </>
                                            )}
                                          </div>
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
                  )}
                </li>
              );
            })
          )}
        </ul>

        {/* Category Save Action Bar */}
        {isCatReordered && (
          <div className="bottom-action-bar">
            <button className="btn btn-submit" style={{ width: 'auto' }} onClick={saveCategoryReorder}>
              <i className="fa-solid fa-floppy-disk"></i> Save Order
            </button>
            <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={cancelCategoryReorder}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
          </div>
        )}
      </div>

      {/* 2. Target Topic Selector Box */}
      <div className="box">
        <h2>🎯 Select Target Topic</h2>
        <div className="cat-select-row">
          <div className="form-group">
            <label>Main Category:</label>
            <select
              value={selectedMainCat}
              onChange={(e) => setSelectedMainCat(e.target.value)}
              required
            >
              {mainCategories.length === 0 ? (
                <option value="">No Categories Available</option>
              ) : (
                mainCategories.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Sub-Category:</label>
            <select
              value={selectedSubCat}
              onChange={(e) => setSelectedSubCat(e.target.value)}
              required
            >
              {selectedMainCat && categoryData[selectedMainCat] && Object.keys(categoryData[selectedMainCat]).length > 0 ? (
                Object.keys(categoryData[selectedMainCat]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))
              ) : (
                <option value="">-- Select Sub-Category --</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              required
            >
              {selectedMainCat && selectedSubCat && categoryData[selectedMainCat]?.[selectedSubCat]?.length > 0 ? (
                categoryData[selectedMainCat][selectedSubCat].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              ) : (
                <option value="">-- Select Topic --</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Manage Existing Questions Box */}
      <div className="box" style={{ borderLeft: '6px solid #ffc107' }}>
        <div className="topic-header-bar">
          <div>
            <h2 style={{ margin: 0 }}>✏️ Manage Existing Questions (Edit / Delete)</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Selected Topic: <b id="selectedTopicLabel">{targetCategoryPath || 'None'}</b>
            </p>
          </div>

          {targetCategoryPath && loadedQuestions.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllQuestionsInTopic}>
              🗑️ Delete All Questions in {targetCategoryPath}
            </button>
          )}
        </div>

        <div>
          {loadingQuestions ? (
            <p style={{ color: '#888' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Loading questions...
            </p>
          ) : !targetCategoryPath ? (
            <p style={{ color: '#888' }}>Select a category above to view and edit questions.</p>
          ) : loadedQuestions.length === 0 ? (
            <p style={{ color: '#888' }}>No questions found under this topic.</p>
          ) : (
            loadedQuestions.map((q, index) => {
              const isEditing = editingQuestionId === q._id;
              const isDraggingThis = dragItem?.type === 'question' && dragItem?.index === index;
              const dropPosThis = dropIndicator?.id === `q-${index}` ? dropIndicator.position : null;

              return (
                <div
                  key={q._id || index}
                  id={`q-card-${q._id}`}
                  className={`q-card draggable-box ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drag-over-top' : ''} ${dropPosThis === 'below' ? 'drag-over-bottom' : ''}`}
                  style={{
                    borderLeft: isEditing ? '6px solid #007bff' : '5px solid #ffc107',
                    background: isEditing ? '#ffffff' : '#fdfdfd'
                  }}
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, { type: 'question', index })}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, `q-${index}`, 'question')}
                  onDrop={(e) => handleDrop(e, { type: 'question', index })}
                >
                  {isEditing ? (
                    <div>
                      <div className="mcq-title" style={{ marginBottom: '10px' }}>
                        Editing MCQ #{index + 1}
                      </div>

                      <div className="form-group">
                        <label>Question:</label>
                        <input
                          type="text"
                          value={editQuestionForm.q}
                          onChange={(e) => setEditQuestionForm({ ...editQuestionForm, q: e.target.value })}
                          required
                        />
                      </div>

                      <label>Options (4 Choices):</label>
                      <div className="options-grid">
                        <input
                          type="text"
                          placeholder="অপশন (ক)"
                          value={editQuestionForm.options[0] || ''}
                          onChange={(e) => {
                            const newOpts = [...editQuestionForm.options];
                            newOpts[0] = e.target.value;
                            setEditQuestionForm({ ...editQuestionForm, options: newOpts });
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="অপশন (খ)"
                          value={editQuestionForm.options[1] || ''}
                          onChange={(e) => {
                            const newOpts = [...editQuestionForm.options];
                            newOpts[1] = e.target.value;
                            setEditQuestionForm({ ...editQuestionForm, options: newOpts });
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="অপশন (গ)"
                          value={editQuestionForm.options[2] || ''}
                          onChange={(e) => {
                            const newOpts = [...editQuestionForm.options];
                            newOpts[2] = e.target.value;
                            setEditQuestionForm({ ...editQuestionForm, options: newOpts });
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="অপশন (ঘ)"
                          value={editQuestionForm.options[3] || ''}
                          onChange={(e) => {
                            const newOpts = [...editQuestionForm.options];
                            newOpts[3] = e.target.value;
                            setEditQuestionForm({ ...editQuestionForm, options: newOpts });
                          }}
                          required
                        />
                      </div>

                      <div className="ans-explanation-row">
                        <div className="form-group">
                          <label>Correct Answer:</label>
                          <select
                            value={editQuestionForm.ans}
                            onChange={(e) =>
                              setEditQuestionForm({ ...editQuestionForm, ans: parseInt(e.target.value) })
                            }
                            required
                          >
                            <option value="0">অপশন (ক)</option>
                            <option value="1">অপশন (খ)</option>
                            <option value="2">অপশন (গ)</option>
                            <option value="3">অপশন (ঘ)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Explanation (ব্যাখ্যা):</label>
                          <input
                            type="text"
                            placeholder="Enter explanation..."
                            value={editQuestionForm.explanation}
                            onChange={(e) =>
                              setEditQuestionForm({ ...editQuestionForm, explanation: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="q-actions" style={{ marginTop: '10px' }}>
                        <button
                          className="btn btn-submit"
                          style={{ width: 'auto', padding: '8px 20px' }}
                          onClick={() => saveInlineQuestionEdit(q._id)}
                        >
                          💾 Save Changes
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '8px 20px' }}
                          onClick={() => setEditingQuestionId(null)}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস দিয়ে পজিশন সরান"></i>
                            <div className="arrow-btn-group">
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveQuestionPosition(index, 'up')}
                                title="উপরে তুলুন"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveQuestionPosition(index, 'down')}
                                title="নিচে নামান"
                              >
                                ▼
                              </button>
                            </div>
                            <strong>Q{index + 1}:</strong> &nbsp;{q.q}
                          </span>
                        </div>
                      </div>

                      <small style={{ color: '#555', display: 'block', marginTop: '8px' }}>
                        <b>Options:</b> (ক) {q.options?.[0]} | (খ) {q.options?.[1]} | (গ) {q.options?.[2]} | (ঘ){' '}
                        {q.options?.[3]}
                        <span style={{ color: '#28a745', marginLeft: '10px' }}>
                          <b>[ সঠিক উত্তর: ({getBanglaLetter(q.ans)}) ]</b>
                        </span>
                      </small>

                      <small style={{ color: '#777', display: 'block', marginTop: '2px' }}>
                        <b>Explanation:</b> {q.explanation || 'None'}
                      </small>

                      <div className="q-actions">
                        <button
                          className="btn btn-warning"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => startEditQuestion(q, index)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => deleteSingleQuestion(q._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Questions Save Action Bar */}
        {isQReordered && (
          <div className="bottom-action-bar">
            <button className="btn btn-submit" style={{ width: 'auto' }} onClick={saveQuestionsReorder}>
              <i className="fa-solid fa-floppy-disk"></i> Save Questions Order
            </button>
            <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={cancelQuestionsReorder}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
          </div>
        )}
      </div>

      {/* 4. Bulk Upload Questions via CSV / Excel */}
      <div className="box" style={{ borderLeft: '6px solid #17a2b8' }}>
        <h3>📤 Bulk Upload Questions via CSV / Excel</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>
          CSV Header columns required: <b>question</b>, <b>opt0</b>, <b>opt1</b>, <b>opt2</b>, <b>opt3</b>, <b>ans</b>,{' '}
          <b>explanation</b>
        </p>
        <form onSubmit={handleCsvUpload}>
          <div className="form-group">
            <label>Select CSV File:</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0] || null)}
              required
            />
          </div>
          <button type="submit" className="btn btn-csv" disabled={isUploadingCsv}>
            {isUploadingCsv ? 'Uploading CSV...' : '📁 Upload CSV File'}
          </button>
        </form>
      </div>

      {/* 5. Manual Quiz Builder */}
      <div className="box">
        <h2>📝 Manual Quiz Builder</h2>
        <form onSubmit={handleManualSubmit}>
          <div id="mcqContainer">
            {manualMcqs.map((mcq, mIdx) => (
              <div key={mcq.id} className="mcq-block" id={`mcq-block-${mIdx + 1}`}>
                <div className="mcq-title">MCQ #{mIdx + 1}</div>
                {manualMcqs.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ position: 'absolute', top: '15px', right: '15px', padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => removeMCQField(mcq.id)}
                  >
                    Remove
                  </button>
                )}

                <div className="form-group">
                  <label>Question:</label>
                  <input
                    type="text"
                    placeholder="Enter question..."
                    value={mcq.q}
                    onChange={(e) => updateManualMcq(mcq.id, 'q', e.target.value)}
                    required
                  />
                </div>

                <label>Options (4 Choices):</label>
                <div className="options-grid">
                  <input
                    type="text"
                    placeholder="অপশন (ক)"
                    value={mcq.options[0]}
                    onChange={(e) => updateManualMcq(mcq.id, 'options', e.target.value, 0)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="অপশন (খ)"
                    value={mcq.options[1]}
                    onChange={(e) => updateManualMcq(mcq.id, 'options', e.target.value, 1)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="অপশন (গ)"
                    value={mcq.options[2]}
                    onChange={(e) => updateManualMcq(mcq.id, 'options', e.target.value, 2)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="অপশন (ঘ)"
                    value={mcq.options[3]}
                    onChange={(e) => updateManualMcq(mcq.id, 'options', e.target.value, 3)}
                    required
                  />
                </div>

                <div className="ans-explanation-row">
                  <div className="form-group">
                    <label>Correct Answer:</label>
                    <select
                      value={mcq.ans}
                      onChange={(e) => updateManualMcq(mcq.id, 'ans', parseInt(e.target.value))}
                      required
                    >
                      <option value="0">অপশন (ক)</option>
                      <option value="1">অপশন (খ)</option>
                      <option value="2">অপশন (গ)</option>
                      <option value="3">অপশন (ঘ)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Explanation (ব্যাখ্যা):</label>
                    <input
                      type="text"
                      placeholder="Enter answer explanation (optional)..."
                      value={mcq.explanation}
                      onChange={(e) => updateManualMcq(mcq.id, 'explanation', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-add" onClick={addMCQField}>
            ➕ Add More MCQ
          </button>
          <button type="submit" className="btn btn-submit" disabled={isSubmittingManual}>
            {isSubmittingManual ? 'Saving Data...' : '🚀 Submit All Questions'}
          </button>
        </form>
      </div>
    </div>
  );
}
