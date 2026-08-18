'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultHomeConfig = {
  seoTitle: '',
  seoDescription: '',
  sliders: [],
  demoQuizzes: [],
  packages: [],
  demoSectionInfo: { title: '', subtitle: '' },
  packageSectionInfo: { title: '', subtitle: '' },
  missionSectionInfo: null
};

export default function AdminHomeDashboardPage() {
  const [loading, setLoading] = useState(true);

  // SEO State
  const [seoInfo, setSeoInfo] = useState({ title: '', description: '' });
  const [isEditingSeo, setIsEditingSeo] = useState(false);
  const [seoForm, setSeoForm] = useState({ title: '', description: '' });

  // Sliders State
  const [sliderDataList, setSliderDataList] = useState([]);
  const [newSliderRows, setNewSliderRows] = useState([]);
  const [editingSliderIdx, setEditingSliderIdx] = useState(null);
  const [editSliderForm, setEditSliderForm] = useState({
    title: '',
    subtitle: '',
    bgImage: 'images/slider-01.jpg',
    bgOpacity: 0.5,
    btn1Text: '🚀 কুইজ শুরু করুন',
    btn1Link: 'all-mcq.html',
    btn2Text: 'ফ্রি ডেমো দেখুন',
    btn2Link: '#demo'
  });
  const [isSliderReordered, setIsSliderReordered] = useState(false);

  // Demo Quizzes State
  const [demoHeaderInfo, setDemoHeaderInfo] = useState(null);
  const [isEditingDemoHeader, setIsEditingDemoHeader] = useState(false);
  const [demoHeaderForm, setDemoHeaderForm] = useState({ title: '', subtitle: '' });

  const [demoDataList, setDemoDataList] = useState([]);
  const [newDemoRows, setNewDemoRows] = useState([]);
  const [editingDemoIdx, setEditingDemoIdx] = useState(null);
  const [editDemoForm, setEditDemoForm] = useState({
    title: '',
    badgeText: 'ফ্রি টেস্ট',
    desc: '',
    link: ''
  });
  const [isDemoReordered, setIsDemoReordered] = useState(false);

  // Packages State
  const [packageHeaderInfo, setPackageHeaderInfo] = useState(null);
  const [isEditingPackageHeader, setIsEditingPackageHeader] = useState(false);
  const [packageHeaderForm, setPackageHeaderForm] = useState({ title: '', subtitle: '' });

  const [packageDataList, setPackageDataList] = useState([]);
  const [newPackageRows, setNewPackageRows] = useState([]);
  const [editingPackageIdx, setEditingPackageIdx] = useState(null);
  const [editPackageForm, setEditPackageForm] = useState({
    title: '',
    price: '',
    duration: '',
    desc: '',
    imageUrl: '',
    buyLink: '#contact'
  });
  const [isPackageReordered, setIsPackageReordered] = useState(false);

  // Mission State
  const [missionInfo, setMissionInfo] = useState(null);
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [missionForm, setMissionForm] = useState({
    sectionTitle: 'আমাদের মিশন ও লক্ষ্য',
    sectionSubtitle: 'শিক্ষার্থীদের সফলতা ও সঠিক প্রস্তুতির পথ সুগম করাই আমাদের উদ্দেশ্য',
    missionTitle: 'আমাদের মিশন (Mission)',
    missionDesc: 'বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া...',
    goalTitle: 'আমাদের লক্ষ্য (Goal)',
    goalDesc: 'একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে প্রতিটি প্রতিযোগিতামূলক পরীক্ষার পরীক্ষার্থীর প্রথম পছন্দ হয়ে ওঠা...'
  });

  // Drag and Drop Engine
  const [dragItem, setDragItem] = useState(null); // { type: 'slider'|'demo'|'package', index }
  const [dropIndicator, setDropIndicator] = useState(null); // { id, position: 'above'|'below' }

  // -------------------------------------------------------------
  // Fetch Home Config
  // -------------------------------------------------------------
  const fetchHomeConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-config');
      const data = await res.json();

      setSeoInfo({
        title: data?.seoTitle || '',
        description: data?.seoDescription || ''
      });

      setSliderDataList(data?.sliders ? JSON.parse(JSON.stringify(data.sliders)) : []);
      setDemoDataList(data?.demoQuizzes ? JSON.parse(JSON.stringify(data.demoQuizzes)) : []);
      setPackageDataList(data?.packages ? JSON.parse(JSON.stringify(data.packages)) : []);

      setDemoHeaderInfo(data?.demoSectionInfo && (data.demoSectionInfo.title || data.demoSectionInfo.subtitle) ? data.demoSectionInfo : null);
      setPackageHeaderInfo(data?.packageSectionInfo && (data.packageSectionInfo.title || data.packageSectionInfo.subtitle) ? data.packageSectionInfo : null);
      setMissionInfo(data?.missionSectionInfo && (data.missionSectionInfo.sectionTitle || data.missionSectionInfo.missionDesc) ? data.missionSectionInfo : null);

      setNewSliderRows([]);
      setNewDemoRows([]);
      setNewPackageRows([]);

      setIsSliderReordered(false);
      setIsDemoReordered(false);
      setIsPackageReordered(false);
    } catch (err) {
      console.error('Home Config Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeConfig();
  }, []);

  // -------------------------------------------------------------
  // Save Home Config Master Function
  // -------------------------------------------------------------
  const saveHomeConfig = async (overrides = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return false;
    }

    const currentSeo = overrides.seo !== undefined ? overrides.seo : seoInfo;
    const currentSliders = overrides.sliders !== undefined ? overrides.sliders : [...sliderDataList, ...newSliderRows.filter(r => r.title.trim())];
    const currentDemos = overrides.demos !== undefined ? overrides.demos : [...demoDataList, ...newDemoRows.filter(r => r.title.trim())];
    const currentPackages = overrides.packages !== undefined ? overrides.packages : [...packageDataList, ...newPackageRows.filter(r => r.title.trim())];
    const currentDemoHeader = overrides.demoHeader !== undefined ? overrides.demoHeader : demoHeaderInfo;
    const currentPackageHeader = overrides.packageHeader !== undefined ? overrides.packageHeader : packageHeaderInfo;
    const currentMission = overrides.mission !== undefined ? overrides.mission : missionInfo;

    const payload = {
      seoTitle: currentSeo.title,
      seoDescription: currentSeo.description,
      sliders: currentSliders,
      demoQuizzes: currentDemos,
      packages: currentPackages,
      demoSectionInfo: currentDemoHeader,
      packageSectionInfo: currentPackageHeader,
      missionSectionInfo: currentMission
    };

    try {
      const res = await fetch('/api/home-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        showTopAlert('✅ সফলভাবে সেভ হয়েছে!', 'success');
        await fetchHomeConfig();
        return true;
      } else {
        showTopAlert('❌ ' + (result.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
        return false;
      }
    } catch (err) {
      console.error('Home Config Save Error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
      return false;
    }
  };

  // -------------------------------------------------------------
  // 0. SEO Section Handlers
  // -------------------------------------------------------------
  const startEditSeo = () => {
    setSeoForm({
      title: seoInfo.title || '',
      description: seoInfo.description || ''
    });
    setIsEditingSeo(true);
  };

  const saveSeoSection = async () => {
    const updated = {
      title: seoForm.title.trim(),
      description: seoForm.description.trim()
    };
    setSeoInfo(updated);
    setIsEditingSeo(false);
    await saveHomeConfig({ seo: updated });
  };

  const deleteSeoSection = async () => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে SEO টাইটেল ও ডেসক্রিপশন মুছে ফেলতে চান?', 'danger', true)) {
      const updated = { title: '', description: '' };
      setSeoInfo(updated);
      await saveHomeConfig({ seo: updated });
    }
  };

  // -------------------------------------------------------------
  // 1. Slider Section Handlers
  // -------------------------------------------------------------
  const moveSliderPosition = (index, direction) => {
    const list = [...sliderDataList];
    if (direction === 'up' && index > 0) {
      const item = list.splice(index, 1)[0];
      list.splice(index - 1, 0, item);
      setSliderDataList(list);
      setIsSliderReordered(true);
    } else if (direction === 'down' && index < list.length - 1) {
      const item = list.splice(index, 1)[0];
      list.splice(index + 1, 0, item);
      setSliderDataList(list);
      setIsSliderReordered(true);
    }
  };

  const startEditSlider = (index) => {
    const s = sliderDataList[index];
    setEditingSliderIdx(index);
    setEditSliderForm({
      title: s.title || '',
      subtitle: s.subtitle || '',
      bgImage: s.bgImage || 'images/slider-01.jpg',
      bgOpacity: s.bgOpacity !== undefined ? s.bgOpacity : 0.5,
      btn1Text: s.btn1Text || '🚀 কুইজ শুরু করুন',
      btn1Link: s.btn1Link || 'all-mcq.html',
      btn2Text: s.btn2Text || 'ফ্রি ডেমো দেখুন',
      btn2Link: s.btn2Link || '#demo'
    });
  };

  const saveInlineSliderEdit = async (index) => {
    const list = [...sliderDataList];
    list[index] = {
      title: editSliderForm.title.trim(),
      subtitle: editSliderForm.subtitle.trim(),
      bgImage: editSliderForm.bgImage.trim() || 'images/slider-01.jpg',
      bgOpacity: parseFloat(editSliderForm.bgOpacity) || 0.5,
      btn1Text: editSliderForm.btn1Text.trim(),
      btn1Link: editSliderForm.btn1Link.trim(),
      btn2Text: editSliderForm.btn2Text.trim(),
      btn2Link: editSliderForm.btn2Link.trim()
    };
    setSliderDataList(list);
    setEditingSliderIdx(null);
    await saveHomeConfig({ sliders: list });
  };

  const deleteSingleSlider = async (index) => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে এই স্লাইডারটি মুছে ফেলতে চান?', 'danger', true)) {
      const list = sliderDataList.filter((_, idx) => idx !== index);
      setSliderDataList(list);
      await saveHomeConfig({ sliders: list });
    }
  };

  const addSliderRow = () => {
    setNewSliderRows([
      ...newSliderRows,
      {
        title: '',
        subtitle: '',
        bgImage: 'images/slider-01.jpg',
        bgOpacity: 0.5,
        btn1Text: '🚀 কুইজ শুরু করুন',
        btn1Link: 'all-mcq.html',
        btn2Text: 'ফ্রি ডেমো দেখুন',
        btn2Link: '#demo'
      }
    ]);
  };

  const updateNewSliderRow = (index, field, value) => {
    const rows = [...newSliderRows];
    rows[index][field] = value;
    setNewSliderRows(rows);
  };

  const removeNewSliderRow = (index) => {
    setNewSliderRows(newSliderRows.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // 2. Demo Quizzes Section Handlers
  // -------------------------------------------------------------
  const startEditDemoHeader = () => {
    setDemoHeaderForm({
      title: demoHeaderInfo?.title || '',
      subtitle: demoHeaderInfo?.subtitle || ''
    });
    setIsEditingDemoHeader(true);
  };

  const saveDemoHeaderSection = async () => {
    const updated = {
      title: demoHeaderForm.title.trim(),
      subtitle: demoHeaderForm.subtitle.trim()
    };
    setDemoHeaderInfo(updated);
    setIsEditingDemoHeader(false);
    await saveHomeConfig({ demoHeader: updated });
  };

  const deleteDemoHeaderSection = async () => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে সেকশনের টাইটেল ও সাবটাইটেল মুছে ফেলতে চান?', 'danger', true)) {
      setDemoHeaderInfo(null);
      await saveHomeConfig({ demoHeader: null });
    }
  };

  const moveDemoPosition = (index, direction) => {
    const list = [...demoDataList];
    if (direction === 'up' && index > 0) {
      const item = list.splice(index, 1)[0];
      list.splice(index - 1, 0, item);
      setDemoDataList(list);
      setIsDemoReordered(true);
    } else if (direction === 'down' && index < list.length - 1) {
      const item = list.splice(index, 1)[0];
      list.splice(index + 1, 0, item);
      setDemoDataList(list);
      setIsDemoReordered(true);
    }
  };

  const startEditDemo = (index) => {
    const d = demoDataList[index];
    setEditingDemoIdx(index);
    setEditDemoForm({
      title: d.title || '',
      badgeText: d.badgeText || 'ফ্রি টেস্ট',
      desc: d.desc || '',
      link: d.link || ''
    });
  };

  const saveInlineDemoEdit = async (index) => {
    const list = [...demoDataList];
    list[index] = {
      title: editDemoForm.title.trim(),
      badgeText: editDemoForm.badgeText.trim(),
      desc: editDemoForm.desc.trim(),
      link: editDemoForm.link.trim()
    };
    setDemoDataList(list);
    setEditingDemoIdx(null);
    await saveHomeConfig({ demos: list });
  };

  const deleteSingleDemo = async (index) => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে এই ডেমো কুইজটি মুছে ফেলতে চান?', 'danger', true)) {
      const list = demoDataList.filter((_, idx) => idx !== index);
      setDemoDataList(list);
      await saveHomeConfig({ demos: list });
    }
  };

  const addDemoRow = () => {
    setNewDemoRows([
      ...newDemoRows,
      {
        title: '',
        badgeText: 'ফ্রি টেস্ট',
        desc: '',
        link: ''
      }
    ]);
  };

  const updateNewDemoRow = (index, field, value) => {
    const rows = [...newDemoRows];
    rows[index][field] = value;
    setNewDemoRows(rows);
  };

  const removeNewDemoRow = (index) => {
    setNewDemoRows(newDemoRows.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // 3. Packages Section Handlers
  // -------------------------------------------------------------
  const startEditPackageHeader = () => {
    setPackageHeaderForm({
      title: packageHeaderInfo?.title || '',
      subtitle: packageHeaderInfo?.subtitle || ''
    });
    setIsEditingPackageHeader(true);
  };

  const savePackageHeaderSection = async () => {
    const updated = {
      title: packageHeaderForm.title.trim(),
      subtitle: packageHeaderForm.subtitle.trim()
    };
    setPackageHeaderInfo(updated);
    setIsEditingPackageHeader(false);
    await saveHomeConfig({ packageHeader: updated });
  };

  const deletePackageHeaderSection = async () => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে সেকশনের টাইটেল ও সাবটাইটেল মুছে ফেলতে চান?', 'danger', true)) {
      setPackageHeaderInfo(null);
      await saveHomeConfig({ packageHeader: null });
    }
  };

  const movePackagePosition = (index, direction) => {
    const list = [...packageDataList];
    if (direction === 'up' && index > 0) {
      const item = list.splice(index, 1)[0];
      list.splice(index - 1, 0, item);
      setPackageDataList(list);
      setIsPackageReordered(true);
    } else if (direction === 'down' && index < list.length - 1) {
      const item = list.splice(index, 1)[0];
      list.splice(index + 1, 0, item);
      setPackageDataList(list);
      setIsPackageReordered(true);
    }
  };

  const startEditPackage = (index) => {
    const p = packageDataList[index];
    setEditingPackageIdx(index);
    setEditPackageForm({
      title: p.title || '',
      price: p.price || '',
      duration: p.duration || '',
      desc: p.desc || '',
      imageUrl: p.imageUrl || '',
      buyLink: p.buyLink || '#contact'
    });
  };

  const saveInlinePackageEdit = async (index) => {
    const list = [...packageDataList];
    list[index] = {
      title: editPackageForm.title.trim(),
      price: editPackageForm.price.trim(),
      duration: editPackageForm.duration.trim(),
      desc: editPackageForm.desc.trim(),
      imageUrl: editPackageForm.imageUrl.trim(),
      buyLink: editPackageForm.buyLink.trim() || '#contact'
    };
    setPackageDataList(list);
    setEditingPackageIdx(null);
    await saveHomeConfig({ packages: list });
  };

  const deleteSinglePackage = async (index) => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে এই প্যাকেজটি মুছে ফেলতে চান?', 'danger', true)) {
      const list = packageDataList.filter((_, idx) => idx !== index);
      setPackageDataList(list);
      await saveHomeConfig({ packages: list });
    }
  };

  const addPackageRow = () => {
    setNewPackageRows([
      ...newPackageRows,
      {
        title: '',
        price: '',
        duration: '',
        desc: '',
        imageUrl: '',
        buyLink: '#contact'
      }
    ]);
  };

  const updateNewPackageRow = (index, field, value) => {
    const rows = [...newPackageRows];
    rows[index][field] = value;
    setNewPackageRows(rows);
  };

  const removeNewPackageRow = (index) => {
    setNewPackageRows(newPackageRows.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // 4. Mission & Goals Section Handlers
  // -------------------------------------------------------------
  const startEditMission = () => {
    setMissionForm({
      sectionTitle: missionInfo?.sectionTitle || 'আমাদের মিশন ও লক্ষ্য',
      sectionSubtitle: missionInfo?.sectionSubtitle || 'শিক্ষার্থীদের সফলতা ও সঠিক প্রস্তুতির পথ সুগম করাই আমাদের উদ্দেশ্য',
      missionTitle: missionInfo?.missionTitle || 'আমাদের মিশন (Mission)',
      missionDesc: missionInfo?.missionDesc || 'বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া...',
      goalTitle: missionInfo?.goalTitle || 'আমাদের লক্ষ্য (Goal)',
      goalDesc: missionInfo?.goalDesc || 'একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে প্রতিটি প্রতিযোগিতামূলক পরীক্ষার পরীক্ষার্থীর প্রথম পছন্দ হয়ে ওঠা...'
    });
    setIsEditingMission(true);
  };

  const saveMissionSection = async () => {
    const updated = {
      sectionTitle: missionForm.sectionTitle.trim(),
      sectionSubtitle: missionForm.sectionSubtitle.trim(),
      missionTitle: missionForm.missionTitle.trim(),
      missionDesc: missionForm.missionDesc.trim(),
      goalTitle: missionForm.goalTitle.trim(),
      goalDesc: missionForm.goalDesc.trim()
    };
    setMissionInfo(updated);
    setIsEditingMission(false);
    await saveHomeConfig({ mission: updated });
  };

  const deleteMissionSection = async () => {
    if (await showTopAlert('আপনি কি নিশ্চিত যে মিশন ও লক্ষ্য মুছে ফেলতে চান?', 'danger', true)) {
      setMissionInfo(null);
      await saveHomeConfig({ mission: null });
    }
  };

  // -------------------------------------------------------------
  // Drag and Drop Generic Engine
  // -------------------------------------------------------------
  const handleDragStart = (e, type, index) => {
    e.stopPropagation();
    const data = { type, index: Number(index) };
    setDragItem(data);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setDragItem(null);
    setDropIndicator(null);
  };

  const handleDragOver = (e, targetId, targetType, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== targetType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropIndicator({ id: targetId, position: pos });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropIndicator?.position || 'below';
    setDropIndicator(null);

    if (!dragItem || dragItem.type !== targetType) {
      setDragItem(null);
      return;
    }

    const fromIdx = dragItem.index;
    const toIdx = targetIndex;

    if (fromIdx !== null && toIdx !== null) {
      let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
      if (fromIdx < insertIdx) insertIdx--;

      if (fromIdx !== insertIdx) {
        if (targetType === 'slider') {
          const list = [...sliderDataList];
          const moved = list.splice(fromIdx, 1)[0];
          list.splice(insertIdx, 0, moved);
          setSliderDataList(list);
          setIsSliderReordered(true);
        } else if (targetType === 'demo') {
          const list = [...demoDataList];
          const moved = list.splice(fromIdx, 1)[0];
          list.splice(insertIdx, 0, moved);
          setDemoDataList(list);
          setIsDemoReordered(true);
        } else if (targetType === 'package') {
          const list = [...packageDataList];
          const moved = list.splice(fromIdx, 1)[0];
          list.splice(insertIdx, 0, moved);
          setPackageDataList(list);
          setIsPackageReordered(true);
        }
      }
    }

    setDragItem(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#007bff' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>হোম কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  const hasSeo = seoInfo && (seoInfo.title || seoInfo.description);
  const hasDemoHeader = demoHeaderInfo && (demoHeaderInfo.title || demoHeaderInfo.subtitle);
  const hasPackageHeader = packageHeaderInfo && (packageHeaderInfo.title || packageHeaderInfo.subtitle);
  const hasMission = missionInfo && (missionInfo.sectionTitle || missionInfo.missionDesc);

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
          --purple-btn: #6f42c1;
        }

        .section-card {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .section-card.slider-card { border-left: 6px solid var(--primary); }
        .section-card.demo-card { border-left: 6px solid var(--secondary); }
        .section-card.package-card { border-left: 6px solid var(--warning); }
        .section-card.mission-card { border-left: 6px solid var(--purple-btn); }
        .section-card.seo-card { border-left: 6px solid #e83e8c; }

        .section-title {
          font-size: 20px;
          color: var(--dark);
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #e2e8f0;
        }
        .sub-header-title {
          font-size: 16px;
          font-weight: bold;
          color: var(--dark);
          margin: 15px 0 10px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .read-box {
          background: #fdfdfd;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 5px solid #ffc107;
          transition: all 0.2s ease;
        }
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .read-title {
          font-size: 16px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }
        .read-subtitle { font-size: 14px; color: #555; margin-bottom: 8px; }
        .read-meta { font-size: 13px; color: #555; margin-bottom: 4px; }
        .read-preview-text { font-size: 13px; color: #777; margin-bottom: 10px; }

        .item-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px solid #cbd5e1;
        }

        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; font-size: 13px; }
        input, textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          outline: none;
          background: white;
          font-family: inherit;
          box-sizing: border-box;
        }
        input:focus, textarea:focus { border-color: var(--primary); }

        .row { display: flex; gap: 15px; margin-bottom: 10px; flex-wrap: wrap; align-items: flex-start; }
        .row .form-group { flex: 1; min-width: 250px; }

        .card-actions { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; align-items: center; }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s ease;
        }
        .btn:hover { opacity: 0.9; }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-warning:hover { background-color: #e0a800; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-danger:hover { background-color: #c82333; }
        .btn-submit { background-color: #28a745; color: white; }
        .btn-submit:hover { background-color: #218838; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn-secondary:hover { background-color: #5a6268; }

        .section-action-bar { display: flex; gap: 10px; align-items: center; margin-top: 15px; flex-wrap: wrap; }
        .btn-add {
          background: var(--main-dash-btn);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .btn-save-section {
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 22px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .btn-save-section:hover { background-color: var(--primary-dark); }
        .btn-remove {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .btn-remove:hover { background: #c82333; }

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
      `}</style>

      {/* ০. SEO SETTINGS CARD */}
      <div className="section-card seo-card" id="card-seo">
        <div className="section-title">
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#e83e8c' }}></i>
          হোম পেজ SEO সেটিংস
        </div>

        {isEditingSeo ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasSeo ? 'SEO টাইটেল ও ডেসক্রিপশন এডিট করুন' : 'নতুন SEO টাইটেল ও ডেসক্রিপশন যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Home Meta Title (SEO):</label>
                <input
                  type="text"
                  value={seoForm.title}
                  onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                  placeholder="যেমন: TopMCQ - সেরা অনলাইন কুইজ প্ল্যাটফর্ম"
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Home Meta Description (SEO):</label>
                <textarea
                  rows="2"
                  value={seoForm.description}
                  onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                  placeholder="যেমন: TopMCQ-তে সেরা সব কুইজ দিয়ে আপনার প্রস্তুতি যাচাই করুন..."
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={saveSeoSection}>
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingSeo(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        ) : hasSeo ? (
          <div className="read-box" style={{ borderLeft: '5px solid #e83e8c' }}>
            <div className="read-title">{seoInfo.title || '(টাইটেল নেই)'}</div>
            <div className="read-subtitle" style={{ marginTop: '5px' }}>
              <b>Meta Description:</b> {seoInfo.description || '(ডেসক্রিপশন নেই)'}
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-warning" onClick={startEditSeo}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button className="btn btn-danger" onClick={deleteSeoSection}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-add" style={{ marginBottom: '15px' }} onClick={startEditSeo}>
            <i className="fa-solid fa-plus"></i> SEO টাইটেল ও ডেসক্রিপশন যোগ করুন
          </button>
        )}
      </div>

      {/* ১. SLIDERS MANAGER CARD */}
      <div className="section-card slider-card" id="card-slider">
        <div className="section-title">
          <i className="fa-solid fa-images" style={{ color: 'var(--primary)' }}></i>
          ১. স্লাইডার সেকশন (Sliders)
        </div>

        {/* Existing Sliders List */}
        <div>
          {sliderDataList.map((s, index) => {
            const isEditingThis = editingSliderIdx === index;
            const isDraggingThis = dragItem?.type === 'slider' && dragItem?.index === index;
            const dropPosThis = dropIndicator?.id === `slider-${index}` ? dropIndicator.position : null;

            return (
              <div
                key={index}
                id={`slider-card-${index}`}
                className={`read-box draggable-box slider-drag-item ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drag-over-top' : ''} ${dropPosThis === 'below' ? 'drag-over-bottom' : ''}`}
                style={{
                  borderLeft: isEditingThis ? '6px solid #007bff' : '5px solid #ffc107',
                  background: isEditingThis ? '#ffffff' : '#fdfdfd'
                }}
                draggable={!isEditingThis}
                onDragStart={(e) => handleDragStart(e, 'slider', index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, `slider-${index}`, 'slider', index)}
                onDrop={(e) => handleDrop(e, 'slider', index)}
              >
                {isEditingThis ? (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
                      স্লাইডার #{index + 1} এডিট করুন
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>টাইটেল (Title):</label>
                        <input
                          type="text"
                          value={editSliderForm.title}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>সাব-টাইটেল (Subtitle):</label>
                        <input
                          type="text"
                          value={editSliderForm.subtitle}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, subtitle: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>ইমেজ লিংক (Image URL):</label>
                        <input
                          type="text"
                          value={editSliderForm.bgImage}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, bgImage: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>অপাসিটি (Opacity):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editSliderForm.bgOpacity}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, bgOpacity: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>বাটন ১ নাম:</label>
                        <input
                          type="text"
                          value={editSliderForm.btn1Text}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, btn1Text: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>বাটন ১ লিংক (URL):</label>
                        <input
                          type="text"
                          value={editSliderForm.btn1Link}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, btn1Link: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>বাটন ২ নাম:</label>
                        <input
                          type="text"
                          value={editSliderForm.btn2Text}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, btn2Text: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>বাটন ২ লিংক (URL):</label>
                        <input
                          type="text"
                          value={editSliderForm.btn2Link}
                          onChange={(e) => setEditSliderForm({ ...editSliderForm, btn2Link: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="card-actions" style={{ marginTop: '10px' }}>
                      <button className="btn btn-submit" onClick={() => saveInlineSliderEdit(index)}>
                        <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingSliderIdx(null)}>
                        <i className="fa-solid fa-xmark"></i> বাতিল করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="card-header-flex">
                      <div className="read-title">
                        <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস চেপে পজিশন পরিবর্তন করুন"></i>
                        <div className="arrow-btn-group">
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveSliderPosition(index, 'up')}
                            title="উপরে তুলুন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveSliderPosition(index, 'down')}
                            title="নিচে নামান"
                          >
                            ▼
                          </button>
                        </div>
                        স্লাইডার #{index + 1}: {s.title || '(টাইটেল নেই)'}
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-warning" onClick={() => startEditSlider(index)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteSingleSlider(index)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                    <div className="read-subtitle">
                      <b>সাব-টাইটেল:</b> {s.subtitle || 'নাই'}
                    </div>
                    <div className="read-meta">
                      <b>ইমেজ:</b> {s.bgImage || 'images/slider-01.jpg'} | <b>অপাসিটি:</b>{' '}
                      {s.bgOpacity !== undefined ? s.bgOpacity : '0.5'}
                    </div>
                    <div className="read-preview-text">
                      <b>বাটন ১:</b> {s.btn1Text || '🚀 কুইজ শুরু করুন'} ({s.btn1Link || 'all-mcq.html'}) |{' '}
                      <b>বাটন ২:</b> {s.btn2Text || 'ফ্রি ডেমো দেখুন'} ({s.btn2Link || '#demo'})
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* New Slider Rows */}
        <div>
          {newSliderRows.map((row, rIdx) => (
            <div key={rIdx} className="item-box slider-item-box">
              <div className="row">
                <input
                  type="text"
                  placeholder="টাইটেল (Title)"
                  className="slide-title"
                  value={row.title}
                  onChange={(e) => updateNewSliderRow(rIdx, 'title', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="সাব-টাইটেল (Subtitle)"
                  className="slide-subtitle"
                  value={row.subtitle}
                  onChange={(e) => updateNewSliderRow(rIdx, 'subtitle', e.target.value)}
                  required
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="ইমেজ লিংক (GitHub/Local URL)"
                  className="slide-img"
                  value={row.bgImage}
                  onChange={(e) => updateNewSliderRow(rIdx, 'bgImage', e.target.value)}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  placeholder="ইমেজ অপাসিটি (যেমন: 0.5)"
                  className="slide-opacity"
                  value={row.bgOpacity}
                  onChange={(e) => updateNewSliderRow(rIdx, 'bgOpacity', e.target.value)}
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="বাটন ১ নাম"
                  className="slide-btn1-text"
                  value={row.btn1Text}
                  onChange={(e) => updateNewSliderRow(rIdx, 'btn1Text', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="বাটন ১ লিংক (URL)"
                  className="slide-btn1-link"
                  value={row.btn1Link}
                  onChange={(e) => updateNewSliderRow(rIdx, 'btn1Link', e.target.value)}
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="বাটন ২ নাম"
                  className="slide-btn2-text"
                  value={row.btn2Text}
                  onChange={(e) => updateNewSliderRow(rIdx, 'btn2Text', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="বাটন ২ লিংক (URL)"
                  className="slide-btn2-link"
                  value={row.btn2Link}
                  onChange={(e) => updateNewSliderRow(rIdx, 'btn2Link', e.target.value)}
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeNewSliderRow(rIdx)}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sliders Action Bar */}
        <div className="section-action-bar" id="slider-action-bar">
          <button type="button" className="btn-add" onClick={addSliderRow}>
            <i className="fa-solid fa-plus"></i> স্লাইডার যোগ করুন
          </button>
          {isSliderReordered && (
            <>
              <button
                type="button"
                className="btn btn-submit"
                onClick={() => {
                  saveHomeConfig({ sliders: sliderDataList });
                  setIsSliderReordered(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> Save Order
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchHomeConfig()}
              >
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </>
          )}
          {newSliderRows.length > 0 && (
            <button
              type="button"
              className="btn-save-section"
              id="save-slider-btn"
              style={{ display: 'inline-flex' }}
              onClick={() => saveHomeConfig()}
            >
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ২. DEMO QUIZZES CARD */}
      <div className="section-card demo-card" id="card-demo">
        <div className="section-title">
          <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--secondary)' }}></i>
          ২. ফ্রি ডেমো কুইজ (Demo Quizzes)
        </div>

        {/* Demo Section Header Info */}
        {isEditingDemoHeader ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasDemoHeader ? 'টাইটেল ও সাবটাইটেল এডিট করুন' : 'নতুন টাইটেল ও সাবটাইটেল যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>সেকশন টাইটেল (Title):</label>
                <input
                  type="text"
                  value={demoHeaderForm.title}
                  onChange={(e) => setDemoHeaderForm({ ...demoHeaderForm, title: e.target.value })}
                  placeholder="যেমন: ফ্রি ডেমো কুইজ"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>সেকশন সাব-টাইটেল (Subtitle):</label>
                <input
                  type="text"
                  value={demoHeaderForm.subtitle}
                  onChange={(e) => setDemoHeaderForm({ ...demoHeaderForm, subtitle: e.target.value })}
                  placeholder="যেমন: আপনার প্রস্তুতি যাচাই করুন"
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={saveDemoHeaderSection}>
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingDemoHeader(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        ) : hasDemoHeader ? (
          <div className="read-box" id="demo-header-card" style={{ borderLeft: '5px solid #17a2b8' }}>
            <div className="read-title">
              <i className="fa-solid fa-heading" style={{ color: 'var(--secondary)' }}></i>{' '}
              {demoHeaderInfo.title || '(টাইটেল নেই)'}
            </div>
            <div className="read-subtitle">
              <b>সাব-টাইটেল:</b> {demoHeaderInfo.subtitle || '(সাব-টাইটেল নেই)'}
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-warning" onClick={startEditDemoHeader}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button className="btn btn-danger" onClick={deleteDemoHeaderSection}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-add"
            style={{ marginBottom: '15px' }}
            onClick={startEditDemoHeader}
          >
            <i className="fa-solid fa-plus"></i> টাইটেল ও সাবটাইটেল যোগ করুন
          </button>
        )}

        <div className="sub-header-title">
          <i className="fa-solid fa-list"></i> ডেমো কুইজের তালিকা:
        </div>

        {/* Demo Quizzes List */}
        <div>
          {demoDataList.map((d, index) => {
            const isEditingThis = editingDemoIdx === index;
            const isDraggingThis = dragItem?.type === 'demo' && dragItem?.index === index;
            const dropPosThis = dropIndicator?.id === `demo-${index}` ? dropIndicator.position : null;

            return (
              <div
                key={index}
                id={`demo-card-${index}`}
                className={`read-box draggable-box demo-drag-item ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drag-over-top' : ''} ${dropPosThis === 'below' ? 'drag-over-bottom' : ''}`}
                style={{
                  borderLeft: isEditingThis ? '6px solid #007bff' : '5px solid #ffc107',
                  background: isEditingThis ? '#ffffff' : '#fdfdfd'
                }}
                draggable={!isEditingThis}
                onDragStart={(e) => handleDragStart(e, 'demo', index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, `demo-${index}`, 'demo', index)}
                onDrop={(e) => handleDrop(e, 'demo', index)}
              >
                {isEditingThis ? (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
                      ডেমো কুইজ #{index + 1} এডিট করুন
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>কুইজ নাম:</label>
                        <input
                          type="text"
                          value={editDemoForm.title}
                          onChange={(e) => setEditDemoForm({ ...editDemoForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>ব্যাজ (যেমন: ফ্রি টেস্ট):</label>
                        <input
                          type="text"
                          value={editDemoForm.badgeText}
                          onChange={(e) => setEditDemoForm({ ...editDemoForm, badgeText: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>সংক্ষিপ্ত বিবরণ:</label>
                        <input
                          type="text"
                          value={editDemoForm.desc}
                          onChange={(e) => setEditDemoForm({ ...editDemoForm, desc: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>কুইজ লিংক (URL):</label>
                        <input
                          type="text"
                          value={editDemoForm.link}
                          onChange={(e) => setEditDemoForm({ ...editDemoForm, link: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="card-actions" style={{ marginTop: '10px' }}>
                      <button className="btn btn-submit" onClick={() => saveInlineDemoEdit(index)}>
                        <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingDemoIdx(null)}>
                        <i className="fa-solid fa-xmark"></i> বাতিল করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="card-header-flex">
                      <div className="read-title">
                        <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস চেপে পজিশন পরিবর্তন করুন"></i>
                        <div className="arrow-btn-group">
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveDemoPosition(index, 'up')}
                            title="উপরে তুলুন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveDemoPosition(index, 'down')}
                            title="নিচে নামান"
                          >
                            ▼
                          </button>
                        </div>
                        ডেমো কুইজ #{index + 1}: {d.title || '(নাম নেই)'}
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-warning" onClick={() => startEditDemo(index)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteSingleDemo(index)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                    <div className="read-subtitle">
                      <b>ব্যাজ:</b> {d.badgeText || 'ফ্রি টেস্ট'}
                    </div>
                    <div className="read-meta">
                      <b>বিবরণ:</b> {d.desc || 'নাই'}
                    </div>
                    <div className="read-preview-text">
                      <b>কুইজ লিংক:</b> {d.link || 'নাই'}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* New Demo Rows */}
        <div>
          {newDemoRows.map((row, rIdx) => (
            <div key={rIdx} className="item-box demo-item-box">
              <div className="row">
                <input
                  type="text"
                  placeholder="কুইজ নাম"
                  className="demo-title"
                  value={row.title}
                  onChange={(e) => updateNewDemoRow(rIdx, 'title', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="ব্যাজ (যেমন: ফ্রি টেস্ট)"
                  className="demo-badge"
                  value={row.badgeText}
                  onChange={(e) => updateNewDemoRow(rIdx, 'badgeText', e.target.value)}
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  className="demo-desc"
                  value={row.desc}
                  onChange={(e) => updateNewDemoRow(rIdx, 'desc', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="কুইজ লিংক (URL)"
                  className="demo-link"
                  value={row.link}
                  onChange={(e) => updateNewDemoRow(rIdx, 'link', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeNewDemoRow(rIdx)}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Action Bar */}
        <div className="section-action-bar" id="demo-action-bar">
          <button type="button" className="btn-add" onClick={addDemoRow}>
            <i className="fa-solid fa-plus"></i> ডেমো কুইজ যোগ করুন
          </button>
          {isDemoReordered && (
            <>
              <button
                type="button"
                className="btn btn-submit"
                onClick={() => {
                  saveHomeConfig({ demos: demoDataList });
                  setIsDemoReordered(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> Save Order
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchHomeConfig()}
              >
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </>
          )}
          {newDemoRows.length > 0 && (
            <button
              type="button"
              className="btn-save-section"
              id="save-demo-btn"
              style={{ display: 'inline-flex' }}
              onClick={() => saveHomeConfig()}
            >
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ৩. PACKAGES CARD */}
      <div className="section-card package-card" id="card-package">
        <div className="section-title">
          <i className="fa-solid fa-box-open" style={{ color: 'var(--warning)' }}></i>
          ৩. প্রিপারেশন প্যাকেজ (Packages)
        </div>

        {/* Package Section Header Info */}
        {isEditingPackageHeader ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasPackageHeader ? 'টাইটেল ও সাবটাইটেল এডিট করুন' : 'নতুন টাইটেল ও সাবটাইটেল যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>সেকশন টাইটেল (Title):</label>
                <input
                  type="text"
                  value={packageHeaderForm.title}
                  onChange={(e) => setPackageHeaderForm({ ...packageHeaderForm, title: e.target.value })}
                  placeholder="যেমন: প্রিপারেশন প্যাকেজ"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>সেকশন সাব-টাইটেল (Subtitle):</label>
                <input
                  type="text"
                  value={packageHeaderForm.subtitle}
                  onChange={(e) => setPackageHeaderForm({ ...packageHeaderForm, subtitle: e.target.value })}
                  placeholder="যেমন: আপনার পছন্দের প্ল্যান নির্বাচন করুন"
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={savePackageHeaderSection}>
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingPackageHeader(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        ) : hasPackageHeader ? (
          <div className="read-box" id="package-header-card" style={{ borderLeft: '5px solid #17a2b8' }}>
            <div className="read-title">
              <i className="fa-solid fa-heading" style={{ color: 'var(--secondary)' }}></i>{' '}
              {packageHeaderInfo.title || '(টাইটেল নেই)'}
            </div>
            <div className="read-subtitle">
              <b>সাব-টাইটেল:</b> {packageHeaderInfo.subtitle || '(সাব-টাইটেল নেই)'}
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-warning" onClick={startEditPackageHeader}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button className="btn btn-danger" onClick={deletePackageHeaderSection}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-add"
            style={{ marginBottom: '15px' }}
            onClick={startEditPackageHeader}
          >
            <i className="fa-solid fa-plus"></i> টাইটেল ও সাবটাইটেল যোগ করুন
          </button>
        )}

        <div className="sub-header-title">
          <i className="fa-solid fa-list"></i> প্যাকেজের তালিকা:
        </div>

        {/* Packages List */}
        <div>
          {packageDataList.map((p, index) => {
            const isEditingThis = editingPackageIdx === index;
            const isDraggingThis = dragItem?.type === 'package' && dragItem?.index === index;
            const dropPosThis = dropIndicator?.id === `package-${index}` ? dropIndicator.position : null;

            return (
              <div
                key={index}
                id={`package-card-${index}`}
                className={`read-box draggable-box package-drag-item ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drag-over-top' : ''} ${dropPosThis === 'below' ? 'drag-over-bottom' : ''}`}
                style={{
                  borderLeft: isEditingThis ? '6px solid #007bff' : '5px solid #ffc107',
                  background: isEditingThis ? '#ffffff' : '#fdfdfd'
                }}
                draggable={!isEditingThis}
                onDragStart={(e) => handleDragStart(e, 'package', index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, `package-${index}`, 'package', index)}
                onDrop={(e) => handleDrop(e, 'package', index)}
              >
                {isEditingThis ? (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
                      প্যাকেজ #{index + 1} এডিট করুন
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>প্যাকেজের নাম:</label>
                        <input
                          type="text"
                          value={editPackageForm.title}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>মূল্য (যেমন: ৳৪৯৯):</label>
                        <input
                          type="text"
                          value={editPackageForm.price}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>মেয়াদ (যেমন: / ৬ মাস):</label>
                        <input
                          type="text"
                          value={editPackageForm.duration}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, duration: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>সংক্ষিপ্ত বিবরণ:</label>
                        <input
                          type="text"
                          value={editPackageForm.desc}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, desc: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>ইমেজ URL:</label>
                        <input
                          type="text"
                          value={editPackageForm.imageUrl}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>বাই লিংক (URL):</label>
                        <input
                          type="text"
                          value={editPackageForm.buyLink}
                          onChange={(e) => setEditPackageForm({ ...editPackageForm, buyLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="card-actions" style={{ marginTop: '10px' }}>
                      <button className="btn btn-submit" onClick={() => saveInlinePackageEdit(index)}>
                        <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingPackageIdx(null)}>
                        <i className="fa-solid fa-xmark"></i> বাতিল করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="card-header-flex">
                      <div className="read-title">
                        <i className="fa-solid fa-grip-vertical drag-handle" title="মাউস চেপে পজিশন পরিবর্তন করুন"></i>
                        <div className="arrow-btn-group">
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => movePackagePosition(index, 'up')}
                            title="উপরে তুলুন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => movePackagePosition(index, 'down')}
                            title="নিচে নামান"
                          >
                            ▼
                          </button>
                        </div>
                        প্যাকেজ #{index + 1}: {p.title || '(নাম নেই)'}
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-warning" onClick={() => startEditPackage(index)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteSinglePackage(index)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                    <div className="read-subtitle">
                      <b>মূল্য:</b> {p.price || '৳০'} | <b>মেয়াদ:</b> {p.duration || 'নাই'}
                    </div>
                    <div className="read-meta">
                      <b>বিবরণ:</b> {p.desc || 'নাই'}
                    </div>
                    <div className="read-preview-text">
                      <b>ইমেজ URL:</b> {p.imageUrl || 'নাই'} | <b>বাই লিংক:</b> {p.buyLink || '#contact'}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* New Package Rows */}
        <div>
          {newPackageRows.map((row, rIdx) => (
            <div key={rIdx} className="item-box package-item-box">
              <div className="row">
                <input
                  type="text"
                  placeholder="প্যাকেজের নাম"
                  className="pkg-title"
                  value={row.title}
                  onChange={(e) => updateNewPackageRow(rIdx, 'title', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="মূল্য (যেমন: ৳৪৯৯)"
                  className="pkg-price"
                  value={row.price}
                  onChange={(e) => updateNewPackageRow(rIdx, 'price', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="মেয়াদ (যেমন: / ৬ মাস)"
                  className="pkg-duration"
                  value={row.duration}
                  onChange={(e) => updateNewPackageRow(rIdx, 'duration', e.target.value)}
                  required
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  className="pkg-desc"
                  value={row.desc}
                  onChange={(e) => updateNewPackageRow(rIdx, 'desc', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="ইমেজ URL (GitHub/ImgBB Link)"
                  className="pkg-img"
                  value={row.imageUrl}
                  onChange={(e) => updateNewPackageRow(rIdx, 'imageUrl', e.target.value)}
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  placeholder="বাই লিংক (URL)"
                  className="pkg-buylink"
                  value={row.buyLink}
                  onChange={(e) => updateNewPackageRow(rIdx, 'buyLink', e.target.value)}
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeNewPackageRow(rIdx)}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Package Action Bar */}
        <div className="section-action-bar" id="package-action-bar">
          <button type="button" className="btn-add" onClick={addPackageRow}>
            <i className="fa-solid fa-plus"></i> প্যাকেজ যোগ করুন
          </button>
          {isPackageReordered && (
            <>
              <button
                type="button"
                className="btn btn-submit"
                onClick={() => {
                  saveHomeConfig({ packages: packageDataList });
                  setIsPackageReordered(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> Save Order
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchHomeConfig()}
              >
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </>
          )}
          {newPackageRows.length > 0 && (
            <button
              type="button"
              className="btn-save-section"
              id="save-package-btn"
              style={{ display: 'inline-flex' }}
              onClick={() => saveHomeConfig()}
            >
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ৪. MISSION & GOALS CARD */}
      <div className="section-card mission-card" id="card-mission">
        <div className="section-title">
          <i className="fa-solid fa-bullseye" style={{ color: 'var(--purple-btn)' }}></i>
          ৪. আমাদের মিশন ও লক্ষ্য (Mission & Goals)
        </div>

        {isEditingMission ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff', fontSize: '16px' }}>
              {hasMission ? 'মিশন ও লক্ষ্য এডিট করুন' : 'নতুন মিশন ও লক্ষ্য যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group">
                <label>সেকশন টাইটেল:</label>
                <input
                  type="text"
                  value={missionForm.sectionTitle}
                  onChange={(e) => setMissionForm({ ...missionForm, sectionTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>সেকশন সাব-টাইটেল:</label>
                <input
                  type="text"
                  value={missionForm.sectionSubtitle}
                  onChange={(e) => setMissionForm({ ...missionForm, sectionSubtitle: e.target.value })}
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>মিশন টাইটেল:</label>
                <input
                  type="text"
                  value={missionForm.missionTitle}
                  onChange={(e) => setMissionForm({ ...missionForm, missionTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>মিশন বিস্তারিত বিবরণ:</label>
                <textarea
                  rows="2"
                  value={missionForm.missionDesc}
                  onChange={(e) => setMissionForm({ ...missionForm, missionDesc: e.target.value })}
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>লক্ষ্য (Goal) টাইটেল:</label>
                <input
                  type="text"
                  value={missionForm.goalTitle}
                  onChange={(e) => setMissionForm({ ...missionForm, goalTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>লক্ষ্য (Goal) বিস্তারিত বিবরণ:</label>
                <textarea
                  rows="2"
                  value={missionForm.goalDesc}
                  onChange={(e) => setMissionForm({ ...missionForm, goalDesc: e.target.value })}
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '15px' }}>
              <button className="btn btn-submit" onClick={saveMissionSection}>
                <i className="fa-solid fa-floppy-disk"></i> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingMission(false)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        ) : hasMission ? (
          <div className="read-box" style={{ borderLeft: '5px solid var(--purple-btn)' }}>
            <div className="read-title">
              <i className="fa-solid fa-bullseye" style={{ color: 'var(--purple-btn)' }}></i>{' '}
              {missionInfo.sectionTitle}
            </div>
            <div className="read-subtitle">
              <b>সেকশন সাব-টাইটেল:</b> {missionInfo.sectionSubtitle}
            </div>
            <div className="read-meta" style={{ marginTop: '10px' }}>
              <b>{missionInfo.missionTitle}:</b> {missionInfo.missionDesc}
            </div>
            <div className="read-meta" style={{ marginTop: '5px' }}>
              <b>{missionInfo.goalTitle}:</b> {missionInfo.goalDesc}
            </div>
            <div className="card-actions" style={{ marginTop: '15px' }}>
              <button className="btn btn-warning" onClick={startEditMission}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button className="btn btn-danger" onClick={deleteMissionSection}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-add" onClick={startEditMission}>
            <i className="fa-solid fa-plus"></i> মিশন ও লক্ষ্য তথ্য যোগ করুন
          </button>
        )}
      </div>
    </div>
  );
}
