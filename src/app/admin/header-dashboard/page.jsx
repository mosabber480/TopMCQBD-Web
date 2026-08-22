'use client';

import React, { useState, useEffect, useRef } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultLayoutConfig = {
  announcement: {
    text: '',
    link: ''
  },
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
    columns: []
  },
  copyright: {
    text: '© 2026 TopMCQBD. All rights reserved.',
    links: []
  }
};

export default function AdminHeaderDashboardPage() {
  const [config, setConfig] = useState(defaultLayoutConfig);
  const [loading, setLoading] = useState(true);
  const [isMenuReordered, setIsMenuReordered] = useState(false);

  // Announcement State
  const [announceInfo, setAnnounceInfo] = useState(null);
  const [isEditingAnnounce, setIsEditingAnnounce] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ text: '', link: '' });

  // Header Brand State
  const [brandInfo, setBrandInfo] = useState({ siteTitle: '', logoUrl: '', faviconUrl: '' });
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandForm, setBrandForm] = useState({ siteTitle: '', logoUrl: '', faviconUrl: '' });

  // Header Button State
  const [btnInfo, setBtnInfo] = useState({ btnText: '', btnLink: '' });
  const [isEditingBtn, setIsEditingBtn] = useState(false);
  const [btnForm, setBtnForm] = useState({ btnText: '', btnLink: '' });

  // Navigation Menus & Mega Menus State
  const [menus, setMenus] = useState([]);
  const [megaMenus, setMegaMenus] = useState([]);

  // Main Menu Forms
  const [isAddingMainMenu, setIsAddingMainMenu] = useState(false);
  const [newMainMenuRows, setNewMainMenuRows] = useState([]);
  const [editingMainMenuIdx, setEditingMainMenuIdx] = useState(null);
  const [editMainMenuForm, setEditMainMenuForm] = useState({ title: '', url: '' });

  // Submenu Forms
  const [activeSubAddIdx, setActiveSubAddIdx] = useState(null);
  const [newSubMenuForm, setNewSubMenuForm] = useState({ title: '', url: '' });
  const [editingSubMenu, setEditingSubMenu] = useState(null); // { mIdx, smIdx }
  const [editSubMenuForm, setEditSubMenuForm] = useState({ title: '', url: '' });

  // Mega Menu Connection Form
  const [connectingMegaMIdx, setConnectingMegaMIdx] = useState(null);
  const [selectedMegaId, setSelectedMegaId] = useState('');

  // Mega Menu Block Editor States
  const [editingMegaBlockIdx, setEditingMegaBlockIdx] = useState(null);
  const [editMegaBlockTitle, setEditMegaBlockTitle] = useState('');

  // Mega Menu Column Editor States
  const [editingMegaColTitle, setEditingMegaColTitle] = useState(null); // { mIdx, cIdx }
  const [editMegaColTitleForm, setEditMegaColTitleForm] = useState('');

  const [editingMegaInfo, setEditingMegaInfo] = useState(null); // { mIdx, cIdx }
  const [editMegaInfoForm, setEditMegaInfoForm] = useState({ iconHtml: '', title: '', text: '', url: '' });

  // Mega Menu Links Editor States
  const [activeMegaLinkAdd, setActiveMegaLinkAdd] = useState(null); // { mIdx, cIdx }
  const [newMegaLinkRows, setNewMegaLinkRows] = useState([]);
  const [editingMegaLink, setEditingMegaLink] = useState(null); // { mIdx, cIdx, lIdx }
  const [editMegaLinkForm, setEditMegaLinkForm] = useState({ title: '', url: '' });

  // Mega Menu Image Column States
  const [editingMegaImage, setEditingMegaImage] = useState(null); // { mIdx, cIdx }
  const [editMegaImageForm, setEditMegaImageForm] = useState({ title: '', imageUrl: '', url: '', text: '' });

  // Mega Menu Icon Column States
  const [activeMegaIconAdd, setActiveMegaIconAdd] = useState(null); // { mIdx, cIdx }
  const [newMegaIconRows, setNewMegaIconRows] = useState([]);
  const [editingMegaIconItem, setEditingMegaIconItem] = useState(null); // { mIdx, cIdx, iIdx }
  const [editMegaIconItemForm, setEditMegaIconItemForm] = useState({
    iconType: 'fontawesome',
    iconValue: '',
    title: '',
    desc: '',
    url: ''
  });

  // Level 1: Section Accordions State
  const [expandedSecs, setExpandedSecs] = useState({ sec0: false, sec1: false, sec2: false, sec3: false, sec4: false });
  const toggleSec = (secId) => setExpandedSecs(prev => ({ ...prev, [secId]: !prev[secId] }));

  // Level 2: Navigation Menu Item Accordions State
  const [expandedMenus, setExpandedMenus] = useState({});
  const toggleMenu = (mIdx) => setExpandedMenus(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));

  // Level 2: Mega Menu Block Accordions State
  const [expandedMegaBlocks, setExpandedMegaBlocks] = useState({});
  const toggleMegaBlock = (mIdx) => setExpandedMegaBlocks(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));

  // Level 3: Mega Menu Column Accordions State
  const [expandedMegaCols, setExpandedMegaCols] = useState({});
  const toggleMegaCol = (mIdx, cIdx) => {
    const key = `${mIdx}-${cIdx}`;
    setExpandedMegaCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Drag & Drop State
  const [dragItem, setDragItem] = useState(null); // { type, mIdx, idx2, idx3 }
  const [dropIndicator, setDropIndicator] = useState(null); // { id, position: 'above' | 'below' }

  // Delete Confirmation Floating Bar State
  const [pendingDelete, setPendingDelete] = useState(null); // { message, action }
  const [newSubMenuRows, setNewSubMenuRows] = useState([]);

  // -------------------------------------------------------------
  // Fetch Initial Data
  // -------------------------------------------------------------
  const fetchLayoutConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();

      const ann = data.announcement || null;
      const hdr = data.header || {};
      
      setConfig(data);
      setAnnounceInfo(ann && (ann.text || ann.link) ? ann : null);
      
      setBrandInfo({
        siteTitle: hdr.siteTitle !== undefined ? hdr.siteTitle : 'TopMCQ',
        logoUrl: hdr.logoUrl || '',
        faviconUrl: hdr.faviconUrl || ''
      });

      setBtnInfo({
        btnText: hdr.btnText || '',
        btnLink: hdr.btnLink || ''
      });

      setMenus(hdr.menus ? JSON.parse(JSON.stringify(hdr.menus)) : []);
      setMegaMenus(hdr.megaMenus ? JSON.parse(JSON.stringify(hdr.megaMenus)) : []);

      setIsMenuReordered(false);
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
  const saveLayoutConfig = async (overrideData = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const currentAnnounce = overrideData.announcement !== undefined ? overrideData.announcement : announceInfo;
    const currentBrand = overrideData.brand !== undefined ? overrideData.brand : brandInfo;
    const currentBtn = overrideData.btn !== undefined ? overrideData.btn : btnInfo;
    const currentMenus = overrideData.menus !== undefined ? overrideData.menus : menus;
    const currentMegaMenus = overrideData.megaMenus !== undefined ? overrideData.megaMenus : megaMenus;

    const payload = {
      ...config,
      announcement: currentAnnounce,
      header: {
        ...(config.header || {}),
        siteTitle: currentBrand.siteTitle,
        logoUrl: currentBrand.logoUrl,
        faviconUrl: currentBrand.faviconUrl,
        btnText: currentBtn.btnText,
        btnLink: currentBtn.btnLink,
        menus: currentMenus,
        megaMenus: currentMegaMenus
      }
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

      if (res.ok) {
        showTopAlert('✅ সফলভাবে সেভ হয়েছে!', 'success');
        setConfig(payload);
        setIsMenuReordered(false);
        try {
          const prev = JSON.parse(localStorage.getItem('layout_config_data') || '{}');
          localStorage.setItem('layout_config_data', JSON.stringify({ ...prev, ...payload }));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('layout-updated'));
        }
        return true;
      } else {
        showTopAlert('❌ সেভ করতে ব্যর্থ হয়েছে!', 'danger');
        return false;
      }
    } catch (err) {
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
      return false;
    }
  };

  // -------------------------------------------------------------
  // Reorder & Action Bar Handlers
  // -------------------------------------------------------------
  const markAsReordered = () => {
    setIsMenuReordered(true);
  };

  const saveReorder = async () => {
    await saveLayoutConfig();
    setIsMenuReordered(false);
  };

  const cancelReorder = async () => {
    setIsMenuReordered(false);
    await fetchLayoutConfig();
  };

  // -------------------------------------------------------------
  // Drag & Drop Engine (Main, Sub, MegaCol, MegaLink)
  // -------------------------------------------------------------
  const handleDragStart = (e, type, mIdx, idx2, idx3) => {
    e.stopPropagation();
    const data = {
      type: String(type),
      mIdx: Number(mIdx),
      idx2: idx2 !== undefined && idx2 !== null ? Number(idx2) : null,
      idx3: idx3 !== undefined && idx3 !== null ? Number(idx3) : null
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

  const handleDragOver = (e, targetId, targetType, targetMIdx, targetIdx2, targetIdx3) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== targetType) return;

    if (dragItem.type === 'sub' && targetMIdx !== dragItem.mIdx) return;
    if (dragItem.type === 'megacol' && targetMIdx !== dragItem.mIdx) return;
    if (dragItem.type === 'megalink' && (targetMIdx !== dragItem.mIdx || targetIdx2 !== dragItem.idx2)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropIndicator({ id: targetId, position: pos });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType, targetMIdx, targetIdx2, targetIdx3) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropIndicator?.position || 'below';
    setDropIndicator(null);

    if (!dragItem || dragItem.type !== String(targetType)) {
      setDragItem(null);
      return;
    }

    targetMIdx = Number(targetMIdx);
    if (targetIdx2 !== undefined && targetIdx2 !== null) targetIdx2 = Number(targetIdx2);
    if (targetIdx3 !== undefined && targetIdx3 !== null) targetIdx3 = Number(targetIdx3);

    let list;
    let fromIdx, toIdx;

    if (targetType === 'main') {
      const updatedMenus = [...menus];
      fromIdx = dragItem.mIdx;
      toIdx = targetMIdx;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = updatedMenus.splice(fromIdx, 1)[0];
          updatedMenus.splice(insertIdx, 0, moved);
          setMenus(updatedMenus);
          markAsReordered();
        }
      }
    } else if (targetType === 'sub') {
      if (dragItem.mIdx !== targetMIdx) return;
      const updatedMenus = [...menus];
      const subList = [...(updatedMenus[targetMIdx].subMenus || [])];
      fromIdx = dragItem.idx2;
      toIdx = targetIdx2;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = subList.splice(fromIdx, 1)[0];
          subList.splice(insertIdx, 0, moved);
          updatedMenus[targetMIdx].subMenus = subList;
          setMenus(updatedMenus);
          markAsReordered();
        }
      }
    } else if (targetType === 'megacol') {
      if (dragItem.mIdx !== targetMIdx) return;
      const updatedMegas = [...megaMenus];
      const colList = [...(updatedMegas[targetMIdx].columns || [])];
      fromIdx = dragItem.idx2;
      toIdx = targetIdx2;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = colList.splice(fromIdx, 1)[0];
          colList.splice(insertIdx, 0, moved);
          updatedMegas[targetMIdx].columns = colList;
          setMegaMenus(updatedMegas);
          markAsReordered();
        }
      }
    } else if (targetType === 'megalink') {
      if (dragItem.mIdx !== targetMIdx || dragItem.idx2 !== targetIdx2) return;
      const updatedMegas = [...megaMenus];
      const linkList = [...(updatedMegas[targetMIdx].columns[targetIdx2].links || [])];
      fromIdx = dragItem.idx3;
      toIdx = targetIdx3;
      if (fromIdx !== null && toIdx !== null) {
        let insertIdx = pos === 'below' ? toIdx + 1 : toIdx;
        if (fromIdx < insertIdx) insertIdx--;
        if (fromIdx !== insertIdx) {
          const moved = linkList.splice(fromIdx, 1)[0];
          linkList.splice(insertIdx, 0, moved);
          updatedMegas[targetMIdx].columns[targetIdx2].links = linkList;
          setMegaMenus(updatedMegas);
          markAsReordered();
        }
      }
    }
    setDragItem(null);
  };

  // -------------------------------------------------------------
  // Arrow Button Position Movers
  // -------------------------------------------------------------
  const moveMainMenuPosition = (mIdx, dir) => {
    const list = [...menus];
    if (dir === 'up' && mIdx > 0) {
      const itm = list.splice(mIdx, 1)[0];
      list.splice(mIdx - 1, 0, itm);
      setMenus(list);
      markAsReordered();
    } else if (dir === 'down' && mIdx < list.length - 1) {
      const itm = list.splice(mIdx, 1)[0];
      list.splice(mIdx + 1, 0, itm);
      setMenus(list);
      markAsReordered();
    }
  };

  const moveSubMenuPosition = (mIdx, smIdx, dir) => {
    const updatedMenus = [...menus];
    const list = [...(updatedMenus[mIdx].subMenus || [])];
    if (dir === 'up' && smIdx > 0) {
      const itm = list.splice(smIdx, 1)[0];
      list.splice(smIdx - 1, 0, itm);
      updatedMenus[mIdx].subMenus = list;
      setMenus(updatedMenus);
      markAsReordered();
    } else if (dir === 'down' && smIdx < list.length - 1) {
      const itm = list.splice(smIdx, 1)[0];
      list.splice(smIdx + 1, 0, itm);
      updatedMenus[mIdx].subMenus = list;
      setMenus(updatedMenus);
      markAsReordered();
    }
  };

  const moveMegaCol = (mIdx, cIdx, dir) => {
    const updatedMegas = [...megaMenus];
    const list = [...(updatedMegas[mIdx].columns || [])];
    if (dir === 'up' && cIdx > 0) {
      const itm = list.splice(cIdx, 1)[0];
      list.splice(cIdx - 1, 0, itm);
      updatedMegas[mIdx].columns = list;
      setMegaMenus(updatedMegas);
      markAsReordered();
    } else if (dir === 'down' && cIdx < list.length - 1) {
      const itm = list.splice(cIdx, 1)[0];
      list.splice(cIdx + 1, 0, itm);
      updatedMegas[mIdx].columns = list;
      setMegaMenus(updatedMegas);
      markAsReordered();
    }
  };

  const moveMegaLink = (mIdx, cIdx, lIdx, dir) => {
    const updatedMegas = [...megaMenus];
    const list = [...(updatedMegas[mIdx].columns[cIdx].links || [])];
    if (dir === 'up' && lIdx > 0) {
      const itm = list.splice(lIdx, 1)[0];
      list.splice(lIdx - 1, 0, itm);
      updatedMegas[mIdx].columns[cIdx].links = list;
      setMegaMenus(updatedMegas);
      markAsReordered();
    } else if (dir === 'down' && lIdx < list.length - 1) {
      const itm = list.splice(lIdx, 1)[0];
      list.splice(lIdx + 1, 0, itm);
      updatedMegas[mIdx].columns[cIdx].links = list;
      setMegaMenus(updatedMegas);
      markAsReordered();
    }
  };

  // -------------------------------------------------------------
  // 1. Announcement Section Logic
  // -------------------------------------------------------------
  const editAnnounceSection = () => {
    setAnnounceForm({
      text: announceInfo?.text || '',
      link: announceInfo?.link || ''
    });
    setIsEditingAnnounce(true);
  };

  const saveAnnounceSection = async () => {
    const newAnn = { text: announceForm.text.trim(), link: announceForm.link.trim() };
    setAnnounceInfo(newAnn);
    setIsEditingAnnounce(false);
    await saveLayoutConfig({ announcement: newAnn });
  };

  const deleteAnnounceSection = () => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে অ্যানাউন্সমেন্ট মুছে ফেলতে চান?',
      action: async () => {
        const newAnn = { text: '', link: '' };
        setAnnounceInfo(null);
        await saveLayoutConfig({ announcement: newAnn });
      }
    });
  };

  // -------------------------------------------------------------
  // 2.1 Logo, Title & Favicon Section Logic
  // -------------------------------------------------------------
  const editHeaderBrandSection = () => {
    setBrandForm({
      siteTitle: brandInfo.siteTitle || '',
      logoUrl: brandInfo.logoUrl || '',
      faviconUrl: brandInfo.faviconUrl || ''
    });
    setIsEditingBrand(true);
  };

  const saveHeaderBrandSection = async () => {
    const newBrand = {
      siteTitle: brandForm.siteTitle.trim() || 'TopMCQ',
      logoUrl: brandForm.logoUrl.trim(),
      faviconUrl: brandForm.faviconUrl.trim()
    };
    setBrandInfo(newBrand);
    setIsEditingBrand(false);
    await saveLayoutConfig({ brand: newBrand });
  };

  const deleteHeaderBrandSection = () => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে ব্রান্ড তথ্য মুছে ফেলতে চান?',
      action: async () => {
        const newBrand = { siteTitle: '', logoUrl: '', faviconUrl: '' };
        setBrandInfo(newBrand);
        await saveLayoutConfig({ brand: newBrand });
      }
    });
  };

  // -------------------------------------------------------------
  // 2.2 Header Button Section Logic
  // -------------------------------------------------------------
  const editHeaderBtnSection = () => {
    setBtnForm({
      btnText: btnInfo.btnText || '',
      btnLink: btnInfo.btnLink || ''
    });
    setIsEditingBtn(true);
  };

  const saveHeaderBtnSection = async () => {
    const newBtn = {
      btnText: btnForm.btnText.trim(),
      btnLink: btnForm.btnLink.trim()
    };
    setBtnInfo(newBtn);
    setIsEditingBtn(false);
    await saveLayoutConfig({ btn: newBtn });
  };

  const deleteHeaderBtnSection = () => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে হেডার বাটন তথ্য মুছে ফেলতে চান?',
      action: async () => {
        const newBtn = { btnText: '', btnLink: '' };
        setBtnInfo(newBtn);
        await saveLayoutConfig({ btn: newBtn });
      }
    });
  };

  // -------------------------------------------------------------
  // 2.3 Navigation Menu & Sub-Menu Section Logic
  // -------------------------------------------------------------
  // Multi-row Main Menu Handlers
  const openAddMainMenuForm = () => {
    setIsAddingMainMenu(true);
    setNewMainMenuRows([{ title: '', url: '' }]);
  };

  const addNewMainMenuRow = () => {
    setNewMainMenuRows(prev => [...prev, { title: '', url: '' }]);
  };

  const updateNewMainMenuRow = (index, field, value) => {
    const rows = [...newMainMenuRows];
    rows[index][field] = value;
    setNewMainMenuRows(rows);
  };

  const removeNewMainMenuRow = (index) => {
    const rows = newMainMenuRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setIsAddingMainMenu(false);
      setNewMainMenuRows([]);
    } else {
      setNewMainMenuRows(rows);
    }
  };

  const saveAllNewMainMenus = async () => {
    const validRows = newMainMenuRows
      .filter(r => r.title.trim())
      .map(r => ({
        title: r.title.trim(),
        url: r.url.trim() || '#',
        subMenus: [],
        isMegaMenu: false,
        megaMenuId: null
      }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি মূল মেনু টাইটেল দিন!', 'warning');
      return;
    }

    const updated = [...menus, ...validRows];
    setMenus(updated);
    setIsAddingMainMenu(false);
    setNewMainMenuRows([]);
    await saveLayoutConfig({ menus: updated });
  };

  const deleteMainMenu = (mIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই মেনুটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = menus.filter((_, idx) => idx !== mIdx);
        setMenus(updated);
        await saveLayoutConfig({ menus: updated });
      }
    });
  };

  const startEditMainMenu = (mIdx) => {
    setEditingMainMenuIdx(mIdx);
    setEditMainMenuForm({
      title: menus[mIdx].title || '',
      url: menus[mIdx].url || ''
    });
  };

  const saveEditMainMenu = async (mIdx) => {
    const updated = [...menus];
    updated[mIdx].title = editMainMenuForm.title.trim();
    updated[mIdx].url = editMainMenuForm.url.trim() || '#';
    setMenus(updated);
    setEditingMainMenuIdx(null);
    await saveLayoutConfig({ menus: updated });
  };

  // Submenus Multi-row Handlers
  const openAddSubMenuForm = (mIdx) => {
    setActiveSubAddIdx(mIdx);
    setNewSubMenuRows([{ title: '', url: '' }]);
  };

  const addNewSubMenuRow = () => {
    setNewSubMenuRows(prev => [...prev, { title: '', url: '' }]);
  };

  const updateNewSubMenuRow = (index, field, value) => {
    const rows = [...newSubMenuRows];
    rows[index][field] = value;
    setNewSubMenuRows(rows);
  };

  const removeNewSubMenuRow = (index) => {
    const rows = newSubMenuRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setActiveSubAddIdx(null);
      setNewSubMenuRows([]);
    } else {
      setNewSubMenuRows(rows);
    }
  };

  const saveAllNewSubMenus = async (mIdx) => {
    const validRows = newSubMenuRows
      .filter(r => r.title.trim())
      .map(r => ({ title: r.title.trim(), url: r.url.trim() || '#' }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি সাব-মেনু পূরণ করুন!', 'warning');
      return;
    }

    const updated = [...menus];
    if (!updated[mIdx].subMenus) updated[mIdx].subMenus = [];
    updated[mIdx].subMenus.push(...validRows);
    setMenus(updated);
    setActiveSubAddIdx(null);
    setNewSubMenuRows([]);
    await saveLayoutConfig({ menus: updated });
  };

  const deleteSubMenu = (mIdx, smIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই সাব-মেনুটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...menus];
        updated[mIdx].subMenus.splice(smIdx, 1);
        setMenus(updated);
        await saveLayoutConfig({ menus: updated });
      }
    });
  };

  const startEditSubMenu = (mIdx, smIdx) => {
    setEditingSubMenu({ mIdx, smIdx });
    setEditSubMenuForm({
      title: menus[mIdx].subMenus[smIdx].title || '',
      url: menus[mIdx].subMenus[smIdx].url || ''
    });
  };

  const saveSubMenuInline = async (mIdx, smIdx) => {
    const updated = [...menus];
    updated[mIdx].subMenus[smIdx].title = editSubMenuForm.title.trim();
    updated[mIdx].subMenus[smIdx].url = editSubMenuForm.url.trim() || '#';
    setMenus(updated);
    setEditingSubMenu(null);
    await saveLayoutConfig({ menus: updated });
  };

  // Mega Menu Connection
  const openConnectMegaMenu = (mIdx) => {
    setConnectingMegaMIdx(mIdx);
    const existing = menus[mIdx].megaMenuId;
    setSelectedMegaId(existing || (megaMenus.length > 0 ? megaMenus[0].id : ''));
  };

  const saveMegaMenuConnection = async (mIdx) => {
    if (!selectedMegaId) return;
    const updated = [...menus];
    updated[mIdx].isMegaMenu = true;
    updated[mIdx].megaMenuId = selectedMegaId;
    updated[mIdx].subMenus = [];
    setMenus(updated);
    setConnectingMegaMIdx(null);
    await saveLayoutConfig({ menus: updated });
  };

  const removeMegaMenuConnection = async (mIdx) => {
    if (await showTopAlert('আপনি কি এই মেগা মেনু কানেকশনটি বিচ্ছিন্ন করতে চান?', 'warning', true)) {
      const updated = [...menus];
      updated[mIdx].isMegaMenu = false;
      updated[mIdx].megaMenuId = null;
      setMenus(updated);
      await saveLayoutConfig({ menus: updated });
    }
  };

  // -------------------------------------------------------------
  // 2.4 Mega Menu Builder Section Logic
  // -------------------------------------------------------------
  const createNewMegaMenuBlock = async () => {
    const newBlock = {
      id: 'mega_' + Date.now(),
      title: 'নতুন মেগা মেনু ' + (megaMenus.length + 1),
      columns: []
    };
    const updated = [...megaMenus, newBlock];
    setMegaMenus(updated);
    await saveLayoutConfig({ megaMenus: updated });
  };

  const deleteMegaBlock = (mIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই মেগা মেনুটি সম্পূর্ণ ডিলিট করতে চান?',
      action: async () => {
        const deletedId = megaMenus[mIdx].id;
        const updatedMegas = megaMenus.filter((_, idx) => idx !== mIdx);

        const updatedMenus = menus.map(m => {
          if (m.megaMenuId === deletedId) {
            return { ...m, isMegaMenu: false, megaMenuId: null };
          }
          return m;
        });

        setMegaMenus(updatedMegas);
        setMenus(updatedMenus);
        await saveLayoutConfig({ megaMenus: updatedMegas, menus: updatedMenus });
      }
    });
  };

  const startRenameMegaBlock = (mIdx) => {
    setEditingMegaBlockIdx(mIdx);
    setEditMegaBlockTitle(megaMenus[mIdx].title || '');
  };

  const saveRenameMegaBlock = async (mIdx) => {
    const updated = [...megaMenus];
    updated[mIdx].title = editMegaBlockTitle.trim() || 'মেগা মেনু';
    setMegaMenus(updated);
    setEditingMegaBlockIdx(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  const addMegaCol = async (mIdx, type) => {
    const updated = [...megaMenus];
    if (!updated[mIdx].columns) updated[mIdx].columns = [];

    if (type === 'info') {
      updated[mIdx].columns.push({
        type: 'info',
        title: 'নতুন তথ্য কলাম',
        text: 'সাইট সম্পর্কে কিছু লিখুন...',
        iconHtml: '<i class="fa-solid fa-circle-info"></i>'
      });
    } else if (type === 'image') {
      updated[mIdx].columns.push({
        type: 'image',
        title: 'POSTS CAROUSEL',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        url: '',
        text: ''
      });
    } else if (type === 'icon') {
      updated[mIdx].columns.push({
        type: 'icon',
        title: 'নতুন আইকন কলাম',
        items: [
          {
            iconType: 'fontawesome',
            iconValue: 'fa-solid fa-building-columns',
            title: 'Banking',
            desc: 'Store, manage and move your funds safely.',
            url: '#'
          }
        ]
      });
    } else {
      updated[mIdx].columns.push({
        type: 'links',
        title: 'নতুন লিংক কলাম',
        links: []
      });
    }
    setMegaMenus(updated);
    await saveLayoutConfig({ megaMenus: updated });
  };

  const deleteMegaCol = (mIdx, cIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে কলামটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...megaMenus];
        updated[mIdx].columns.splice(cIdx, 1);
        setMegaMenus(updated);
        await saveLayoutConfig({ megaMenus: updated });
      }
    });
  };

  // Info Column Edit
  const startEditMegaInfo = (mIdx, cIdx) => {
    const col = megaMenus[mIdx].columns[cIdx];
    setEditingMegaInfo({ mIdx, cIdx });
    let rawIcon = col.iconHtml || '';
    if (rawIcon.startsWith('<i class="') && rawIcon.endsWith('"></i>')) {
      rawIcon = rawIcon.substring(10, rawIcon.length - 7);
    } else if (rawIcon.startsWith("<i class='") && rawIcon.endsWith("'></i>")) {
      rawIcon = rawIcon.substring(10, rawIcon.length - 7);
    }
    setEditMegaInfoForm({
      iconHtml: rawIcon,
      title: col.title || '',
      text: col.text || '',
      url: col.url || ''
    });
  };

  const saveMegaInfoInline = async (mIdx, cIdx) => {
    const updated = [...megaMenus];
    const col = updated[mIdx].columns[cIdx];
    let iconVal = editMegaInfoForm.iconHtml.trim();
    if (iconVal && !iconVal.startsWith('<')) {
      iconVal = `<i class="${iconVal}"></i>`;
    }
    col.iconHtml = iconVal;
    col.title = editMegaInfoForm.title.trim();
    col.text = editMegaInfoForm.text.trim();
    col.url = editMegaInfoForm.url ? editMegaInfoForm.url.trim() : '';

    delete col.fb; delete col.yt; delete col.wa; delete col.tw; delete col.tg; delete col.ln;

    setMegaMenus(updated);
    setEditingMegaInfo(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  // Image Column Handlers
  const startEditMegaImage = (mIdx, cIdx) => {
    const col = megaMenus[mIdx].columns[cIdx];
    setEditingMegaImage({ mIdx, cIdx });
    setEditMegaImageForm({
      title: col.title || '',
      imageUrl: col.imageUrl || '',
      url: col.url || '',
      text: col.text || ''
    });
  };

  const saveMegaImageInline = async (mIdx, cIdx) => {
    const updated = [...megaMenus];
    const col = updated[mIdx].columns[cIdx];
    col.title = editMegaImageForm.title.trim();
    col.imageUrl = editMegaImageForm.imageUrl.trim();
    col.url = editMegaImageForm.url.trim();
    col.text = editMegaImageForm.text.trim();
    setMegaMenus(updated);
    setEditingMegaImage(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  // Icon Column Handlers
  const openAddMegaIconForm = (mIdx, cIdx) => {
    setActiveMegaIconAdd({ mIdx, cIdx });
    setNewMegaIconRows([{ iconType: 'fontawesome', iconValue: 'fa-solid fa-star', title: '', desc: '', url: '' }]);
  };

  const addNewMegaIconRow = () => {
    setNewMegaIconRows(prev => [...prev, { iconType: 'fontawesome', iconValue: 'fa-solid fa-star', title: '', desc: '', url: '' }]);
  };

  const updateNewMegaIconRow = (index, field, value) => {
    const rows = [...newMegaIconRows];
    rows[index][field] = value;
    setNewMegaIconRows(rows);
  };

  const removeNewMegaIconRow = (index) => {
    const rows = newMegaIconRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setActiveMegaIconAdd(null);
      setNewMegaIconRows([]);
    } else {
      setNewMegaIconRows(rows);
    }
  };

  const saveAllNewMegaIcons = async (mIdx, cIdx) => {
    const validRows = newMegaIconRows
      .filter(r => r.title.trim() || r.iconValue.trim())
      .map(r => ({
        iconType: r.iconType || 'fontawesome',
        iconValue: r.iconValue.trim(),
        title: r.title.trim(),
        desc: r.desc.trim(),
        url: r.url.trim() || '#'
      }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি আইকন বা টাইটেল দিন!', 'warning');
      return;
    }

    const updated = [...megaMenus];
    if (!updated[mIdx].columns[cIdx].items) updated[mIdx].columns[cIdx].items = [];
    updated[mIdx].columns[cIdx].items.push(...validRows);
    setMegaMenus(updated);
    setActiveMegaIconAdd(null);
    setNewMegaIconRows([]);
    await saveLayoutConfig({ megaMenus: updated });
  };

  const deleteMegaIconItem = (mIdx, cIdx, iIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই আইকন আইটেমটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...megaMenus];
        updated[mIdx].columns[cIdx].items.splice(iIdx, 1);
        setMegaMenus(updated);
        await saveLayoutConfig({ megaMenus: updated });
      }
    });
  };

  const startEditMegaIconItem = (mIdx, cIdx, iIdx) => {
    const item = megaMenus[mIdx].columns[cIdx].items[iIdx];
    setEditingMegaIconItem({ mIdx, cIdx, iIdx });
    setEditMegaIconItemForm({
      iconType: item.iconType || 'fontawesome',
      iconValue: item.iconValue || '',
      title: item.title || '',
      desc: item.desc || '',
      url: item.url || ''
    });
  };

  const saveMegaIconItemInline = async (mIdx, cIdx, iIdx) => {
    const updated = [...megaMenus];
    const item = updated[mIdx].columns[cIdx].items[iIdx];
    item.iconType = editMegaIconItemForm.iconType;
    item.iconValue = editMegaIconItemForm.iconValue.trim();
    item.title = editMegaIconItemForm.title.trim();
    item.desc = editMegaIconItemForm.desc.trim();
    item.url = editMegaIconItemForm.url.trim() || '#';
    setMegaMenus(updated);
    setEditingMegaIconItem(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  // Links Column Rename Title
  const startRenameMegaColTitle = (mIdx, cIdx) => {
    const col = megaMenus[mIdx].columns[cIdx];
    setEditingMegaColTitle({ mIdx, cIdx });
    setEditMegaColTitleForm(col.title || '');
  };

  const saveMegaColTitleInline = async (mIdx, cIdx) => {
    const updated = [...megaMenus];
    updated[mIdx].columns[cIdx].title = editMegaColTitleForm.trim();
    setMegaMenus(updated);
    setEditingMegaColTitle(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  // Multi-row Mega Link Handlers
  const openAddMegaLinkForm = (mIdx, cIdx) => {
    setActiveMegaLinkAdd({ mIdx, cIdx });
    setNewMegaLinkRows([{ title: '', url: '' }]);
  };

  const addNewMegaLinkRow = () => {
    setNewMegaLinkRows(prev => [...prev, { title: '', url: '' }]);
  };

  const updateNewMegaLinkRow = (index, field, value) => {
    const rows = [...newMegaLinkRows];
    rows[index][field] = value;
    setNewMegaLinkRows(rows);
  };

  const removeNewMegaLinkRow = (index) => {
    const rows = newMegaLinkRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setActiveMegaLinkAdd(null);
      setNewMegaLinkRows([]);
    } else {
      setNewMegaLinkRows(rows);
    }
  };

  const saveAllNewMegaLinks = async (mIdx, cIdx) => {
    const validRows = newMegaLinkRows
      .filter(r => r.title.trim())
      .map(r => ({ title: r.title.trim(), url: r.url.trim() || '#' }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি লিংক টাইটেল দিন!', 'warning');
      return;
    }

    const updated = [...megaMenus];
    if (!updated[mIdx].columns[cIdx].links) updated[mIdx].columns[cIdx].links = [];
    updated[mIdx].columns[cIdx].links.push(...validRows);
    setMegaMenus(updated);
    setActiveMegaLinkAdd(null);
    setNewMegaLinkRows([]);
    await saveLayoutConfig({ megaMenus: updated });
  };

  const deleteMegaLink = (mIdx, cIdx, lIdx) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই লিংকটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...megaMenus];
        updated[mIdx].columns[cIdx].links.splice(lIdx, 1);
        setMegaMenus(updated);
        await saveLayoutConfig({ megaMenus: updated });
      }
    });
  };

  const startEditMegaLink = (mIdx, cIdx, lIdx) => {
    const lk = megaMenus[mIdx].columns[cIdx].links[lIdx];
    setEditingMegaLink({ mIdx, cIdx, lIdx });
    setEditMegaLinkForm({
      title: lk.title || '',
      url: lk.url || ''
    });
  };

  const saveMegaLinkInline = async (mIdx, cIdx, lIdx) => {
    const updated = [...megaMenus];
    updated[mIdx].columns[cIdx].links[lIdx].title = editMegaLinkForm.title.trim();
    updated[mIdx].columns[cIdx].links[lIdx].url = editMegaLinkForm.url.trim() || '#';
    setMegaMenus(updated);
    setEditingMegaLink(null);
    await saveLayoutConfig({ megaMenus: updated });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#007bff' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>হেডার কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  const hasBrand = brandInfo && (brandInfo.siteTitle || brandInfo.logoUrl || brandInfo.faviconUrl);
  const hasBtn = btnInfo && (btnInfo.btnText || btnInfo.btnLink);
  const hasAnnounce = announceInfo && (announceInfo.text || announceInfo.link);

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
        .section-card.announce-card { border-left: 6px solid var(--warning); }
        .section-card.header-card { border-left: 6px solid var(--primary); }
        .section-card.header-btn-card { border-left: 6px solid #e83e8c; }
        .section-card.menu-card { border-left: 6px solid #20c997; }
        .section-card.mega-menu-card { border-left: 6px solid #6f42c1; }

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
        .read-subtitle { font-size: 14px; color: #555; margin-bottom: 8px; }
        .read-meta { font-size: 13px; color: #555; margin-bottom: 6px; }

        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; font-size: 13px; }
        input, select, textarea {
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
        input:focus, select:focus, textarea:focus { border-color: var(--primary); }

        .row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
        .card-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: flex-end; }

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
          transition: all 0.2s ease;
        }

        .drag-handle {
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
        .drag-handle:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .drag-handle:active {
          cursor: grabbing;
        }

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
        .btn-arrow:hover { background: var(--primary); color: #ffffff; }

        .draggable-item { position: relative; transition: opacity 0.2s; }
        .draggable-item.dragging { opacity: 0.35; }

        .drop-above::before {
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
        .drop-below::after {
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

      {/* ১. ANNOUNCEMENT BAR CARD */}
      <div className="section-card announce-card">
        <div
          className="section-title"
          onClick={() => toggleSec('sec0')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSecs.sec0 ? '15px' : 0, paddingBottom: expandedSecs.sec0 ? '10px' : 0, borderBottom: expandedSecs.sec0 ? '1px dashed #e2e8f0' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-bullhorn" style={{ color: 'var(--warning)' }}></i>
            ১. অ্যানাউন্সমেন্ট বার (Notice Bar)
          </div>
          <i className={'fa-solid fa-chevron-' + (expandedSecs.sec0 ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b' }}></i>
        </div>

        {expandedSecs.sec0 && (
          <>

        {isEditingAnnounce ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasAnnounce ? 'অ্যানাউন্সমেন্ট এডিট করুন' : 'নতুন অ্যানাউন্সমেন্ট যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
                <label>নোটিশ টেক্সট:</label>
                <input
                  type="text"
                  value={announceForm.text}
                  onChange={(e) => setAnnounceForm({ ...announceForm, text: e.target.value })}
                  placeholder="যেমন: নতুন কুইজ ব্যাচ শুরু হয়েছে!"
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                <label>নোটিশ লিংক (URL):</label>
                <input
                  type="text"
                  value={announceForm.link}
                  onChange={(e) => setAnnounceForm({ ...announceForm, link: e.target.value })}
                  placeholder="যেমন: #notice অথবা /packages"
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={saveAnnounceSection}>
                <i className="fa-solid fa-floppy-disk"></i> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingAnnounce(false)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        ) : hasAnnounce ? (
          <div className="read-box" style={{ borderLeft: '5px solid #ff9f43' }}>
            <div
                        className="card-header-flex"
                        onClick={(e) => {
                          if (!e.target.closest('.card-actions') && !e.target.closest('button') && !e.target.closest('input')) {
                            toggleMenu(mIdx);
                          }
                        }}
                        style={{ marginBottom: 0, cursor: 'pointer', userSelect: 'none' }}
                      >
              <div>
                <div className="read-title">
                  <i className="fa-solid fa-bullhorn"></i> {announceInfo.text || '(কোনো নোটিশ নেই)'}
                </div>
                <div className="read-subtitle" style={{ marginTop: '4px' }}>
                  <b>লিংক (URL):</b> {announceInfo.link || 'নাই'}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-warning" onClick={editAnnounceSection}>
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button className="btn btn-danger" onClick={deleteAnnounceSection}>
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="btn btn-add" onClick={editAnnounceSection}>
            <i className="fa-solid fa-plus"></i> অ্যানাউন্সমেন্ট যোগ করুন
          </button>
        )}
          </>
        )}
      </div>

      {/* ২.১ LOGO, TITLE, & FAVICON CARD */}
      <div className="section-card header-card">
        <div
          className="section-title"
          onClick={() => toggleSec('sec1')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSecs.sec1 ? '15px' : 0, paddingBottom: expandedSecs.sec1 ? '10px' : 0, borderBottom: expandedSecs.sec1 ? '1px dashed #e2e8f0' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-id-card" style={{ color: 'var(--primary)' }}></i>
            ২.১ লোগো, টাইটেল ও ফেভিকন সেটিং
          </div>
          <i className={'fa-solid fa-chevron-' + (expandedSecs.sec1 ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b' }}></i>
        </div>

        {expandedSecs.sec1 && (
          <>

        {isEditingBrand ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasBrand ? 'ব্রান্ড সেটিং এডিট করুন' : 'নতুন ব্রান্ড তথ্য যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
                <label>লোগো টাইটেল (Site Title):</label>
                <input
                  type="text"
                  value={brandForm.siteTitle}
                  onChange={(e) => setBrandForm({ ...brandForm, siteTitle: e.target.value })}
                  placeholder="TopMCQ"
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
                <label>লোগো ইমেজ URL (Logo Image URL):</label>
                <input
                  type="text"
                  value={brandForm.logoUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  placeholder="/images/TopMCQ.png"
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
                <label>ফেভিকন URL (Favicon Icon URL):</label>
                <input
                  type="text"
                  value={brandForm.faviconUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, faviconUrl: e.target.value })}
                  placeholder="/favicon.ico"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>&nbsp;</div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={saveHeaderBrandSection}>
                <i className="fa-solid fa-floppy-disk"></i> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingBrand(false)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        ) : hasBrand ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff' }}>
            <div className="card-header-flex" style={{ marginBottom: 0 }}>
              <div>
                <div className="read-title">
                  <i className="fa-solid fa-pager" style={{ color: '#007bff' }}></i>
                  সাইট টাইটেল: {brandInfo.siteTitle || 'TopMCQ'}
                </div>
                <div className="read-meta" style={{ marginTop: '4px' }}>
                  <b>Logo URL:</b> {brandInfo.logoUrl || 'নাই'} | <b>Favicon URL:</b> {brandInfo.faviconUrl || 'নাই'}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-warning" onClick={editHeaderBrandSection}>
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button className="btn btn-danger" onClick={deleteHeaderBrandSection}>
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="btn btn-add" onClick={editHeaderBrandSection}>
            <i className="fa-solid fa-plus"></i> ব্রান্ড তথ্য যোগ করুন
          </button>
        )}
          </>
        )}
      </div>

      {/* ২.২ HEADER BUTTON CARD */}
      <div className="section-card header-btn-card">
        <div
          className="section-title"
          onClick={() => toggleSec('sec2')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSecs.sec2 ? '15px' : 0, paddingBottom: expandedSecs.sec2 ? '10px' : 0, borderBottom: expandedSecs.sec2 ? '1px dashed #e2e8f0' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-link" style={{ color: '#e83e8c' }}></i>
            ২.২ হেডার বাটন সেটিং
          </div>
          <i className={'fa-solid fa-chevron-' + (expandedSecs.sec2 ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b' }}></i>
        </div>

        {expandedSecs.sec2 && (
          <>

        {isEditingBtn ? (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              {hasBtn ? 'হেডার বাটন এডিট করুন' : 'নতুন হেডার বাটন যোগ করুন'}
            </div>
            <div className="row">
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label>হেডার বাটন টেক্সট:</label>
                <input
                  type="text"
                  value={btnForm.btnText}
                  onChange={(e) => setBtnForm({ ...btnForm, btnText: e.target.value })}
                  placeholder="যেমন: যোগাযোগ"
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label>হেডার বাটন লিংক (URL):</label>
                <input
                  type="text"
                  value={btnForm.btnLink}
                  onChange={(e) => setBtnForm({ ...btnForm, btnLink: e.target.value })}
                  placeholder="যেমন: /contact"
                />
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-submit" onClick={saveHeaderBtnSection}>
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingBtn(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        ) : hasBtn ? (
          <div className="read-box" style={{ borderLeft: '5px solid #e83e8c' }}>
            <div className="card-header-flex" style={{ marginBottom: 0 }}>
              <div>
                <div className="read-title">
                  <i className="fa-solid fa-square-arrow-up-right" style={{ color: '#e83e8c' }}></i> হেডার বাটন
                </div>
                <div className="read-meta" style={{ marginTop: '4px' }}>
                  <b>বাটন টেক্সট:</b> {btnInfo.btnText || '(নাই)'} | <b>বাটন লিংক (URL):</b> {btnInfo.btnLink || '(নাই)'}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-warning" onClick={editHeaderBtnSection}>
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button className="btn btn-danger" onClick={deleteHeaderBtnSection}>
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="btn btn-add" style={{ marginBottom: '15px' }} onClick={editHeaderBtnSection}>
            <i className="fa-solid fa-plus"></i> হেডার বাটন যোগ করুন
          </button>
        )}
          </>
        )}
      </div>

      {/* ২.৩ MENU & SUB-MENU CARD */}
      <div className="section-card menu-card">
        <div
          className="section-title"
          onClick={() => toggleSec('sec3')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSecs.sec3 ? '15px' : 0, paddingBottom: expandedSecs.sec3 ? '10px' : 0, borderBottom: expandedSecs.sec3 ? '1px dashed #e2e8f0' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-bars-staggered" style={{ color: '#20c997' }}></i>
            ২.৩ নেভিগেশন মেনু ও সাব-মেনু সেটিং
          </div>
          <i className={'fa-solid fa-chevron-' + (expandedSecs.sec3 ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b' }}></i>
        </div>

        {expandedSecs.sec3 && (
          <>

        {/* Menus List */}
        <div>
          {menus.length === 0 ? (
            <p style={{ color: '#777', marginBottom: '12px' }}>কোনো নেভিগেশন মেনু তৈরি করা হয়নি।</p>
          ) : (
            menus.map((m, mIdx) => {
              const hasMega = m.isMegaMenu === true && m.megaMenuId;
              const hasSub = m.subMenus && m.subMenus.length > 0;
              const isEditingThisMenu = editingMainMenuIdx === mIdx;
              const isConnectingThisMega = connectingMegaMIdx === mIdx;
              const isAddingSubThis = activeSubAddIdx === mIdx;

              const linkedMega = hasMega ? megaMenus.find((x) => x.id === m.megaMenuId) : null;
              const megaName = linkedMega ? linkedMega.title : '(মেগা মেনু পাওয়া যায়নি)';

              const isDraggingThis = dragItem?.type === 'main' && dragItem?.mIdx === mIdx;
              const dropPosThis = dropIndicator?.id === `main-${mIdx}` ? dropIndicator.position : null;

              return (
                <div
                  key={mIdx}
                  id={`main-menu-item-${mIdx}`}
                  className={`read-box draggable-item ${isDraggingThis ? 'dragging' : ''} ${dropPosThis === 'above' ? 'drop-above' : ''} ${dropPosThis === 'below' ? 'drop-below' : ''}`}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, 'main', mIdx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, `main-${mIdx}`, 'main', mIdx)}
                  onDrop={(e) => handleDrop(e, 'main', mIdx)}
                  style={{
                    borderLeft: `5px solid ${hasMega ? '#6f42c1' : '#20c997'}`,
                    marginBottom: '15px'
                  }}
                >
                  {isEditingThisMenu ? (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>
                        মেনু এডিট করুন
                      </div>
                      <div className="row">
                        <input
                          type="text"
                          value={editMainMenuForm.title}
                          onChange={(e) => setEditMainMenuForm({ ...editMainMenuForm, title: e.target.value })}
                          style={{ flex: 1, minWidth: '200px' }}
                          placeholder="মেনু টাইটেল"
                        />
                        <input
                          type="text"
                          value={editMainMenuForm.url}
                          onChange={(e) => setEditMainMenuForm({ ...editMainMenuForm, url: e.target.value })}
                          style={{ flex: 1, minWidth: '200px' }}
                          placeholder="URL"
                        />
                      </div>
                      <div className="card-actions">
                        <button className="btn btn-submit" onClick={() => saveEditMainMenu(mIdx)}>
                          <i className="fa-solid fa-floppy-disk"></i> Save Changes
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditingMainMenuIdx(null)}>
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="card-header-flex"
                        onClick={(e) => {
                          if (!e.target.closest('.card-actions') && !e.target.closest('button') && !e.target.closest('input')) {
                            toggleMenu(mIdx);
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedMenus[mIdx] ? '12px' : 0 }}
                      >
                        <div>
                          <div className="read-title" style={{ display: 'flex', alignItems: 'center' }}>
                            <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder" onClick={(e) => e.stopPropagation()}></i>
                            <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveMainMenuPosition(mIdx, 'up')}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="btn-arrow"
                                onClick={() => moveMainMenuPosition(mIdx, 'down')}
                              >
                                ▼
                              </button>
                            </div>
                            <i
                              className="fa-solid fa-bars"
                              style={{ color: hasMega ? '#6f42c1' : '#20c997', marginRight: '6px' }}
                            ></i>
                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{m.title || '(নাম নেই)'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal', marginLeft: '6px' }}>
                              (URL: {m.url || '#'})
                            </span>
                            {hasMega && (
                              <span
                                style={{
                                  background: '#6f42c1',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  marginLeft: '10px',
                                  display: 'inline-block'
                                }}
                              >
                                <i className="fa-solid fa-layer-group"></i> Mega Menu Active
                              </span>
                            )}
                            <i className={'fa-solid fa-chevron-' + (expandedMenus[mIdx] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                          </div>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-warning" onClick={() => startEditMainMenu(mIdx)}>
                            <i className="fa-solid fa-pen-to-square"></i> Edit Menu
                          </button>
                          <button className="btn btn-danger" onClick={() => deleteMainMenu(mIdx)}>
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>

                      {expandedMenus[mIdx] && (
                        <div style={{ marginLeft: '55px' }}>
                        {/* 1. If Mega Menu is Connected */}
                        {hasMega ? (
                          <div
                            style={{
                              background: '#f3e8ff',
                              padding: '12px 15px',
                              borderRadius: '6px',
                              border: '1px dashed #6f42c1',
                              color: '#6f42c1',
                              fontWeight: 'bold',
                              fontSize: '13px',
                              marginBottom: '10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '10px'
                            }}
                          >
                            <span>
                              <i className="fa-solid fa-link"></i> যুক্ত মেগা মেনু: <b>{megaName}</b>
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => openConnectMegaMenu(mIdx)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i> পরিবর্তন
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => removeMegaMenuConnection(mIdx)}
                              >
                                <i className="fa-solid fa-trash"></i> কানেকশন মুছুন
                              </button>
                            </div>
                          </div>
                        ) : hasSub ? (
                          /* 2. If Regular Submenu exists */
                          <div className="sub-menu-list">
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>
                              সাধারণ সাব-মেনু সমূহ:
                            </div>
                            {m.subMenus.map((sm, smIdx) => {
                              const isEditingThisSub = editingSubMenu?.mIdx === mIdx && editingSubMenu?.smIdx === smIdx;
                              const isDraggingThisSub =
                                dragItem?.type === 'sub' && dragItem?.mIdx === mIdx && dragItem?.idx2 === smIdx;
                              const dropPosSub =
                                dropIndicator?.id === `sub-${mIdx}-${smIdx}` ? dropIndicator.position : null;

                              return (
                                <div
                                  key={smIdx}
                                  id={`sub-item-${mIdx}-${smIdx}`}
                                  className={`sub-menu-item draggable-item ${isDraggingThisSub ? 'dragging' : ''} ${dropPosSub === 'above' ? 'drop-above' : ''} ${dropPosSub === 'below' ? 'drop-below' : ''}`}
                                  draggable="true"
                                  onDragStart={(e) => handleDragStart(e, 'sub', mIdx, smIdx)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => handleDragOver(e, `sub-${mIdx}-${smIdx}`, 'sub', mIdx, smIdx)}
                                  onDrop={(e) => handleDrop(e, 'sub', mIdx, smIdx)}
                                  style={{
                                    display: isEditingThisSub ? 'block' : 'flex'
                                  }}
                                >
                                  {isEditingThisSub ? (
                                    <div>
                                      <div className="row" style={{ marginBottom: '5px' }}>
                                        <input
                                          type="text"
                                          value={editSubMenuForm.title}
                                          onChange={(e) =>
                                            setEditSubMenuForm({ ...editSubMenuForm, title: e.target.value })
                                          }
                                          style={{ flex: 1 }}
                                        />
                                        <input
                                          type="text"
                                          value={editSubMenuForm.url}
                                          onChange={(e) =>
                                            setEditSubMenuForm({ ...editSubMenuForm, url: e.target.value })
                                          }
                                          style={{ flex: 1 }}
                                        />
                                      </div>
                                      <div className="card-actions" style={{ marginTop: '5px' }}>
                                        <button
                                          className="btn btn-submit btn-sm"
                                          onClick={() => saveSubMenuInline(mIdx, smIdx)}
                                        >
                                          <i className="fa-solid fa-floppy-disk"></i> Save
                                        </button>
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          onClick={() => setEditingSubMenu(null)}
                                        >
                                          <i className="fa-solid fa-xmark"></i> Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                        <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder"></i>
                                        <div className="arrow-btn-group">
                                          <button
                                            type="button"
                                            className="btn-arrow"
                                            onClick={() => moveSubMenuPosition(mIdx, smIdx, 'up')}
                                          >
                                            ▲
                                          </button>
                                          <button
                                            type="button"
                                            className="btn-arrow"
                                            onClick={() => moveSubMenuPosition(mIdx, smIdx, 'down')}
                                          >
                                            ▼
                                          </button>
                                        </div>
                                        <b>{sm.title}</b>{' '}
                                        <small style={{ color: '#777', marginLeft: '5px' }}>({sm.url || '#'})</small>
                                      </span>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          className="btn btn-warning btn-sm"
                                          onClick={() => startEditSubMenu(mIdx, smIdx)}
                                        >
                                          <i className="fa-solid fa-pen-to-square"></i> Edit
                                        </button>
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => deleteSubMenu(mIdx, smIdx)}
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
                        ) : (
                          /* 3. Empty Submenu & Mega */
                          <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic', marginBottom: '10px' }}>
                            কোনো সাব-মেনু বা মেগা মেনু যুক্ত নেই।
                          </p>
                        )}

                        {/* Multi-row Inline Add SubMenu Form */}
                        {isAddingSubThis && (
                          <div
                            style={{
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              marginBottom: '10px'
                            }}
                          >
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0284c7', marginBottom: '10px' }}>
                              <span>নতুন সাব-মেনু যোগ করুন:</span>
                            </div>

                            {newSubMenuRows.map((row, rIdx) => (
                              <div key={rIdx} className="row" style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  placeholder="সাব-মেনু টাইটেল"
                                  value={row.title}
                                  onChange={(e) => updateNewSubMenuRow(rIdx, 'title', e.target.value)}
                                  style={{ flex: 1, minWidth: '150px' }}
                                />
                                <input
                                  type="text"
                                  placeholder="URL"
                                  value={row.url}
                                  onChange={(e) => updateNewSubMenuRow(rIdx, 'url', e.target.value)}
                                  style={{ flex: 1, minWidth: '150px' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeNewSubMenuRow(rIdx)}
                                  title="মুছে ফেলুন"
                                  style={{ height: '38px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                                >
                                  <i className="fa-solid fa-trash"></i> Delete
                                </button>
                              </div>
                            ))}

                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-info btn-sm"
                                onClick={addNewSubMenuRow}
                                title="আরও একটি সাব-মেনু রো যোগ করুন"
                              >
                                <i className="fa-solid fa-plus"></i> আরও সাব-মেনু যোগ করুন
                              </button>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-submit btn-sm" onClick={() => saveAllNewSubMenus(mIdx)}>
                                  <i className="fa-solid fa-floppy-disk"></i> Save
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => { setActiveSubAddIdx(null); setNewSubMenuRows([]); }}>
                                  <i className="fa-solid fa-xmark"></i> Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inline Connect Mega Menu Form */}
                        {isConnectingThisMega && (
                          <div
                            style={{
                              background: megaMenus.length === 0 ? '#fff3cd' : '#f3e8ff',
                              color: megaMenus.length === 0 ? '#856404' : '#6f42c1',
                              padding: '12px 15px',
                              borderRadius: '6px',
                              border: `1px solid ${megaMenus.length === 0 ? '#ffeeba' : '#d8b4fe'}`,
                              marginBottom: '10px'
                            }}
                          >
                            {megaMenus.length === 0 ? (
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '13px',
                                  flexWrap: 'wrap',
                                  gap: '10px'
                                }}
                              >
                                <span>
                                  <i className="fa-solid fa-triangle-exclamation"></i> কোনো মেগা মেনু পাওয়া যায়নি! ২.৪
                                  সেকশন থেকে আগে একটি মেগা মেনু তৈরি করুন।
                                </span>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setConnectingMegaMIdx(null)}
                                >
                                  <i className="fa-solid fa-xmark"></i> বন্ধ করুন
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                                  <i className="fa-solid fa-layer-group"></i> মেগা মেনু সিলেক্ট করুন:
                                </div>
                                <div className="row" style={{ marginBottom: 0 }}>
                                  <select
                                    value={selectedMegaId}
                                    onChange={(e) => setSelectedMegaId(e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '5px',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#333'
                                    }}
                                  >
                                    {megaMenus.map((mega) => (
                                      <option key={mega.id} value={mega.id}>
                                        {mega.title}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    className="btn btn-submit btn-sm"
                                    onClick={() => saveMegaMenuConnection(mIdx)}
                                  >
                                    <i className="fa-solid fa-floppy-disk"></i> কানেক্ট করুন
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setConnectingMegaMIdx(null)}
                                  >
                                    <i className="fa-solid fa-xmark"></i> Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons if not connecting mega and not adding sub */}
                        {!isConnectingThisMega && !hasMega && !isAddingSubThis && (
                          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => openAddSubMenuForm(mIdx)}
                            >
                              <i className="fa-solid fa-plus"></i> সাব-মেনু যোগ করুন
                            </button>
                            {!hasSub && (
                              <button
                                className="btn btn-purple btn-sm"
                                style={{ background: '#6f42c1', color: 'white' }}
                                onClick={() => openConnectMegaMenu(mIdx)}
                              >
                                <i className="fa-solid fa-layer-group"></i> মেগা মেনু কানেক্ট করুন
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Main Menu Inline Form */}
        {isAddingMainMenu ? (
          <div className="read-box" style={{ borderLeft: '5px solid #28a745', background: '#ffffff', marginTop: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#28a745' }}>
              নতুন মূল মেনু যোগ করুন
            </div>

            {newMainMenuRows.map((row, rIdx) => (
              <div
                key={rIdx}
                className="row"
                style={{
                  flexWrap: 'wrap',
                  background: '#f8fafc',
                  padding: '12px 15px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder="মেনু টাইটেল (যেমন: সাধারণ জ্ঞান)"
                  value={row.title}
                  onChange={(e) => updateNewMainMenuRow(rIdx, 'title', e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <input
                  type="text"
                  placeholder="URL (যেমন: /all-mcq)"
                  value={row.url}
                  onChange={(e) => updateNewMainMenuRow(rIdx, 'url', e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeNewMainMenuRow(rIdx)}
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
                onClick={addNewMainMenuRow}
                title="আরও একটি মূল মেনু যোগ করুন"
              >
                <i className="fa-solid fa-plus"></i> আরও মূল মেনু যোগ করুন
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-submit" onClick={saveAllNewMainMenus}>
                  <i className="fa-solid fa-floppy-disk"></i> Save Menu
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddingMainMenu(false);
                    setNewMainMenuRows([]);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
            <button className="btn btn-add" onClick={openAddMainMenuForm}>
              <i className="fa-solid fa-plus"></i> মূল মেনু যোগ করুন
            </button>
          </div>
        )}
          </>
        )}
      </div>

      {/* ২.৪ MEGA MENU BUILDER CARD */}
      <div className="section-card mega-menu-card">
        <div
          className="section-title"
          onClick={() => toggleSec('sec4')}
          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSecs.sec4 ? '15px' : 0, paddingBottom: expandedSecs.sec4 ? '10px' : 0, borderBottom: expandedSecs.sec4 ? '1px dashed #e2e8f0' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-layer-group" style={{ color: '#6f42c1' }}></i>
            ২.৪ মেগা মেনু বিল্ডার (Multiple Mega Menus)
          </div>
          <i className={'fa-solid fa-chevron-' + (expandedSecs.sec4 ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b' }}></i>
        </div>

        {expandedSecs.sec4 && (
          <>

        <div>
          {megaMenus.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>
              কোনো মেগা মেনু তৈরি করা হয়নি। নিচে "নতুন মেগা মেনু তৈরি করুন" বাটনে ক্লিক করুন।
            </p>
          ) : (
            megaMenus.map((mega, mIdx) => {
              const isRenamingThisBlock = editingMegaBlockIdx === mIdx;

              return (
                <div
                  key={mega.id || mIdx}
                  className="read-box"
                  style={{
                    borderLeft: '6px solid #6f42c1',
                    marginBottom: '25px',
                    background: '#fdfdfd',
                    padding: '25px'
                  }}
                >
                  {/* Mega Menu Block Header */}
                  <div
                    className="card-header-flex"
                    onClick={(e) => {
                      if (!e.target.closest('.card-actions') && !e.target.closest('button') && !e.target.closest('input')) {
                        toggleMegaBlock(mIdx);
                      }
                    }}
                    style={{
                      background: '#f8fafc',
                      padding: '12px 18px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      marginBottom: expandedMegaBlocks[mIdx] ? '18px' : 0,
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {isRenamingThisBlock ? (
                      <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editMegaBlockTitle}
                          onChange={(e) => setEditMegaBlockTitle(e.target.value)}
                          style={{ flex: 1, maxWidth: '300px' }}
                          placeholder="মেগা মেনুর নাম"
                        />
                        <button
                          className="btn btn-submit btn-sm"
                          onClick={() => saveRenameMegaBlock(mIdx)}
                        >
                          <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingMegaBlockIdx(null)}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3
                          style={{
                            color: '#6f42c1',
                            margin: 0,
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <i className="fa-solid fa-cube"></i> মেগা মেনু ব্লক: {mega.title}
                          <i className={'fa-solid fa-chevron-' + (expandedMegaBlocks[mIdx] ? 'down' : 'right')} style={{ fontSize: '14px', color: '#64748b', marginLeft: '10px' }}></i>
                        </h3>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => startRenameMegaBlock(mIdx)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> রিনেম
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteMegaBlock(mIdx)}
                          >
                            <i className="fa-solid fa-trash"></i> ডিলিট ব্লক
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {expandedMegaBlocks[mIdx] && (
                    <>
                  {/* Columns List */}
                  <div>
                    {!mega.columns || mega.columns.length === 0 ? (
                      <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
                        কোনো কলাম যোগ করা হয়নি।
                      </p>
                    ) : (
                      mega.columns.map((col, cIdx) => {
                        const isDraggingCol =
                          dragItem?.type === 'megacol' && dragItem?.mIdx === mIdx && dragItem?.idx2 === cIdx;
                        const dropPosCol =
                          dropIndicator?.id === `megacol-${mIdx}-${cIdx}` ? dropIndicator.position : null;

                        if (col.type === 'info') {
                          const isEditingThisInfo =
                            editingMegaInfo?.mIdx === mIdx && editingMegaInfo?.cIdx === cIdx;

                          return (
                            <div
                              key={cIdx}
                              id={`mega-col-${mIdx}-${cIdx}`}
                              className={`read-box draggable-item ${isDraggingCol ? 'dragging' : ''} ${dropPosCol === 'above' ? 'drop-above' : ''} ${dropPosCol === 'below' ? 'drop-below' : ''}`}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, 'megacol', mIdx, cIdx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, `megacol-${mIdx}-${cIdx}`, 'megacol', mIdx, cIdx)}
                              onDrop={(e) => handleDrop(e, 'megacol', mIdx, cIdx)}
                              style={{
                                borderLeft: '4px solid #17a2b8',
                                padding: '15px',
                                marginBottom: '12px',
                                background: '#ffffff'
                              }}
                            >
                              {isEditingThisInfo ? (
                                <div>
                                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#17a2b8' }}>
                                    সাইট তথ্য এডিট করুন (Info Column)
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                      <label>FontAwesome Icon Class:</label>
                                      <input
                                        type="text"
                                        value={editMegaInfoForm.iconHtml}
                                        onChange={(e) =>
                                          setEditMegaInfoForm({ ...editMegaInfoForm, iconHtml: e.target.value })
                                        }
                                        placeholder="যেমন: fa-solid fa-circle-info"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>কলাম টাইটেল:</label>
                                      <input
                                        type="text"
                                        value={editMegaInfoForm.title}
                                        onChange={(e) =>
                                          setEditMegaInfoForm({ ...editMegaInfoForm, title: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>সাইট সম্পর্কে বিবরণ:</label>
                                      <textarea
                                        rows="3"
                                        value={editMegaInfoForm.text}
                                        onChange={(e) =>
                                          setEditMegaInfoForm({ ...editMegaInfoForm, text: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>লিংক / Target URL (ঐচ্ছিক):</label>
                                      <input
                                        type="text"
                                        value={editMegaInfoForm.url}
                                        onChange={(e) =>
                                          setEditMegaInfoForm({ ...editMegaInfoForm, url: e.target.value })
                                        }
                                        placeholder="যেমন: /about-us অথবা https://..."
                                      />
                                    </div>
                                  </div>
                                  <div className="card-actions" style={{ marginTop: '10px' }}>
                                    <button
                                      className="btn btn-submit"
                                      onClick={() => saveMegaInfoInline(mIdx, cIdx)}
                                    >
                                      <i className="fa-solid fa-floppy-disk"></i> Save Changes
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => setEditingMegaInfo(null)}
                                    >
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
                                        toggleMegaCol(mIdx, cIdx);
                                      }
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedMegaCols[`${mIdx}-${cIdx}`] ? '10px' : 0 }}
                                  >
                                    <div className="read-title" style={{ display: 'flex', alignItems: 'center' }}>
                                      <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder" onClick={(e) => e.stopPropagation()}></i>
                                      <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'up')}
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'down')}
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <span
                                        style={{ color: '#17a2b8', marginRight: '8px', fontSize: '18px' }}
                                        dangerouslySetInnerHTML={{
                                          __html: col.iconHtml || '<i class="fa-solid fa-circle-info"></i>'
                                        }}
                                      ></span>
                                      {col.title && col.title.trim() ? col.title : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Without Title</span>}{' '}
                                      <small style={{ color: '#777', fontWeight: 'normal', marginLeft: '8px' }}>
                                        (Info Column)
                                      </small>
                                      <i className={'fa-solid fa-chevron-' + (expandedMegaCols[`${mIdx}-${cIdx}`] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                                    </div>
                                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => startEditMegaInfo(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteMegaCol(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-trash"></i> Delete
                                      </button>
                                    </div>
                                  </div>
                                  {expandedMegaCols[`${mIdx}-${cIdx}`] && (
                                    <div style={{ marginLeft: '30px', fontSize: '13px', color: '#555', marginTop: '6px' }}>
                                      {col.text || 'কোনো বিবরণ নেই'}
                                      {col.url && <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}><b>URL:</b> {col.url}</div>}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        }

                        // Image Column
                        if (col.type === 'image') {
                          const isEditingThisImage =
                            editingMegaImage?.mIdx === mIdx && editingMegaImage?.cIdx === cIdx;

                          return (
                            <div
                              key={cIdx}
                              id={`mega-col-${mIdx}-${cIdx}`}
                              className={`read-box draggable-item ${isDraggingCol ? 'dragging' : ''} ${dropPosCol === 'above' ? 'drop-above' : ''} ${dropPosCol === 'below' ? 'drop-below' : ''}`}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, 'megacol', mIdx, cIdx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, `megacol-${mIdx}-${cIdx}`, 'megacol', mIdx, cIdx)}
                              onDrop={(e) => handleDrop(e, 'megacol', mIdx, cIdx)}
                              style={{
                                borderLeft: '4px solid #e056fd',
                                padding: '15px',
                                marginBottom: '12px',
                                background: '#ffffff'
                              }}
                            >
                              {isEditingThisImage ? (
                                <div>
                                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#e056fd' }}>
                                    ইমেজ কলাম এডিট করুন (Image Column)
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                      <label>কলাম টাইটেল:</label>
                                      <input
                                        type="text"
                                        value={editMegaImageForm.title}
                                        onChange={(e) =>
                                          setEditMegaImageForm({ ...editMegaImageForm, title: e.target.value })
                                        }
                                        placeholder="যেমন: POSTS CAROUSEL"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>ইমেজ URL (Image Path):</label>
                                      <input
                                        type="text"
                                        value={editMegaImageForm.imageUrl}
                                        onChange={(e) =>
                                          setEditMegaImageForm({ ...editMegaImageForm, imageUrl: e.target.value })
                                        }
                                        placeholder="যেমন: /images/banner.jpg অথবা https://..."
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>ইমেজ ক্লিক লিংক / Target URL (ঐচ্ছিক):</label>
                                      <input
                                        type="text"
                                        value={editMegaImageForm.url}
                                        onChange={(e) =>
                                          setEditMegaImageForm({ ...editMegaImageForm, url: e.target.value })
                                        }
                                        placeholder="যেমন: /all-mcq"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>বিবরণ / সাবটাইটেল (ঐচ্ছিক):</label>
                                      <input
                                        type="text"
                                        value={editMegaImageForm.text}
                                        onChange={(e) =>
                                          setEditMegaImageForm({ ...editMegaImageForm, text: e.target.value })
                                        }
                                        placeholder="যেমন: বিস্তারিত দেখতে ক্লিক করুন"
                                      />
                                    </div>
                                  </div>
                                  <div className="card-actions" style={{ marginTop: '10px' }}>
                                    <button
                                      className="btn btn-submit"
                                      onClick={() => saveMegaImageInline(mIdx, cIdx)}
                                    >
                                      <i className="fa-solid fa-floppy-disk"></i> Save Changes
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => setEditingMegaImage(null)}
                                    >
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
                                        toggleMegaCol(mIdx, cIdx);
                                      }
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedMegaCols[`${mIdx}-${cIdx}`] ? '10px' : 0 }}
                                  >
                                    <div className="read-title" style={{ display: 'flex', alignItems: 'center' }}>
                                      <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder" onClick={(e) => e.stopPropagation()}></i>
                                      <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'up')}
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'down')}
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <i className="fa-solid fa-image" style={{ color: '#e056fd', marginRight: '8px', fontSize: '18px' }}></i>
                                      {col.title && col.title.trim() ? col.title : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Without Title</span>}{' '}
                                      <small style={{ color: '#777', fontWeight: 'normal', marginLeft: '8px' }}>
                                        (Image Column)
                                      </small>
                                      <i className={'fa-solid fa-chevron-' + (expandedMegaCols[`${mIdx}-${cIdx}`] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                                    </div>
                                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => startEditMegaImage(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteMegaCol(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-trash"></i> Delete
                                      </button>
                                    </div>
                                  </div>
                                  {expandedMegaCols[`${mIdx}-${cIdx}`] && (
                                    <div style={{ marginLeft: '30px', marginTop: '6px' }}>
                                      <img
                                        src={col.imageUrl || '/images/banner.jpg'}
                                        alt=""
                                        style={{ maxWidth: '180px', maxHeight: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                      />
                                      {col.text && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{col.text}</div>}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        }

                        // Icon Column
                        if (col.type === 'icon') {
                          const isRenamingColTitle =
                            editingMegaColTitle?.mIdx === mIdx && editingMegaColTitle?.cIdx === cIdx;
                          const isAddingIconThis =
                            activeMegaIconAdd?.mIdx === mIdx && activeMegaIconAdd?.cIdx === cIdx;

                          return (
                            <div
                              key={cIdx}
                              id={`mega-col-${mIdx}-${cIdx}`}
                              className={`read-box draggable-item ${isDraggingCol ? 'dragging' : ''} ${dropPosCol === 'above' ? 'drop-above' : ''} ${dropPosCol === 'below' ? 'drop-below' : ''}`}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, 'megacol', mIdx, cIdx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, `megacol-${mIdx}-${cIdx}`, 'megacol', mIdx, cIdx)}
                              onDrop={(e) => handleDrop(e, 'megacol', mIdx, cIdx)}
                              style={{
                                borderLeft: '4px solid #0984e3',
                                padding: '15px',
                                marginBottom: '12px',
                                background: '#ffffff'
                              }}
                            >
                              {isRenamingColTitle ? (
                                <div>
                                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0984e3' }}>
                                    আইকন কলাম টাইটেল এডিট করুন
                                  </div>
                                  <div className="form-group">
                                    <label>কলাম টাইটেল:</label>
                                    <input
                                      type="text"
                                      value={editMegaColTitleForm}
                                      onChange={(e) => setEditMegaColTitleForm(e.target.value)}
                                    />
                                  </div>
                                  <div className="card-actions" style={{ marginTop: '10px' }}>
                                    <button
                                      className="btn btn-submit"
                                      onClick={() => saveRenameMegaColTitle(mIdx, cIdx)}
                                    >
                                      <i className="fa-solid fa-floppy-disk"></i> Save Title
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => setEditingMegaColTitle(null)}
                                    >
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
                                        toggleMegaCol(mIdx, cIdx);
                                      }
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedMegaCols[`${mIdx}-${cIdx}`] ? '10px' : 0 }}
                                  >
                                    <div className="read-title" style={{ display: 'flex', alignItems: 'center' }}>
                                      <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder" onClick={(e) => e.stopPropagation()}></i>
                                      <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'up')}
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-arrow"
                                          onClick={() => moveMegaCol(mIdx, cIdx, 'down')}
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <i className="fa-solid fa-icons" style={{ color: '#0984e3', marginRight: '8px', fontSize: '18px' }}></i>
                                      {col.title && col.title.trim() ? col.title : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Without Title</span>}{' '}
                                      <small style={{ color: '#777', fontWeight: 'normal', marginLeft: '8px' }}>
                                        (Icon Column)
                                      </small>
                                      <i className={'fa-solid fa-chevron-' + (expandedMegaCols[`${mIdx}-${cIdx}`] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                                    </div>
                                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => startRenameMegaColTitle(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit Title
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteMegaCol(mIdx, cIdx)}
                                      >
                                        <i className="fa-solid fa-trash"></i> Delete Column
                                      </button>
                                    </div>
                                  </div>

                                  {expandedMegaCols[`${mIdx}-${cIdx}`] && (
                                    <>

                                  {/* Icon Items List */}
                                  <div style={{ marginLeft: '25px', marginTop: '10px' }}>
                                    {!col.items || col.items.length === 0 ? (
                                      <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
                                        কোনো আইকন আইটেম যোগ করা হয়নি।
                                      </p>
                                    ) : (
                                      col.items.map((item, iIdx) => {
                                        const isEditingThisIcon =
                                          editingMegaIconItem?.mIdx === mIdx &&
                                          editingMegaIconItem?.cIdx === cIdx &&
                                          editingMegaIconItem?.iIdx === iIdx;

                                        return (
                                          <div
                                            key={iIdx}
                                            style={{
                                              padding: '8px 12px',
                                              border: '1px dashed #cbd5e1',
                                              borderRadius: '6px',
                                              marginBottom: '8px',
                                              background: '#f8fafc',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              flexWrap: 'wrap'
                                            }}
                                          >
                                            {isEditingThisIcon ? (
                                              <div style={{ width: '100%' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                                                  <select
                                                    value={editMegaIconItemForm.iconType}
                                                    onChange={(e) => setEditMegaIconItemForm({ ...editMegaIconItemForm, iconType: e.target.value })}
                                                    style={{ width: '100%' }}
                                                  >
                                                    <option value="fontawesome">FontAwesome Class</option>
                                                    <option value="flaticon">Flaticon (URL)</option>
                                                  </select>
                                                  <input
                                                    type="text"
                                                    value={editMegaIconItemForm.iconValue}
                                                    onChange={(e) => setEditMegaIconItemForm({ ...editMegaIconItemForm, iconValue: e.target.value })}
                                                    placeholder={editMegaIconItemForm.iconType === 'flaticon' ? 'Flaticon URL' : 'Icon Class (যেমন: fa-solid fa-star)'}
                                                    style={{ width: '100%' }}
                                                  />
                                                  <input
                                                    type="text"
                                                    value={editMegaIconItemForm.title}
                                                    onChange={(e) => setEditMegaIconItemForm({ ...editMegaIconItemForm, title: e.target.value })}
                                                    placeholder="টাইটেল (যেমন: Banking)"
                                                    style={{ width: '100%' }}
                                                  />
                                                  <input
                                                    type="text"
                                                    value={editMegaIconItemForm.desc}
                                                    onChange={(e) => setEditMegaIconItemForm({ ...editMegaIconItemForm, desc: e.target.value })}
                                                    placeholder="বিবরণ / সাবটাইটেল"
                                                    style={{ width: '100%' }}
                                                  />
                                                  <input
                                                    type="text"
                                                    value={editMegaIconItemForm.url}
                                                    onChange={(e) => setEditMegaIconItemForm({ ...editMegaIconItemForm, url: e.target.value })}
                                                    placeholder="URL (যেমন: /all-mcq)"
                                                    style={{ width: '100%', gridColumn: '1 / -1' }}
                                                  />
                                                </div>
                                                <div className="card-actions">
                                                  <button className="btn btn-submit btn-sm" onClick={() => saveMegaIconItemInline(mIdx, cIdx, iIdx)}>
                                                    <i className="fa-solid fa-floppy-disk"></i> Save
                                                  </button>
                                                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingMegaIconItem(null)}>
                                                    <i className="fa-solid fa-xmark"></i> Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                  {item.iconType === 'flaticon' || item.iconValue?.startsWith('http') || item.iconValue?.startsWith('/') ? (
                                                    <img src={item.iconValue} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                                  ) : (
                                                    <i className={item.iconValue || 'fa-solid fa-building-columns'} style={{ fontSize: '16px', color: '#0984e3' }}></i>
                                                  )}
                                                  <div>
                                                    <b style={{ fontSize: '13.5px', color: '#1e293b' }}>{item.title}</b>
                                                    {item.desc && <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>{item.desc}</small>}
                                                  </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                  <button className="btn btn-warning btn-sm" onClick={() => startEditMegaIconItem(mIdx, cIdx, iIdx)}>
                                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                                  </button>
                                                  <button className="btn btn-danger btn-sm" onClick={() => deleteMegaIconItem(mIdx, cIdx, iIdx)}>
                                                    <i className="fa-solid fa-trash"></i> Delete
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}

                                    {/* Multi-row Add Icon Items Form */}
                                    {isAddingIconThis ? (
                                      <div style={{ background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0984e3', marginBottom: '10px' }}>
                                          নতুন আইকন আইটেম যোগ করুন:
                                        </div>
                                        {newMegaIconRows.map((row, rIdx) => (
                                          <div key={rIdx} style={{ marginBottom: '10px', padding: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                                              <select
                                                value={row.iconType}
                                                onChange={(e) => updateNewMegaIconRow(rIdx, 'iconType', e.target.value)}
                                                style={{ width: '100%' }}
                                              >
                                                <option value="fontawesome">FontAwesome Class</option>
                                                <option value="flaticon">Flaticon (URL)</option>
                                              </select>
                                              <input
                                                type="text"
                                                placeholder={row.iconType === 'flaticon' ? 'Flaticon Image URL' : 'Icon Class (যেমন: fa-solid fa-star)'}
                                                value={row.iconValue}
                                                onChange={(e) => updateNewMegaIconRow(rIdx, 'iconValue', e.target.value)}
                                                style={{ width: '100%' }}
                                              />
                                              <input
                                                type="text"
                                                placeholder="টাইটেল (যেমন: Banking)"
                                                value={row.title}
                                                onChange={(e) => updateNewMegaIconRow(rIdx, 'title', e.target.value)}
                                                style={{ width: '100%' }}
                                              />
                                              <input
                                                type="text"
                                                placeholder="বিবরণ / সাবটাইটেল"
                                                value={row.desc}
                                                onChange={(e) => updateNewMegaIconRow(rIdx, 'desc', e.target.value)}
                                                style={{ width: '100%' }}
                                              />
                                              <input
                                                type="text"
                                                placeholder="URL (যেমন: /all-mcq)"
                                                value={row.url}
                                                onChange={(e) => updateNewMegaIconRow(rIdx, 'url', e.target.value)}
                                                style={{ width: '100%' }}
                                              />
                                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                  type="button"
                                                  className="btn btn-danger btn-sm"
                                                  onClick={() => removeNewMegaIconRow(rIdx)}
                                                  style={{ height: '38px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                  <i className="fa-solid fa-trash"></i> Delete Row
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                          <button type="button" className="btn btn-secondary btn-sm" onClick={addNewMegaIconRow}>
                                            <i className="fa-solid fa-plus"></i> + আরও যোগ করুন
                                          </button>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <button type="button" className="btn btn-submit btn-sm" onClick={() => saveAllNewMegaIcons(mIdx, cIdx)}>
                                              <i className="fa-solid fa-floppy-disk"></i> সব সেভ করুন
                                            </button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setActiveMegaIconAdd(null); setNewMegaIconRows([]); }}>
                                              <i className="fa-solid fa-xmark"></i> Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button className="btn btn-add btn-sm" style={{ marginTop: '6px' }} onClick={() => openAddMegaIconForm(mIdx, cIdx)}>
                                        <i className="fa-solid fa-plus"></i> + আইকন যোগ করুন
                                      </button>
                                    )}
                                  </div>
                                  </>
                                  )}
                                 </>
                               )}
                            </div>
                          );
                        }

                        // Links Column
                        const isRenamingColTitle =
                          editingMegaColTitle?.mIdx === mIdx && editingMegaColTitle?.cIdx === cIdx;
                        const isAddingLinkThis =
                          activeMegaLinkAdd?.mIdx === mIdx && activeMegaLinkAdd?.cIdx === cIdx;

                        return (
                          <div
                            key={cIdx}
                            id={`mega-col-${mIdx}-${cIdx}`}
                            className={`read-box draggable-item ${isDraggingCol ? 'dragging' : ''} ${dropPosCol === 'above' ? 'drop-above' : ''} ${dropPosCol === 'below' ? 'drop-below' : ''}`}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, 'megacol', mIdx, cIdx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, `megacol-${mIdx}-${cIdx}`, 'megacol', mIdx, cIdx)}
                            onDrop={(e) => handleDrop(e, 'megacol', mIdx, cIdx)}
                            style={{
                              borderLeft: '4px solid #28a745',
                              padding: '15px',
                              marginBottom: '12px',
                              background: '#ffffff'
                            }}
                          >
                            {isRenamingColTitle ? (
                              <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#28a745' }}>
                                  কলাম টাইটেল এডিট করুন
                                </div>
                                <div className="form-group">
                                  <label>কলাম টাইটেল:</label>
                                  <input
                                    type="text"
                                    value={editMegaColTitleForm}
                                    onChange={(e) => setEditMegaColTitleForm(e.target.value)}
                                  />
                                </div>
                                <div className="card-actions">
                                  <button
                                    className="btn btn-submit"
                                    onClick={() => saveMegaColTitleInline(mIdx, cIdx)}
                                  >
                                    <i className="fa-solid fa-floppy-disk"></i> Save
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => setEditingMegaColTitle(null)}
                                  >
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
                                        toggleMegaCol(mIdx, cIdx);
                                      }
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none', marginBottom: expandedMegaCols[`${mIdx}-${cIdx}`] ? '10px' : 0 }}
                                >
                                  <div className="read-title" style={{ display: 'flex', alignItems: 'center' }}>
                                    <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder" onClick={(e) => e.stopPropagation()}></i>
                                    <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        className="btn-arrow"
                                        onClick={() => moveMegaCol(mIdx, cIdx, 'up')}
                                      >
                                        ▲
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-arrow"
                                        onClick={() => moveMegaCol(mIdx, cIdx, 'down')}
                                      >
                                        ▼
                                      </button>
                                    </div>
                                    <i
                                      className="fa-solid fa-list"
                                      style={{ color: '#28a745', marginRight: '5px' }}
                                    ></i>{' '}
                                    {col.title && col.title.trim() ? col.title : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Without Title</span>}{' '}
                                    <small style={{ color: '#777', fontWeight: 'normal', marginLeft: '8px' }}>
                                      (Links Column)
                                    </small>
                                    <i className={'fa-solid fa-chevron-' + (expandedMegaCols[`${mIdx}-${cIdx}`] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                                  </div>
                                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      className="btn btn-warning btn-sm"
                                      onClick={() => startRenameMegaColTitle(mIdx, cIdx)}
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i> Edit Title
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => deleteMegaCol(mIdx, cIdx)}
                                    >
                                      <i className="fa-solid fa-trash"></i> Delete Column
                                    </button>
                                  </div>
                                </div>

                                {expandedMegaCols[`${mIdx}-${cIdx}`] && (
                                  <>

                                {/* Links in this column */}
                                <div style={{ marginLeft: '30px', paddingLeft: '10px', marginBottom: '10px', marginTop: '5px' }}>
                                  {(col.links || []).map((lk, lIdx) => {
                                    const isEditingThisLink =
                                      editingMegaLink?.mIdx === mIdx &&
                                      editingMegaLink?.cIdx === cIdx &&
                                      editingMegaLink?.lIdx === lIdx;
                                    const isDraggingLink =
                                      dragItem?.type === 'megalink' &&
                                      dragItem?.mIdx === mIdx &&
                                      dragItem?.idx2 === cIdx &&
                                      dragItem?.idx3 === lIdx;
                                    const dropPosLink =
                                      dropIndicator?.id === `mega-link-${mIdx}-${cIdx}-${lIdx}`
                                        ? dropIndicator.position
                                        : null;

                                    return (
                                      <div
                                        key={lIdx}
                                        id={`mega-link-${mIdx}-${cIdx}-${lIdx}`}
                                        className={`sub-menu-item draggable-item ${isDraggingLink ? 'dragging' : ''} ${dropPosLink === 'above' ? 'drop-above' : ''} ${dropPosLink === 'below' ? 'drop-below' : ''}`}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, 'megalink', mIdx, cIdx, lIdx)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) =>
                                          handleDragOver(e, `mega-link-${mIdx}-${cIdx}-${lIdx}`, 'megalink', mIdx, cIdx, lIdx)
                                        }
                                        onDrop={(e) => handleDrop(e, 'megalink', mIdx, cIdx, lIdx)}
                                        style={{
                                          padding: '6px 12px',
                                          border: '1px dashed #cbd5e1',
                                          background: isEditingThisLink ? '#ffffff' : '#fdfdfd',
                                          flexWrap: 'wrap'
                                        }}
                                      >
                                        {isEditingThisLink ? (
                                          <div style={{ width: '100%' }}>
                                            <div className="row" style={{ marginBottom: '5px', width: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                              <input
                                                type="text"
                                                value={editMegaLinkForm.title}
                                                onChange={(e) =>
                                                  setEditMegaLinkForm({ ...editMegaLinkForm, title: e.target.value })
                                                }
                                                style={{ flex: 1, minWidth: '130px' }}
                                                placeholder="টাইটেল"
                                              />
                                              <input
                                                type="text"
                                                value={editMegaLinkForm.url}
                                                onChange={(e) =>
                                                  setEditMegaLinkForm({ ...editMegaLinkForm, url: e.target.value })
                                                }
                                                style={{ flex: 1, minWidth: '130px' }}
                                                placeholder="URL"
                                              />
                                            </div>
                                            <div className="card-actions" style={{ marginTop: '5px', width: '100%' }}>
                                              <button
                                                className="btn btn-submit btn-sm"
                                                onClick={() => saveMegaLinkInline(mIdx, cIdx, lIdx)}
                                              >
                                                <i className="fa-solid fa-floppy-disk"></i> Save
                                              </button>
                                              <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setEditingMegaLink(null)}
                                              >
                                                <i className="fa-solid fa-xmark"></i> Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                              <i className="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder"></i>
                                              <div className="arrow-btn-group">
                                                <button
                                                  type="button"
                                                  className="btn-arrow"
                                                  onClick={() => moveMegaLink(mIdx, cIdx, lIdx, 'up')}
                                                >
                                                  ▲
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn-arrow"
                                                  onClick={() => moveMegaLink(mIdx, cIdx, lIdx, 'down')}
                                                >
                                                  ▼
                                                </button>
                                              </div>
                                              <div>
                                                <b>{lk.title}</b>
                                                <small style={{ color: '#777', marginLeft: '8px' }}>({lk.url})</small>
                                              </div>
                                            </span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => startEditMegaLink(mIdx, cIdx, lIdx)}
                                              >
                                                <i className="fa-solid fa-pen-to-square"></i> Edit
                                              </button>
                                              <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteMegaLink(mIdx, cIdx, lIdx)}
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

                                {/* Multi-row Add Mega Link Form */}
                                {isAddingLinkThis ? (
                                  <div
                                    style={{
                                      marginLeft: '30px',
                                      background: '#f8fafc',
                                      padding: '12px',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      marginBottom: '10px'
                                    }}
                                  >
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0284c7', marginBottom: '10px' }}>
                                      <span>নতুন লিংক যোগ করুন:</span>
                                    </div>

                                    {newMegaLinkRows.map((row, rIdx) => (
                                      <div key={rIdx} className="row" style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                          type="text"
                                          placeholder="লিংক টাইটেল"
                                          value={row.title}
                                          onChange={(e) => updateNewMegaLinkRow(rIdx, 'title', e.target.value)}
                                          style={{ flex: 1, minWidth: '150px' }}
                                        />
                                        <input
                                          type="text"
                                          placeholder="URL"
                                          value={row.url}
                                          onChange={(e) => updateNewMegaLinkRow(rIdx, 'url', e.target.value)}
                                          style={{ flex: 1, minWidth: '150px' }}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-danger btn-sm"
                                          onClick={() => removeNewMegaLinkRow(rIdx)}
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
                                        className="btn btn-info btn-sm"
                                        onClick={addNewMegaLinkRow}
                                        title="আরও একটি লিংক যোগ করুন"
                                      >
                                        <i className="fa-solid fa-plus"></i> আরও লিংক যোগ করুন
                                      </button>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-submit btn-sm" onClick={() => saveAllNewMegaLinks(mIdx, cIdx)}>
                                          <i className="fa-solid fa-floppy-disk"></i> Save
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => { setActiveMegaLinkAdd(null); setNewMegaLinkRows([]); }}>
                                          <i className="fa-solid fa-xmark"></i> Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ marginLeft: '30px', marginTop: '6px', display: 'flex', justifyContent: 'flex-start' }}>
                                    <button
                                      className="btn btn-info btn-sm"
                                      onClick={() => openAddMegaLinkForm(mIdx, cIdx)}
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

                  {/* Add Column Buttons */}
                  <div
                    style={{
                      marginTop: '15px',
                      paddingTop: '10px',
                      borderTop: '1px dashed #cbd5e1',
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <button className="btn btn-info btn-sm" onClick={() => addMegaCol(mIdx, 'info')}>
                      <i className="fa-solid fa-plus"></i> Info Column যোগ
                    </button>
                    <button className="btn btn-add btn-sm" onClick={() => addMegaCol(mIdx, 'links')}>
                      <i className="fa-solid fa-plus"></i> Links Column যোগ
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={() => addMegaCol(mIdx, 'image')} style={{ background: '#e056fd', color: 'white' }}>
                      <i className="fa-solid fa-image"></i> Image Column যোগ
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => addMegaCol(mIdx, 'icon')} style={{ background: '#0984e3', color: 'white' }}>
                      <i className="fa-solid fa-icons"></i> Icon Column যোগ
                    </button>
                  </div>
                  </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn btn-add" onClick={createNewMegaMenuBlock}>
            <i className="fa-solid fa-plus"></i> নতুন মেগা মেনু তৈরি করুন
          </button>
        </div>
          </>
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

      {/* Drag & Drop Floating Save Action Bar */}
      {isMenuReordered && !pendingDelete && (
        <div id="reorder-action-bar">
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>
            আপনি মেনু বা লিংকের ক্রম পরিবর্তন করেছেন। সেভ করতে বোতাম চাপুন।
          </span>
          <button
            className="btn btn-submit"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            onClick={saveReorder}
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
