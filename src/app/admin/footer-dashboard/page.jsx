'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultFooterConfig = {
  announcement: { text: '', link: '' },
  header: {
    siteTitle: 'TopMCQ',
    logoUrl: '',
    seoTitle: '',
    faviconUrl: '',
    btnText: 'যোগাযোগ',
    btnLink: '/contact',
    menus: [],
    megaMenus: []
  },
  footer: {
    columns: [
      {
        type: 'info',
        title: 'সাইট তথ্য ও সোশাল লিংক',
        text: 'TopMCQ অনলাইন কুইজ প্ল্যাটফর্ম।',
        fb: '',
        yt: '',
        wa: '',
        tw: '',
        tg: '',
        ln: ''
      },
      {
        type: 'links',
        title: 'প্রয়োজনীয় লিংক',
        links: [
          { title: 'হোম পেজ', url: '/' },
          { title: 'আমাদের সম্পর্কে', url: '/about-us' },
          { title: 'প্যাকেজসমূহ', url: '/packages' },
          { title: 'ফ্রি এমসিকিউ', url: '/free-mcqs' }
        ]
      },
      {
        type: 'links',
        title: 'ক্যাটাগরি',
        links: [
          { title: 'বিসিএস প্রস্তুতি', url: '/quiz?category=bcs' },
          { title: 'ব্যাংক জব', url: '/quiz?category=bank' },
          { title: 'প্রাথমিক শিক্ষক', url: '/quiz?category=primary' }
        ]
      },
      {
        type: 'links',
        title: 'যোগাযোগ',
        links: [
          { title: 'আমাদের সম্পর্কে', url: '/about-us' },
          { title: 'যোগাযোগ করুন', url: '/contact' },
          { title: 'সচরাচর জিজ্ঞাসা (FAQ)', url: '/faq' },
          { title: 'রিফান্ড ও পেমেন্ট পলিসি', url: '/privacy-and-refund-policy' }
        ]
      }
    ]
  },
  copyright: {
    text: '© 2026 TopMCQ. All rights reserved.',
    links: [
      { title: 'FAQ', url: '/faq' },
      { title: 'Privacy & Refund Policy', url: '/privacy-and-refund-policy' },
      { title: 'System Status', url: '/status' }
    ]
  }
};

export default function AdminFooterDashboardPage() {
  const [config, setConfig] = useState(defaultFooterConfig);
  const [loading, setLoading] = useState(true);
  const [hasPendingReorder, setHasPendingReorder] = useState(false);

  // Layout Sub-Objects
  const [announceInfo, setAnnounceInfo] = useState(null);
  const [headerInfo, setHeaderInfo] = useState(null);
  const [footerColumns, setFooterColumns] = useState([]);
  const [copyrightInfo, setCopyrightInfo] = useState({ text: '', links: [] });

  // Column Inline Editing
  const [editingInfoColIdx, setEditingInfoColIdx] = useState(null);
  const [infoColForm, setInfoColForm] = useState({
    title: '',
    text: '',
    fb: '',
    yt: '',
    wa: '',
    tw: '',
    tg: '',
    ln: ''
  });

  const [editingColTitleIdx, setEditingColTitleIdx] = useState(null);
  const [editColTitleForm, setEditColTitleForm] = useState('');

  // Column Link Inline Editing
  const [editingFooterLink, setEditingFooterLink] = useState(null); // { colIdx, lkIdx }
  const [editFooterLinkForm, setEditFooterLinkForm] = useState({ title: '', url: '' });

  // Multi-row Add Links inside Column
  const [addingFooterLinksColIdx, setAddingFooterLinksColIdx] = useState(null);
  const [newFooterLinkRows, setNewFooterLinkRows] = useState([]);

  // Copyright Text Editing
  const [isEditingCopyrightText, setIsEditingCopyrightText] = useState(false);
  const [copyrightTextForm, setCopyrightTextForm] = useState('');

  // Copyright Links Inline Editing
  const [editingCopyLinkIdx, setEditingCopyLinkIdx] = useState(null);
  const [editCopyLinkForm, setEditCopyLinkForm] = useState({ title: '', url: '' });

  // Multi-row Add Copyright Links
  const [isAddingCopyLinks, setIsAddingCopyLinks] = useState(false);
  const [newCopyLinkRows, setNewCopyLinkRows] = useState([]);

  // Drag and Drop Engine
  const [dragItem, setDragItem] = useState(null); // { type: 'col'|'footer-link'|'copy-link', colIdx, index }
  const [dropIndicator, setDropIndicator] = useState(null); // { id, position: 'above'|'below' }

  // Delete Confirmation Floating Bar State
  const [pendingDelete, setPendingDelete] = useState(null); // { message, action }

  // Collapsible Accordion States (false by default = collapsed, true = expanded)
  const [expandedSections, setExpandedSections] = useState({
    sec3: false, // ৩. ফুটার সেটিং (Drag & Drop Columns)
    sec4: false  // ৪. কপিরাইট ও ফুটনোট লিংক
  });
  const [expandedCols, setExpandedCols] = useState({});

  const toggleSection = (secKey) => {
    setExpandedSections((prev) => ({ ...prev, [secKey]: !prev[secKey] }));
  };
  const toggleCol = (colIdx) => {
    setExpandedCols((prev) => ({ ...prev, [colIdx]: !prev[colIdx] }));
  };


  // -------------------------------------------------------------
  // Fetch Layout Configuration
  // -------------------------------------------------------------
  const fetchLayoutConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();

      setConfig(data || defaultFooterConfig);
      setAnnounceInfo(data?.announcement || null);
      setHeaderInfo(data?.header || null);

      const cols = data?.footer?.columns && data.footer.columns.length > 0
        ? data.footer.columns
        : defaultFooterConfig.footer.columns;
      setFooterColumns(JSON.parse(JSON.stringify(cols)));

      const cop = data?.copyright || defaultFooterConfig.copyright;
      setCopyrightInfo({
        text: cop.text !== undefined ? cop.text : defaultFooterConfig.copyright.text,
        links: cop.links ? JSON.parse(JSON.stringify(cop.links)) : []
      });

      setHasPendingReorder(false);
    } catch (err) {
      console.error('Layout Config Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutConfig();
  }, []);

  // -------------------------------------------------------------
  // Save to DB Helper
  // -------------------------------------------------------------
  const saveLayoutConfig = async (overrideCols = null, overrideCopyright = null) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return false;
    }

    const colsToSave = overrideCols !== null ? overrideCols : footerColumns;
    const copToSave = overrideCopyright !== null ? overrideCopyright : copyrightInfo;

    const payload = {
      ...config,
      announcement: announceInfo,
      header: headerInfo,
      footer: {
        ...(config.footer || {}),
        columns: colsToSave
      },
      copyright: copToSave
    };

    try {
      const res = await fetch('/api/layout-config', {
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
        setConfig(payload);
        setHasPendingReorder(false);
        try {
          const prev = JSON.parse(localStorage.getItem('layout_config_data') || '{}');
          localStorage.setItem('layout_config_data', JSON.stringify({ ...prev, ...payload }));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('layout-updated'));
        }
        return true;
      } else {
        showTopAlert('❌ ' + (result.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
        return false;
      }
    } catch (err) {
      console.error('Layout Save error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
      return false;
    }
  };

  // -------------------------------------------------------------
  // Reorder & Action Bar Handlers
  // -------------------------------------------------------------
  const triggerGlobalSaveBar = () => {
    setHasPendingReorder(true);
  };

  const saveReorderedLayout = async () => {
    await saveLayoutConfig();
  };

  const cancelReorder = async () => {
    setHasPendingReorder(false);
    await fetchLayoutConfig();
  };

  // -------------------------------------------------------------
  // Column Level Operations
  // -------------------------------------------------------------
  const addNewColumn = async (type) => {
    let updated;
    if (type === 'info') {
      updated = [
        ...footerColumns,
        {
          type: 'info',
          title: 'নতুন তথ্য কলাম',
          text: 'সাইট সম্পর্কিত তথ্য...',
          fb: '',
          yt: '',
          wa: '',
          tw: '',
          tg: '',
          ln: ''
        }
      ];
    } else {
      updated = [
        ...footerColumns,
        {
          type: 'links',
          title: 'নতুন লিংক কলাম',
          links: []
        }
      ];
    }
    setFooterColumns(updated);
    await saveLayoutConfig(updated);
  };

  const deleteFooterColumn = (colIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে পুরো কলামটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = footerColumns.filter((_, idx) => idx !== colIdx);
        setFooterColumns(updated);
        await saveLayoutConfig(updated);
      }
    });
  };

  const moveColumnPosition = (colIdx, direction) => {
    const cols = [...footerColumns];
    if (direction === 'up' && colIdx > 0) {
      const item = cols.splice(colIdx, 1)[0];
      cols.splice(colIdx - 1, 0, item);
      setFooterColumns(cols);
      triggerGlobalSaveBar();
    } else if (direction === 'down' && colIdx < cols.length - 1) {
      const item = cols.splice(colIdx, 1)[0];
      cols.splice(colIdx + 1, 0, item);
      setFooterColumns(cols);
      triggerGlobalSaveBar();
    }
  };

  // Edit Info Column
  const startEditFooterInfo = (colIdx) => {
    const col = footerColumns[colIdx];
    setEditingInfoColIdx(colIdx);
    setInfoColForm({
      title: col.title || '',
      text: col.text || '',
      fb: col.fb || '',
      yt: col.yt || '',
      wa: col.wa || '',
      tw: col.tw || '',
      tg: col.tg || '',
      ln: col.ln || ''
    });
  };

  const saveFooterInfoInline = async (colIdx) => {
    const updated = [...footerColumns];
    updated[colIdx] = {
      ...updated[colIdx],
      title: infoColForm.title.trim(),
      text: infoColForm.text.trim(),
      fb: infoColForm.fb.trim(),
      yt: infoColForm.yt.trim(),
      wa: infoColForm.wa.trim(),
      tw: infoColForm.tw.trim(),
      tg: infoColForm.tg.trim(),
      ln: infoColForm.ln.trim()
    };
    setFooterColumns(updated);
    setEditingInfoColIdx(null);
    await saveLayoutConfig(updated);
  };

  // Rename Links Column Title
  const startEditFooterTitle = (colIdx) => {
    const col = footerColumns[colIdx];
    setEditingColTitleIdx(colIdx);
    setEditColTitleForm(col.title || '');
  };

  const saveFooterTitleInline = async (colIdx) => {
    const updated = [...footerColumns];
    updated[colIdx].title = editColTitleForm.trim();
    setFooterColumns(updated);
    setEditingColTitleIdx(null);
    await saveLayoutConfig(updated);
  };

  // -------------------------------------------------------------
  // Links inside Column Operations
  // -------------------------------------------------------------
  const moveFooterLinkPosition = (colIdx, lkIdx, direction) => {
    const updated = [...footerColumns];
    const list = [...(updated[colIdx].links || [])];
    if (direction === 'up' && lkIdx > 0) {
      const item = list.splice(lkIdx, 1)[0];
      list.splice(lkIdx - 1, 0, item);
      updated[colIdx].links = list;
      setFooterColumns(updated);
      triggerGlobalSaveBar();
    } else if (direction === 'down' && lkIdx < list.length - 1) {
      const item = list.splice(lkIdx, 1)[0];
      list.splice(lkIdx + 1, 0, item);
      updated[colIdx].links = list;
      setFooterColumns(updated);
      triggerGlobalSaveBar();
    }
  };

  const startEditFooterLink = (colIdx, lkIdx) => {
    const lk = footerColumns[colIdx].links[lkIdx];
    setEditingFooterLink({ colIdx, lkIdx });
    setEditFooterLinkForm({
      title: lk.title || '',
      url: lk.url || ''
    });
  };

  const saveFooterLinkInline = async (colIdx, lkIdx) => {
    const updated = [...footerColumns];
    updated[colIdx].links[lkIdx] = {
      title: editFooterLinkForm.title.trim(),
      url: editFooterLinkForm.url.trim() || '#'
    };
    setFooterColumns(updated);
    setEditingFooterLink(null);
    await saveLayoutConfig(updated);
  };

  const deleteFooterLink = (colIdx, lkIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই লিংকটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...footerColumns];
        updated[colIdx].links.splice(lkIdx, 1);
        setFooterColumns(updated);
        await saveLayoutConfig(updated);
      }
    });
  };

  // Multi-row Add Links Form in Column
  const openAddFooterLinkForm = (colIdx) => {
    setAddingFooterLinksColIdx(colIdx);
    setNewFooterLinkRows([{ title: '', url: '' }]);
  };

  const addNewFooterLinkRow = () => {
    setNewFooterLinkRows([...newFooterLinkRows, { title: '', url: '' }]);
  };

  const updateNewFooterLinkRow = (index, field, value) => {
    const rows = [...newFooterLinkRows];
    rows[index][field] = value;
    setNewFooterLinkRows(rows);
  };

  const removeNewFooterLinkRow = (index) => {
    const rows = newFooterLinkRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setAddingFooterLinksColIdx(null);
      setNewFooterLinkRows([]);
    } else {
      setNewFooterLinkRows(rows);
    }
  };

  const saveAllNewFooterLinks = async (colIdx) => {
    const validRows = newFooterLinkRows
      .filter(r => r.title.trim())
      .map(r => ({ title: r.title.trim(), url: r.url.trim() || '#' }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি লিংক পূরণ করুন!', 'warning');
      return;
    }

    const updated = [...footerColumns];
    if (!updated[colIdx].links) updated[colIdx].links = [];
    updated[colIdx].links.push(...validRows);

    setFooterColumns(updated);
    setAddingFooterLinksColIdx(null);
    setNewFooterLinkRows([]);
    await saveLayoutConfig(updated);
  };

  // -------------------------------------------------------------
  // Copyright & Footnote Operations
  // -------------------------------------------------------------
  const startEditCopyrightText = () => {
    setCopyrightTextForm(copyrightInfo.text || '');
    setIsEditingCopyrightText(true);
  };

  const saveCopyrightTextInline = async () => {
    const updatedCop = {
      ...copyrightInfo,
      text: copyrightTextForm.trim()
    };
    setCopyrightInfo(updatedCop);
    setIsEditingCopyrightText(false);
    await saveLayoutConfig(null, updatedCop);
  };

  const deleteCopyrightText = () => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে কপিরাইট টেক্সট মুছে ফেলতে চান?',
      action: async () => {
        const updatedCop = { ...copyrightInfo, text: '' };
        setCopyrightInfo(updatedCop);
        await saveLayoutConfig(null, updatedCop);
      }
    });
  };

  const moveCopyLinkPosition = (lkIdx, direction) => {
    const updatedCop = { ...copyrightInfo };
    const list = [...(updatedCop.links || [])];
    if (direction === 'up' && lkIdx > 0) {
      const item = list.splice(lkIdx, 1)[0];
      list.splice(lkIdx - 1, 0, item);
      updatedCop.links = list;
      setCopyrightInfo(updatedCop);
      triggerGlobalSaveBar();
    } else if (direction === 'down' && lkIdx < list.length - 1) {
      const item = list.splice(lkIdx, 1)[0];
      list.splice(lkIdx + 1, 0, item);
      updatedCop.links = list;
      setCopyrightInfo(updatedCop);
      triggerGlobalSaveBar();
    }
  };

  const startEditCopyLink = (lkIdx) => {
    const lk = copyrightInfo.links[lkIdx];
    setEditingCopyLinkIdx(lkIdx);
    setEditCopyLinkForm({
      title: lk.title || '',
      url: lk.url || ''
    });
  };

  const saveCopyLinkInline = async (lkIdx) => {
    const updatedCop = { ...copyrightInfo };
    updatedCop.links[lkIdx] = {
      title: editCopyLinkForm.title.trim(),
      url: editCopyLinkForm.url.trim() || '#'
    };
    setCopyrightInfo(updatedCop);
    setEditingCopyLinkIdx(null);
    await saveLayoutConfig(null, updatedCop);
  };

  const deleteCopyLink = (lkIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই লিংকটি মুছে ফেলতে চান?',
      action: async () => {
        const updatedCop = { ...copyrightInfo };
        updatedCop.links.splice(lkIdx, 1);
        setCopyrightInfo(updatedCop);
        await saveLayoutConfig(null, updatedCop);
      }
    });
  };

  // Multi-row Add Copyright Links
  const openAddCopyLinkForm = () => {
    setIsAddingCopyLinks(true);
    setNewCopyLinkRows([{ title: '', url: '' }]);
  };

  const addNewCopyLinkRow = () => {
    setNewCopyLinkRows([...newCopyLinkRows, { title: '', url: '' }]);
  };

  const updateNewCopyLinkRow = (index, field, value) => {
    const rows = [...newCopyLinkRows];
    rows[index][field] = value;
    setNewCopyLinkRows(rows);
  };

  const removeNewCopyLinkRow = (index) => {
    const rows = newCopyLinkRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setIsAddingCopyLinks(false);
      setNewCopyLinkRows([]);
    } else {
      setNewCopyLinkRows(rows);
    }
  };

  const saveAllNewCopyLinks = async () => {
    const validRows = newCopyLinkRows
      .filter(r => r.title.trim())
      .map(r => ({ title: r.title.trim(), url: r.url.trim() || '#' }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি লিংক পূরণ করুন!', 'warning');
      return;
    }

    const updatedCop = {
      ...copyrightInfo,
      links: [...(copyrightInfo.links || []), ...validRows]
    };

    setCopyrightInfo(updatedCop);
    setIsAddingCopyLinks(false);
    setNewCopyLinkRows([]);
    await saveLayoutConfig(null, updatedCop);
  };

  // -------------------------------------------------------------
  // Drag and Drop Engine
  // -------------------------------------------------------------
  const handleDragStart = (e, type, colIdx, index) => {
    e.stopPropagation();
    const data = {
      type: String(type),
      colIdx: colIdx !== undefined && colIdx !== null ? Number(colIdx) : null,
      index: index !== undefined && index !== null ? Number(index) : null
    };
    setDragItem(data);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setDragItem(null);
    setDropIndicator(null);
  };

  const handleDragOver = (e, targetId, targetType, targetColIdx, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== targetType) return;

    if (dragItem.type === 'footer-link' && dragItem.colIdx !== targetColIdx) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropIndicator({ id: targetId, position: pos });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType, targetColIdx, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropIndicator?.position || 'below';
    setDropIndicator(null);

    if (!dragItem || dragItem.type !== String(targetType)) {
      setDragItem(null);
      return;
    }

    if (targetType === 'col') {
      const cols = [...footerColumns];
      const fromIdx = dragItem.colIdx;
      const toIdx = targetColIdx;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = cols.splice(fromIdx, 1)[0];
          cols.splice(insertIdx, 0, moved);
          setFooterColumns(cols);
          triggerGlobalSaveBar();
        }
      }
    } else if (targetType === 'footer-link') {
      if (dragItem.colIdx !== targetColIdx) return;
      const cols = [...footerColumns];
      const linkList = [...(cols[targetColIdx].links || [])];
      const fromIdx = dragItem.index;
      const toIdx = targetIndex;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = linkList.splice(fromIdx, 1)[0];
          linkList.splice(insertIdx, 0, moved);
          cols[targetColIdx].links = linkList;
          setFooterColumns(cols);
          triggerGlobalSaveBar();
        }
      }
    } else if (targetType === 'copy-link') {
      const updatedCop = { ...copyrightInfo };
      const linkList = [...(updatedCop.links || [])];
      const fromIdx = dragItem.index;
      const toIdx = targetIndex;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = linkList.splice(fromIdx, 1)[0];
          linkList.splice(insertIdx, 0, moved);
          updatedCop.links = linkList;
          setCopyrightInfo(updatedCop);
          triggerGlobalSaveBar();
        }
      }
    }

    setDragItem(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#17a2b8' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>ফুটার কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  const copyText = copyrightInfo.text || '';
  const copyLinks = copyrightInfo.links || [];

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
        .section-card.footer-card { border-left: 6px solid var(--secondary); }
        .section-card.copy-card { border-left: 6px solid var(--purple-btn); }

        .section-title {
          font-size: 20px;
          color: var(--dark);
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px dashed #e2e8f0;
        }

        .read-box {
          background: #fdfdfd;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 5px solid #20c997;
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
          gap: 8px;
        }
        .read-subtitle { font-size: 14px; color: #555; margin-top: 8px; }
        .read-meta { font-size: 13px; color: #555; margin-bottom: 6px; }

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

        .row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: nowrap; align-items: center; }
        .card-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

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
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-warning:hover { background-color: #e0a800; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-danger:hover { background-color: #c82333; }
        .btn-submit { background-color: #28a745; color: white; }
        .btn-submit:hover { background-color: #218838; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn-secondary:hover { background-color: #5a6268; }
        .btn-info { background-color: #17a2b8; color: white; }
        .btn-info:hover { background-color: #138496; }
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

        .btn-icon-danger {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
        }
        .btn-icon-danger:hover { background-color: #c82333; }

        .sub-menu-list {
          margin-top: 10px;
          padding-left: 15px;
          border-left: 3px solid #17a2b8;
          margin-bottom: 12px;
        }
        .sub-menu-item {
          background: #ffffff;
          padding: 8px 12px;
          border: 1px dashed #cbd5e1;
          border-radius: 5px;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drag-handle, .col-drag-handle {
          cursor: grab;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 13px;
          margin-right: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .col-drag-handle { font-size: 16px; padding: 6px 8px; }
        .drag-handle:hover, .col-drag-handle:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .drag-handle:active, .col-drag-handle:active { cursor: grabbing; }

        .arrow-btn-group { display: inline-flex; flex-direction: column; gap: 2px; margin-right: 10px; }
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
        .btn-arrow:hover { background: #007bff; color: #ffffff; }

        .col-drag-item, .footer-drag-item, .copy-drag-item { position: relative; transition: opacity 0.15s ease; }
        .dragging-col, .dragging { opacity: 0.4; background: #eef6ff !important; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }

        .drag-over-top::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: var(--primary);
          z-index: 100;
          border-radius: 2px;
        }
        .drag-over-bottom::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: var(--primary);
          z-index: 100;
          border-radius: 2px;
        }

        #reorder-action-bar, #delete-confirm-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #2c3e50;
          padding: 15px;
          border-top: 4px solid #ffc107;
          z-index: 9999;
          box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.2);
          justify-content: center;
          align-items: center;
          gap: 20px;
          animation: slideUp 0.3s ease;
        }
        #delete-confirm-bar {
          border-top: 4px solid #dc3545;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* ৩. FOOTER SETTINGS CARD */}
      <div className="section-card footer-card" style={{ marginBottom: '20px' }}>
        <div
          className="section-title"
          onClick={() => toggleSection('sec3')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: 0,
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            userSelect: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            <i className="fa-solid fa-table-columns" style={{ color: 'var(--secondary)' }}></i>
            ৩. ফুটার সেটিং (Drag & Drop Columns)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <i className={'fa-solid fa-chevron-' + (expandedSections.sec3 ? 'down' : 'right')}></i>
          </div>
        </div>

        {expandedSections.sec3 && (
          <div style={{ marginTop: '16px' }}>

        {/* Footer Columns List */}
        <div>
          {footerColumns.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>কোনো ফুটার কলাম নেই। নিচের বাটনে ক্লিক করে যোগ করুন।</p>
          ) : (
            footerColumns.map((col, colIdx) => {
              const isEditingInfoThis = editingInfoColIdx === colIdx;
              const isEditingTitleThis = editingColTitleIdx === colIdx;
              const isAddingLinksThis = addingFooterLinksColIdx === colIdx;

              const isDraggingCol = dragItem?.type === 'col' && dragItem?.colIdx === colIdx;
              const dropPosCol = dropIndicator?.id === `col-${colIdx}` ? dropIndicator.position : null;

              if (col.type === 'info') {
                let activeSocials = [];
                if (col.fb) activeSocials.push('Facebook');
                if (col.yt) activeSocials.push('YouTube');
                if (col.wa) activeSocials.push('WhatsApp');
                if (col.tw) activeSocials.push('Twitter');
                if (col.tg) activeSocials.push('Telegram');
                if (col.ln) activeSocials.push('LinkedIn');
                const socialPreview = activeSocials.length > 0 ? activeSocials.join(', ') : 'কোনো সোশ্যাল লিংক যুক্ত করা হয়নি';

                return (
                  <div
                    key={colIdx}
                    id={`footer-col-${colIdx}`}
                    className={`read-box col-drag-item ${isDraggingCol ? 'dragging-col' : ''} ${dropPosCol === 'above' ? 'drag-over-top' : ''} ${dropPosCol === 'below' ? 'drag-over-bottom' : ''}`}
                    style={{ borderLeft: '5px solid #17a2b8' }}
                    draggable={!isEditingInfoThis}
                    onDragStart={(e) => handleDragStart(e, 'col', colIdx, null)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, `col-${colIdx}`, 'col', colIdx, null)}
                    onDrop={(e) => handleDrop(e, 'col', colIdx, null)}
                  >
                    {isEditingInfoThis ? (
                      <div style={{ background: '#ffffff' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#17a2b8' }}>
                          সাইট তথ্য এডিট করুন
                        </div>
                        <div className="form-group">
                          <label>কলাম টাইটেল:</label>
                          <input
                            type="text"
                            value={infoColForm.title}
                            onChange={(e) => setInfoColForm({ ...infoColForm, title: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>সাইট সম্পর্কে বিবরণ:</label>
                          <textarea
                            rows="2"
                            value={infoColForm.text}
                            onChange={(e) => setInfoColForm({ ...infoColForm, text: e.target.value })}
                          />
                        </div>
                        <div className="row">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-facebook" style={{ color: '#1877f2' }}></i> Facebook URL:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.fb}
                              onChange={(e) => setInfoColForm({ ...infoColForm, fb: e.target.value })}
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-youtube" style={{ color: '#ff0000' }}></i> YouTube URL:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.yt}
                              onChange={(e) => setInfoColForm({ ...infoColForm, yt: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-whatsapp" style={{ color: '#25d366' }}></i> WhatsApp Link:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.wa}
                              onChange={(e) => setInfoColForm({ ...infoColForm, wa: e.target.value })}
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-x-twitter" style={{ color: '#000000' }}></i> Twitter URL:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.tw}
                              onChange={(e) => setInfoColForm({ ...infoColForm, tw: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-telegram" style={{ color: '#0088cc' }}></i> Telegram Link:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.tg}
                              onChange={(e) => setInfoColForm({ ...infoColForm, tg: e.target.value })}
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>
                              <i className="fa-brands fa-linkedin" style={{ color: '#0a66c2' }}></i> LinkedIn URL:
                            </label>
                            <input
                              type="text"
                              value={infoColForm.ln}
                              onChange={(e) => setInfoColForm({ ...infoColForm, ln: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="card-actions" style={{ marginTop: '10px' }}>
                          <button className="btn btn-submit" onClick={() => saveFooterInfoInline(colIdx)}>
                            <i className="fa-solid fa-floppy-disk"></i> Save Changes
                          </button>
                          <button className="btn btn-secondary" onClick={() => setEditingInfoColIdx(null)}>
                            <i className="fa-solid fa-xmark"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="card-header-flex"
                          onClick={(e) => {
                            if (!e.target.closest('.card-actions') && !e.target.closest('button') && !e.target.closest('input')) {
                              toggleCol(colIdx);
                            }
                          }}
                          style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedCols[colIdx] ? '10px' : '0' }}
                        >
                          <div>
                            <div className="read-title">
                              <i
                                className="fa-solid fa-grip-vertical col-drag-handle"
                                title="কলামের পজিশন পরিবর্তন করতে ড্র্যাগ করুন"
                                onClick={(e) => e.stopPropagation()}
                              ></i>
                              <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="btn-arrow"
                                  onClick={() => moveColumnPosition(colIdx, 'up')}
                                  title="উপরে তুলুন"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  className="btn-arrow"
                                  onClick={() => moveColumnPosition(colIdx, 'down')}
                                  title="নিচে নামান"
                                >
                                  ▼
                                </button>
                              </div>
                              <i className="fa-solid fa-circle-info" style={{ color: '#17a2b8' }}></i> {col.title}
                              <i className={'fa-solid fa-chevron-' + (expandedCols[colIdx] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                            </div>
                          </div>
                          <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-warning" onClick={() => startEditFooterInfo(colIdx)}>
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => deleteFooterColumn(colIdx)}>
                              <i className="fa-solid fa-trash"></i> Delete Column
                            </button>
                          </div>
                        </div>

                        {expandedCols[colIdx] && (
                          <div>
                            <div className="read-subtitle">
                              <b>About Text:</b> {col.text}
                            </div>
                            <div className="read-meta">
                              <b>Active Social Links:</b> {socialPreview}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }

              // Links Column
              const linksList = col.links || [];

              return (
                <div
                  key={colIdx}
                  id={`footer-col-${colIdx}`}
                  className={`read-box col-drag-item ${isDraggingCol ? 'dragging-col' : ''} ${dropPosCol === 'above' ? 'drag-over-top' : ''} ${dropPosCol === 'below' ? 'drag-over-bottom' : ''}`}
                  style={{ borderLeft: '5px solid #17a2b8' }}
                  draggable={!isEditingTitleThis}
                  onDragStart={(e) => handleDragStart(e, 'col', colIdx, null)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, `col-${colIdx}`, 'col', colIdx, null)}
                  onDrop={(e) => handleDrop(e, 'col', colIdx, null)}
                >
                  {isEditingTitleThis ? (
                    <div style={{ background: '#ffffff' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#17a2b8' }}>
                        কলাম টাইটেল এডিট করুন
                      </div>
                      <div className="form-group">
                        <label>কলাম টাইটেল:</label>
                        <input
                          type="text"
                          value={editColTitleForm}
                          onChange={(e) => setEditColTitleForm(e.target.value)}
                        />
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-submit" onClick={() => saveFooterTitleInline(colIdx)}>
                          <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditingColTitleIdx(null)}>
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="card-header-flex"
                        onClick={(e) => {
                          if (!e.target.closest('.card-actions') && !e.target.closest('button') && !e.target.closest('input')) {
                            toggleCol(colIdx);
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedCols[colIdx] ? '10px' : '0' }}
                      >
                        <div>
                          <div className="read-title">
                            <i
                              className="fa-solid fa-grip-vertical col-drag-handle"
                              title="কলামের পজিশন পরিবর্তন করতে ড্র্যাগ করুন"
                              onClick={(e) => e.stopPropagation()}
                            ></i>
                            <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveColumnPosition(colIdx, 'up')}
                                title="উপরে তুলুন"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveColumnPosition(colIdx, 'down')}
                                title="নিচে নামান"
                              >
                                ▼
                              </button>
                            </div>
                            <i className="fa-solid fa-list" style={{ color: '#17a2b8' }}></i> {col.title}
                            <i className={'fa-solid fa-chevron-' + (expandedCols[colIdx] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                          </div>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-warning" onClick={() => startEditFooterTitle(colIdx)}>
                            <i className="fa-solid fa-pen-to-square"></i> Edit Title
                          </button>
                          <button className="btn btn-danger" onClick={() => deleteFooterColumn(colIdx)}>
                            <i className="fa-solid fa-trash"></i> Delete Column
                          </button>
                        </div>
                      </div>

                      {expandedCols[colIdx] && (
                        <>
                          {/* Links in this Column */}
                          {linksList.length > 0 && (
                        <div className="sub-menu-list footer-drag-container">
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                            লিংক সমূহ (মাউস দিয়ে পজিশন ড্র্যাগ করা যাবে):
                          </div>
                          {linksList.map((lk, lkIdx) => {
                            const isEditingThisLink =
                              editingFooterLink?.colIdx === colIdx && editingFooterLink?.lkIdx === lkIdx;
                            const isDraggingLink =
                              dragItem?.type === 'footer-link' &&
                              dragItem?.colIdx === colIdx &&
                              dragItem?.index === lkIdx;
                            const dropPosLink =
                              dropIndicator?.id === `flink-${colIdx}-${lkIdx}`
                                ? dropIndicator.position
                                : null;

                            return (
                              <div
                                key={lkIdx}
                                id={`footer-link-item-${colIdx}-${lkIdx}`}
                                className={`sub-menu-item footer-drag-item ${isDraggingLink ? 'dragging' : ''} ${dropPosLink === 'above' ? 'drag-over-top' : ''} ${dropPosLink === 'below' ? 'drag-over-bottom' : ''}`}
                                draggable={!isEditingThisLink}
                                onDragStart={(e) => handleDragStart(e, 'footer-link', colIdx, lkIdx)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) =>
                                  handleDragOver(e, `flink-${colIdx}-${lkIdx}`, 'footer-link', colIdx, lkIdx)
                                }
                                onDrop={(e) => handleDrop(e, 'footer-link', colIdx, lkIdx)}
                                style={{
                                  display: isEditingThisLink ? 'block' : 'flex'
                                }}
                              >
                                {isEditingThisLink ? (
                                  <div>
                                    <div className="row" style={{ marginBottom: '5px' }}>
                                      <input
                                        type="text"
                                        value={editFooterLinkForm.title}
                                        onChange={(e) =>
                                          setEditFooterLinkForm({ ...editFooterLinkForm, title: e.target.value })
                                        }
                                        style={{ flex: 1 }}
                                      />
                                      <input
                                        type="text"
                                        value={editFooterLinkForm.url}
                                        onChange={(e) =>
                                          setEditFooterLinkForm({ ...editFooterLinkForm, url: e.target.value })
                                        }
                                        style={{ flex: 1 }}
                                      />
                                    </div>
                                    <div className="card-actions" style={{ marginTop: '5px' }}>
                                      <button
                                        className="btn btn-submit btn-sm"
                                        onClick={() => saveFooterLinkInline(colIdx, lkIdx)}
                                      >
                                        <i className="fa-solid fa-floppy-disk"></i> Save
                                      </button>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingFooterLink(null)}
                                      >
                                        <i className="fa-solid fa-xmark"></i> Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <i
                                        className="fa-solid fa-grip-vertical drag-handle"
                                        title="মাউস চেপে পজিশন পরিবর্তন করুন"
                                      ></i>
                                      <div className="arrow-btn-group">
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveFooterLinkPosition(colIdx, lkIdx, 'up')}
                                          title="উপরে তুলুন"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveFooterLinkPosition(colIdx, lkIdx, 'down')}
                                          title="নিচে নামান"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <b>{lk.title}</b>{' '}
                                      <small style={{ color: '#777', marginLeft: '5px' }}>({lk.url || '#'})</small>
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => startEditFooterLink(colIdx, lkIdx)}
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteFooterLink(colIdx, lkIdx)}
                                      >
                                        <i className="fa-solid fa-trash"></i> Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-row Add Links Form */}
                      {isAddingLinksThis && (
                        <div
                          style={{
                            marginTop: '10px',
                            background: '#f8fafc',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 'bold',
                              fontSize: '13px',
                              color: '#17a2b8',
                              marginBottom: '10px'
                            }}
                          >
                            <span>নতুন লিংক যোগ করুন:</span>
                          </div>

                          {newFooterLinkRows.map((row, rIdx) => (
                            <div
                              key={rIdx}
                              className="row"
                              style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}
                            >
                              <input
                                type="text"
                                placeholder="লিংক টাইটেল"
                                value={row.title}
                                onChange={(e) => updateNewFooterLinkRow(rIdx, 'title', e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <input
                                type="text"
                                placeholder="URL"
                                value={row.url}
                                onChange={(e) => updateNewFooterLinkRow(rIdx, 'url', e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeNewFooterLinkRow(rIdx)}
                                title="মুছে ফেলুন"
                                style={{ height: '38px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                              >
                                <i className="fa-solid fa-trash"></i> Delete
                              </button>
                            </div>
                          ))}

                          <div className="card-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={addNewFooterLinkRow}
                              title="আরও একটি লিংক রো যোগ করুন"
                            >
                              <i className="fa-solid fa-plus"></i> আরও যোগ করুন
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-submit"
                                onClick={() => saveAllNewFooterLinks(colIdx)}
                              >
                                <i className="fa-solid fa-floppy-disk"></i> Save Links
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setAddingFooterLinksColIdx(null);
                                  setNewFooterLinkRows([]);
                                }}
                              >
                                <i className="fa-solid fa-xmark"></i> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isAddingLinksThis && (
                        <div className="card-actions" style={{ marginTop: '10px' }}>
                          <button
                            className="btn btn-info"
                            onClick={() => openAddFooterLinkForm(colIdx)}
                          >
                            <i className="fa-solid fa-plus"></i> লিংক যোগ করুন
                          </button>
                        </div>
                      )}
                      </>
                      )}
                      </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action Bar for Adding Columns */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-info" onClick={() => addNewColumn('info')}>
            <i className="fa-solid fa-plus"></i> Info Column যোগ
          </button>
          <button className="btn btn-add" onClick={() => addNewColumn('links')}>
            <i className="fa-solid fa-plus"></i> Links Column যোগ
          </button>
        </div>
          </div>
        )}
      </div>

      {/* ৪. COPYRIGHT SETTINGS CARD */}
      <div className="section-card copy-card" style={{ marginBottom: '20px' }}>
        <div
          className="section-title"
          onClick={() => toggleSection('sec4')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: 0,
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            userSelect: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            <i className="fa-solid fa-copyright" style={{ color: 'var(--purple-btn)' }}></i>
            ৪. কপিরাইট ও ফুটনোট লিংক
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <i className={'fa-solid fa-chevron-' + (expandedSections.sec4 ? 'down' : 'right')}></i>
          </div>
        </div>

        {expandedSections.sec4 && (
          <div style={{ marginTop: '16px' }}>

        {/* Copyright Text */}
        {isEditingCopyrightText ? (
          <div
            className="read-box"
            style={{
              borderLeft: '5px solid #007bff',
              background: '#ffffff',
              padding: '15px 18px',
              marginBottom: '15px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>
              {copyText ? 'কপিরাইট টেক্সট এডিট করুন' : 'নতুন কপিরাইট যোগ করুন'}
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <input
                type="text"
                value={copyrightTextForm}
                onChange={(e) => setCopyrightTextForm(e.target.value)}
                style={{ flex: 1 }}
                placeholder="যেমন: © 2026 TopMCQ. All rights reserved."
              />
              <button className="btn btn-submit btn-sm" onClick={saveCopyrightTextInline}>
                <i className="fa-solid fa-floppy-disk"></i> Save
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditingCopyrightText(false)}
              >
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        ) : copyText ? (
          <div
            className="read-box"
            style={{
              borderLeft: '5px solid var(--purple-btn)',
              marginBottom: '15px',
              padding: '12px 18px'
            }}
          >
            <div className="card-header-flex" style={{ marginBottom: 0, alignItems: 'center' }}>
              <div>
                <div className="read-title" style={{ marginBottom: 0 }}>
                  <i className="fa-solid fa-copyright"></i> {copyText}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-warning btn-sm" onClick={startEditCopyrightText}>
                  <i className="fa-solid fa-pen-to-square"></i> Edit Text
                </button>
                <button className="btn btn-danger btn-sm" onClick={deleteCopyrightText}>
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <button className="btn btn-add btn-sm" onClick={startEditCopyrightText}>
              <i className="fa-solid fa-plus"></i> কপিরাইট টেক্সট যোগ করুন
            </button>
          </div>
        )}

        {/* Copyright Links List */}
        {copyLinks.length > 0 && (
          <div className="sub-menu-list copy-drag-container" style={{ borderLeftColor: 'var(--purple-btn)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
              কপিরাইট লিংক সমূহ (FAQ, Terms, Privacy):
            </div>
            {copyLinks.map((lk, lkIdx) => {
              const isEditingThis = editingCopyLinkIdx === lkIdx;
              const isDraggingLink = dragItem?.type === 'copy-link' && dragItem?.index === lkIdx;
              const dropPosLink =
                dropIndicator?.id === `clink-${lkIdx}` ? dropIndicator.position : null;

              return (
                <div
                  key={lkIdx}
                  id={`copy-link-item-${lkIdx}`}
                  className={`sub-menu-item copy-drag-item ${isDraggingLink ? 'dragging' : ''} ${dropPosLink === 'above' ? 'drag-over-top' : ''} ${dropPosLink === 'below' ? 'drag-over-bottom' : ''}`}
                  draggable={!isEditingThis}
                  onDragStart={(e) => handleDragStart(e, 'copy-link', null, lkIdx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, `clink-${lkIdx}`, 'copy-link', null, lkIdx)}
                  onDrop={(e) => handleDrop(e, 'copy-link', null, lkIdx)}
                  style={{
                    display: isEditingThis ? 'block' : 'flex'
                  }}
                >
                  {isEditingThis ? (
                    <div>
                      <div className="row" style={{ marginBottom: '5px' }}>
                        <input
                          type="text"
                          value={editCopyLinkForm.title}
                          onChange={(e) =>
                            setEditCopyLinkForm({ ...editCopyLinkForm, title: e.target.value })
                          }
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          value={editCopyLinkForm.url}
                          onChange={(e) =>
                            setEditCopyLinkForm({ ...editCopyLinkForm, url: e.target.value })
                          }
                          style={{ flex: 1 }}
                        />
                      </div>
                      <div className="card-actions" style={{ marginTop: '5px' }}>
                        <button
                          className="btn btn-submit btn-sm"
                          onClick={() => saveCopyLinkInline(lkIdx)}
                        >
                          <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingCopyLinkIdx(null)}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <i
                          className="fa-solid fa-grip-vertical drag-handle"
                          title="মাউস চেপে পজিশন পরিবর্তন করুন"
                        ></i>
                        <div className="arrow-btn-group">
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveCopyLinkPosition(lkIdx, 'up')}
                            title="উপরে তুলুন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveCopyLinkPosition(lkIdx, 'down')}
                            title="নিচে নামান"
                          >
                            ▼
                          </button>
                        </div>
                        <b>{lk.title}</b>{' '}
                        <small style={{ color: '#777', marginLeft: '5px' }}>({lk.url || '#'})</small>
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => startEditCopyLink(lkIdx)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteCopyLink(lkIdx)}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-row Add Copyright Links Form */}
        {isAddingCopyLinks ? (
          <div
            style={{
              marginTop: '10px',
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1'
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '13px',
                color: 'var(--purple-btn)',
                marginBottom: '10px'
              }}
            >
              <span>নতুন কপিরাইট লিংক যোগ করুন:</span>
            </div>

            {newCopyLinkRows.map((row, rIdx) => (
              <div
                key={rIdx}
                className="row"
                style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <input
                  type="text"
                  placeholder="লিংক টাইটেল (যেমন: Terms of Use)"
                  value={row.title}
                  onChange={(e) => updateNewCopyLinkRow(rIdx, 'title', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="URL (যেমন: /privacy-and-refund-policy)"
                  value={row.url}
                  onChange={(e) => updateNewCopyLinkRow(rIdx, 'url', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeNewCopyLinkRow(rIdx)}
                  title="মুছে ফেলুন"
                  style={{ height: '38px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            ))}

            <div className="card-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-info"
                onClick={addNewCopyLinkRow}
                title="আরও একটি লিংক রো যোগ করুন"
              >
                <i className="fa-solid fa-plus"></i> আরও যোগ করুন
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-submit" onClick={saveAllNewCopyLinks}>
                  <i className="fa-solid fa-floppy-disk"></i> Save Links
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddingCopyLinks(false);
                    setNewCopyLinkRows([]);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-actions" style={{ marginTop: '10px' }}>
            <button className="btn btn-info" onClick={openAddCopyLinkForm}>
              <i className="fa-solid fa-plus"></i> কপিরাইট লিংক যোগ করুন
            </button>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Floating Delete Confirmation Bar */}
      {pendingDelete && (
        <div id="delete-confirm-bar">
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>
            {pendingDelete.message}
          </span>
          <button
            className="btn btn-danger"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            onClick={async () => {
              const act = pendingDelete.action;
              setPendingDelete(null);
              if (act) await act();
            }}
          >
            <i className="fa-solid fa-trash"></i> হ্যাঁ, মুছে ফেলুন
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '10px 15px', fontSize: '14px' }}
            onClick={() => setPendingDelete(null)}
          >
            <i className="fa-solid fa-xmark"></i> বাতিল করুন
          </button>
        </div>
      )}

      {/* Floating Reorder Save Bar */}
      {hasPendingReorder && !pendingDelete && (
        <div id="reorder-action-bar">
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>
            আপনি ক্রম পরিবর্তন করেছেন। সেভ করতে বোতাম চাপুন।
          </span>
          <button
            className="btn btn-submit"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            onClick={saveReorderedLayout}
          >
            <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সেভ করুন
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: '10px 15px', fontSize: '14px' }}
            onClick={cancelReorder}
          >
            <i className="fa-solid fa-xmark"></i> বাতিল করুন
          </button>
        </div>
      )}
    </div>
  );
}
