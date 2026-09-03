'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getPaidApiUrl } from '@/lib/config';

const defaultMenus = [
  { href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
  { href: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
  { href: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
  { href: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
  { href: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
  { href: '/admin/questions-dashboard', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
  { href: '/admin/packages-dashboard', icon: 'fa-solid fa-box-open', label: 'প্যাকেজসমূহ পেজ', subMenus: [] },
  { href: '/admin/users', icon: 'fa-solid fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন', subMenus: [] },
  { href: '/admin/admin-menu-dashboard', icon: 'fa-solid fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল', subMenus: [] },
  { href: '/admin/policy-dashboard', icon: 'fa-solid fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি', subMenus: [] },
  { href: '/admin/free-mcqs-dashboard', icon: 'fa-solid fa-gift', label: 'ফ্রি এমসিকিউ কন্ট্রোল', subMenus: [] }
];

export default function AdminMenuDashboardPage() {
  const [menus, setMenus] = useState([]);
  const [headerButtons, setHeaderButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordered, setIsReordered] = useState(false);

  // Multi-row Main Menu Form State
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [newMenuRows, setNewMenuRows] = useState([]);

  // Inline Editing Main Menu State
  const [editingMenuIndex, setEditingMenuIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Multi-row Submenu Form State
  const [activeSubmenuMenuIndex, setActiveSubmenuMenuIndex] = useState(null);
  const [newSubmenuRows, setNewSubmenuRows] = useState([]);

  // Inline Editing Submenu State
  const [editingSubmenuKey, setEditingSubmenuKey] = useState(null); // `${mIdx}-${sIdx}`
  const [editSubTitle, setEditSubTitle] = useState('');
  const [editSubUrl, setEditSubUrl] = useState('');
  const [editSubIcon, setEditSubIcon] = useState('');

  // Multi-row Header Button Form State
  const [isAddingHeaderBtn, setIsAddingHeaderBtn] = useState(false);
  const [newHeaderBtnRows, setNewHeaderBtnRows] = useState([]);

  // Inline Editing Header Button State
  const [editingHeaderBtnIndex, setEditingHeaderBtnIndex] = useState(null);
  const [editHeaderBtnText, setEditHeaderBtnText] = useState('');
  const [editHeaderBtnUrl, setEditHeaderBtnUrl] = useState('');
  const [editHeaderBtnIcon, setEditHeaderBtnIcon] = useState('');
  const [editHeaderBtnColor, setEditHeaderBtnColor] = useState('primary');

  // Drag & Drop Engine State
  const [dragItem, setDragItem] = useState(null); // { type: 'menu'|'submenu'|'headerBtn', mIdx, sIdx, hIdx }
  const [dropIndicator, setDropIndicator] = useState(null); // { id, position: 'above'|'below' }

  // Delete Confirmation Floating Bar State
  const [pendingDelete, setPendingDelete] = useState(null); // { message, action }

  // Collapsible Accordion States (false by default = collapsed, true = expanded)
  const [expandedSections, setExpandedSections] = useState({
    sec1: false, // ১. সাইডবার মেনু কন্ট্রোল
    sec2: false  // ২. অ্যাডমিন টপ হেডার বাটনসমূহ
  });
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedHeaderBtns, setExpandedHeaderBtns] = useState({});

  const toggleSection = (secKey) => {
    setExpandedSections((prev) => ({ ...prev, [secKey]: !prev[secKey] }));
  };
  const toggleMenu = (idx) => {
    setExpandedMenus((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };
  const toggleHeaderBtn = (idx) => {
    setExpandedHeaderBtns((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };


  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sidebar-config');
      const data = await res.json();
      if (data && data.menus && data.menus.length > 0) {
        setMenus(
          data.menus.map((m) => ({
            label: m.title || m.label,
            href: m.url || m.href,
            icon: m.icon || 'fa-solid fa-link',
            subMenus: m.subMenus || []
          }))
        );
      } else {
        setMenus(defaultMenus);
      }

      if (data && data.headerButtons) {
        setHeaderButtons(data.headerButtons);
      }
      setIsReordered(false);
    } catch (err) {
      console.error('Failed to load sidebar config:', err);
      setMenus(defaultMenus);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveToDB = async (menusToSave = menus, btnsToSave = headerButtons) => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const formattedMenus = menusToSave.map((m) => ({
      title: m.label,
      url: m.href,
      icon: m.icon,
      subMenus: (m.subMenus || []).map((s) => ({
        title: s.title || s.label,
        url: s.url || s.href,
        icon: s.icon || 'fa-solid fa-circle-dot'
      }))
    }));

    try {
      const res = await fetch('/api/sidebar-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          menus: formattedMenus,
          headerButtons: btnsToSave
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ সাইডবার ও হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setIsReordered(false);
        return true;
      } else {
        showTopAlert('❌ ' + (data.message || 'সংরক্ষণ ব্যর্থ হয়েছে'), 'danger');
        return false;
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Drag & Drop Engine (Main Menus, Submenus, & Header Buttons)
  // -------------------------------------------------------------
  const handleDragStart = (e, type, mIdx = null, sIdx = null, hIdx = null) => {
    e.stopPropagation();
    const data = {
      type,
      mIdx: mIdx !== null ? Number(mIdx) : null,
      sIdx: sIdx !== null ? Number(sIdx) : null,
      hIdx: hIdx !== null ? Number(hIdx) : null
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

  const handleDragOver = (e, targetId, targetType, targetMIdx = null, targetSIdx = null, targetHIdx = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== targetType) return;
    if (dragItem.type === 'submenu' && dragItem.mIdx !== targetMIdx) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropIndicator({ id: targetId, position: pos });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType, targetMIdx = null, targetSIdx = null, targetHIdx = null) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropIndicator?.position || 'below';
    setDropIndicator(null);

    if (!dragItem || dragItem.type !== targetType) return;

    if (targetType === 'menu') {
      const fromIdx = dragItem.mIdx;
      let toIdx = targetMIdx;
      if (fromIdx === toIdx) return;
      if (pos === 'below' && fromIdx < toIdx) toIdx = toIdx;
      if (pos === 'above' && fromIdx > toIdx) toIdx = toIdx;

      const list = [...menus];
      const movedItem = list.splice(fromIdx, 1)[0];
      list.splice(toIdx, 0, movedItem);
      setMenus(list);
      setIsReordered(true);
    } else if (targetType === 'submenu') {
      const { mIdx, sIdx: fromSIdx } = dragItem;
      let toSIdx = targetSIdx;
      if (mIdx !== targetMIdx || fromSIdx === toSIdx) return;

      const list = [...menus];
      const subList = [...list[mIdx].subMenus];
      const movedSub = subList.splice(fromSIdx, 1)[0];
      subList.splice(toSIdx, 0, movedSub);
      list[mIdx].subMenus = subList;
      setMenus(list);
      setIsReordered(true);
    } else if (targetType === 'headerBtn') {
      const fromIdx = dragItem.hIdx;
      let toIdx = targetHIdx;
      if (fromIdx === toIdx) return;
      if (pos === 'below' && fromIdx < toIdx) toIdx = toIdx;
      if (pos === 'above' && fromIdx > toIdx) toIdx = toIdx;

      const list = [...headerButtons];
      const movedBtn = list.splice(fromIdx, 1)[0];
      list.splice(toIdx, 0, movedBtn);
      setHeaderButtons(list);
      setIsReordered(true);
    }
  };

  // -------------------------------------------------------------
  // Multi-row Main Menu Form Handlers
  // -------------------------------------------------------------
  const openAddMenuForm = () => {
    setIsAddingMenu(true);
    setNewMenuRows([{ label: '', href: '', icon: 'fa-solid fa-link' }]);
  };

  const addNewMenuRow = () => {
    setNewMenuRows((prev) => [...prev, { label: '', href: '', icon: 'fa-solid fa-link' }]);
  };

  const updateNewMenuRow = (index, field, value) => {
    const rows = [...newMenuRows];
    rows[index][field] = value;
    setNewMenuRows(rows);
  };

  const removeNewMenuRow = (index) => {
    const rows = newMenuRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setIsAddingMenu(false);
      setNewMenuRows([]);
    } else {
      setNewMenuRows(rows);
    }
  };

  const saveAllNewMenus = async () => {
    const validRows = newMenuRows
      .filter((r) => r.label.trim() && r.href.trim())
      .map((r) => ({
        label: r.label.trim(),
        href: r.href.trim(),
        icon: r.icon.trim() || 'fa-solid fa-link',
        subMenus: []
      }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি সাইডবার মেনুর শিরোনাম ও লিংক দিন!', 'warning');
      return;
    }

    const updated = [...menus, ...validRows];
    setMenus(updated);
    setIsAddingMenu(false);
    setNewMenuRows([]);
    await handleSaveToDB(updated);
  };

  // Delete Main Menu
  const handleDeleteMenu = (index) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই সাইডবার মেনুটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = menus.filter((_, i) => i !== index);
        setMenus(updated);
        await handleSaveToDB(updated);
      }
    });
  };

  // Move Menu Position via Arrows
  const moveMenu = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === menus.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...menus];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMenus(updated);
    setIsReordered(true);
  };

  // Inline Edit Main Menu
  const handleStartEdit = (index) => {
    setEditingMenuIndex(index);
    setEditTitle(menus[index].label);
    setEditUrl(menus[index].href);
    setEditIcon(menus[index].icon);
  };

  const handleSaveEdit = async (index) => {
    const updated = [...menus];
    updated[index] = {
      ...updated[index],
      label: editTitle.trim(),
      href: editUrl.trim(),
      icon: editIcon.trim() || 'fa-solid fa-link'
    };
    setMenus(updated);
    setEditingMenuIndex(null);
    await handleSaveToDB(updated);
  };

  // -------------------------------------------------------------
  // Multi-row Submenu Form Handlers
  // -------------------------------------------------------------
  const openAddSubmenuForm = (menuIndex) => {
    setExpandedMenus((prev) => ({ ...prev, [menuIndex]: true }));
    setActiveSubmenuMenuIndex(menuIndex);
    setNewSubmenuRows([{ title: '', url: '', icon: 'fa-solid fa-circle-dot' }]);
  };

  const addNewSubmenuRow = () => {
    setNewSubmenuRows((prev) => [...prev, { title: '', url: '', icon: 'fa-solid fa-circle-dot' }]);
  };

  const updateNewSubmenuRow = (index, field, value) => {
    const rows = [...newSubmenuRows];
    rows[index][field] = value;
    setNewSubmenuRows(rows);
  };

  const removeNewSubmenuRow = (index) => {
    const rows = newSubmenuRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setActiveSubmenuMenuIndex(null);
      setNewSubmenuRows([]);
    } else {
      setNewSubmenuRows(rows);
    }
  };

  const saveAllNewSubmenus = async (menuIndex) => {
    const validRows = newSubmenuRows
      .filter((r) => r.title.trim() && r.url.trim())
      .map((r) => ({
        title: r.title.trim(),
        url: r.url.trim(),
        icon: r.icon.trim() || 'fa-solid fa-circle-dot'
      }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি সাবমেনুর শিরোনাম ও লিংক দিন!', 'warning');
      return;
    }

    const updated = [...menus];
    const subList = updated[menuIndex].subMenus || [];
    updated[menuIndex].subMenus = [...subList, ...validRows];
    setMenus(updated);
    setActiveSubmenuMenuIndex(null);
    setNewSubmenuRows([]);
    await handleSaveToDB(updated);
  };

  // Delete Submenu
  const handleDeleteSubmenu = (menuIndex, subIndex) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই সাবমেনুটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = [...menus];
        updated[menuIndex].subMenus = (updated[menuIndex].subMenus || []).filter((_, idx) => idx !== subIndex);
        setMenus(updated);
        await handleSaveToDB(updated);
      }
    });
  };

  // Inline Edit Submenu
  const handleStartEditSubmenu = (mIdx, sIdx) => {
    const sub = menus[mIdx]?.subMenus?.[sIdx];
    if (!sub) return;
    setEditingSubmenuKey(`${mIdx}-${sIdx}`);
    setEditSubTitle(sub.title || sub.label || '');
    setEditSubUrl(sub.url || sub.href || '');
    setEditSubIcon(sub.icon || 'fa-solid fa-circle-dot');
  };

  const handleSaveEditSubmenu = async (mIdx, sIdx) => {
    if (!editSubTitle.trim() || !editSubUrl.trim()) {
      showTopAlert('সাবমেনুর শিরোনাম ও লিংক পূরণ করুন!', 'warning');
      return;
    }
    const updated = [...menus];
    const subList = [...(updated[mIdx].subMenus || [])];
    subList[sIdx] = {
      ...subList[sIdx],
      title: editSubTitle.trim(),
      url: editSubUrl.trim(),
      icon: editSubIcon.trim() || 'fa-solid fa-circle-dot'
    };
    updated[mIdx].subMenus = subList;
    setMenus(updated);
    setEditingSubmenuKey(null);
    await handleSaveToDB(updated);
  };

  const handleCancelEditSubmenu = () => {
    setEditingSubmenuKey(null);
  };

  // -------------------------------------------------------------
  // Multi-row Header Quick Action Button Form Handlers
  // -------------------------------------------------------------
  const openAddHeaderBtnForm = () => {
    setIsAddingHeaderBtn(true);
    setNewHeaderBtnRows([{ text: '', url: '', icon: 'fa-solid fa-arrow-up-right-from-square', color: 'primary' }]);
  };

  const addNewHeaderBtnRow = () => {
    setNewHeaderBtnRows((prev) => [
      ...prev,
      { text: '', url: '', icon: 'fa-solid fa-arrow-up-right-from-square', color: 'primary' }
    ]);
  };

  const updateNewHeaderBtnRow = (index, field, value) => {
    const rows = [...newHeaderBtnRows];
    rows[index][field] = value;
    setNewHeaderBtnRows(rows);
  };

  const removeNewHeaderBtnRow = (index) => {
    const rows = newHeaderBtnRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setIsAddingHeaderBtn(false);
      setNewHeaderBtnRows([]);
    } else {
      setNewHeaderBtnRows(rows);
    }
  };

  const saveAllNewHeaderBtns = async () => {
    const validRows = newHeaderBtnRows
      .filter((r) => r.text.trim() && r.url.trim())
      .map((r) => ({
        text: r.text.trim(),
        url: r.url.trim(),
        icon: r.icon.trim() || 'fa-solid fa-link',
        color: r.color || 'primary',
        targetBlank: true,
        action: 'link'
      }));

    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি বাটনের শিরোনাম ও লিংক দিন!', 'warning');
      return;
    }

    const updated = [...headerButtons, ...validRows];
    setHeaderButtons(updated);
    setIsAddingHeaderBtn(false);
    setNewHeaderBtnRows([]);
    await handleSaveToDB(menus, updated);
  };

  // Delete Header Quick Action Button
  const handleDeleteHeaderBtn = (index) => {
    setPendingDelete({
      message: 'আপনি কি নিশ্চিত যে এই হেডার বাটনটি মুছে ফেলতে চান?',
      action: async () => {
        const updated = headerButtons.filter((_, idx) => idx !== index);
        setHeaderButtons(updated);
        await handleSaveToDB(menus, updated);
      }
    });
  };

  // Move Header Button Position via Arrows
  const moveHeaderBtn = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === headerButtons.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...headerButtons];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHeaderButtons(updated);
    setIsReordered(true);
  };

  // Inline Edit Header Button
  const handleStartEditHeaderBtn = (index) => {
    setEditingHeaderBtnIndex(index);
    setEditHeaderBtnText(headerButtons[index].text || '');
    setEditHeaderBtnUrl(headerButtons[index].url || '');
    setEditHeaderBtnIcon(headerButtons[index].icon || 'fa-solid fa-link');
    setEditHeaderBtnColor(headerButtons[index].color || 'primary');
  };

  const handleSaveEditHeaderBtn = async (index) => {
    const updated = [...headerButtons];
    updated[index] = {
      ...updated[index],
      text: editHeaderBtnText.trim(),
      url: editHeaderBtnUrl.trim(),
      icon: editHeaderBtnIcon.trim() || 'fa-solid fa-link',
      color: editHeaderBtnColor
    };
    setHeaderButtons(updated);
    setEditingHeaderBtnIndex(null);
    await handleSaveToDB(menus, updated);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>মেনু কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .row {
          display: flex;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
          color: #475569;
        }

        input,
        select {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus,
        select:focus {
          border-color: #007bff;
        }

        .menu-item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .menu-item-card:hover {
          background: #f1f5f9;
        }
        .menu-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
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
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-success,
        .btn-submit {
          background: #28a745;
          color: white;
        }
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-secondary {
          background: #0f1629;
          color: white;
          border: 1px solid #0f1629;
        }
        .btn-secondary:hover {
          background: #1e293b;
          border-color: #1e293b;
        }
        .btn-info {
          background: #17a2b8;
          color: white;
        }
        .btn-add {
          background: #28a745;
          color: white;
          padding: 10px 18px;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .drag-handle {
          cursor: grab;
          color: #94a3b8;
          font-size: 15px;
          padding: 4px 8px;
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
        }
        .drag-handle:hover {
          background: #e2e8f0;
          color: #334155;
        }

        .draggable-item {
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .draggable-item.dragging {
          opacity: 0.4;
          background: #e2e8f0 !important;
        }
        .drop-above {
          border-top: 3px solid #007bff !important;
        }
        .drop-below {
          border-bottom: 3px solid #007bff !important;
        }

        .arrow-btn-group {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 6px;
        }
        .btn-arrow {
          background: #e2e8f0;
          border: none;
          color: #475569;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 9px;
          cursor: pointer;
        }
        .btn-arrow:hover {
          background: #007bff;
          color: white;
        }

        .submenu-container {
          margin-top: 12px;
          padding-left: 20px;
          border-left: 3px solid #cbd5e1;
        }
        .submenu-item {
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 5px;
          padding: 8px 12px;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
          align-items: center;
        }

        #reorder-action-bar,
        #delete-confirm-bar {
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
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .menu-item-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* 1. SIDEBAR MENUS BUILDER CARD */}
      <div className="box" style={{ borderLeft: '6px solid #475569', marginBottom: '20px' }}>
        <div
          className="section-title"
          onClick={() => toggleSection('sec1')}
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
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
              <i className="fa-solid fa-list-check" style={{ color: '#475569', marginRight: '8px' }}></i>
              ১. সাইডবার মেনু কন্ট্রোল (Sidebar Navigation Builder)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              অ্যাডমিন প্যানেলের সাইডবারে কোন কোন মেনু ও সাবমেনু দৃশ্যমান হবে তা এখান থেকে সাজান।
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <i className={'fa-solid fa-chevron-' + (expandedSections.sec1 ? 'down' : 'right')}></i>
          </div>
        </div>

        {expandedSections.sec1 && (
          <div style={{ marginTop: '16px' }}>

        {/* Menus List */}
        <div>
          {menus.map((menu, index) => {
            const isEditing = editingMenuIndex === index;
            const subMenus = menu.subMenus || [];
            const isAddingSub = activeSubmenuMenuIndex === index;
            const isDraggingMenu = dragItem?.type === 'menu' && dragItem?.mIdx === index;
            const dropPosMenu = dropIndicator?.id === `menu-${index}` ? dropIndicator.position : null;

            return (
              <div
                key={index}
                id={`menu-${index}`}
                className={`menu-item-card draggable-item ${isDraggingMenu ? 'dragging' : ''} ${dropPosMenu === 'above' ? 'drop-above' : ''} ${dropPosMenu === 'below' ? 'drop-below' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, 'menu', index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, `menu-${index}`, 'menu', index)}
                onDrop={(e) => handleDrop(e, 'menu', index)}
              >
                {isEditing ? (
                  /* INLINE EDIT */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr auto', gap: '10px' }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL"
                      />
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="Icon"
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingMenuIndex(null)}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* READ VIEW */
                  <div>
                    <div
                      className="menu-item-header"
                      onClick={(e) => {
                        if (!e.target.closest('.btn') && !e.target.closest('button') && !e.target.closest('input')) {
                          toggleMenu(index);
                        }
                      }}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="drag-handle" title="ড্র্যাগ করে ক্রম পরিবর্তন করুন" onClick={(e) => e.stopPropagation()}>
                          <i className="fa-solid fa-grip-vertical"></i>
                        </span>
                        <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveMenu(index, 'up')}
                            title="উপরে নিন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveMenu(index, 'down')}
                            title="নিচে নিন"
                          >
                            ▼
                          </button>
                        </div>
                        <i
                          className={menu.icon || 'fa-solid fa-link'}
                          style={{ fontSize: '16px', color: '#007bff', marginRight: '10px' }}
                        ></i>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                            {menu.label}
                            <i className={'fa-solid fa-chevron-' + (expandedMenus[index] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                          </strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <code>{menu.href}</code> {subMenus.length > 0 && `• (${subMenus.length} সাবমেনু)`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-info btn-sm"
                          onClick={() => openAddSubmenuForm(index)}
                        >
                          <i className="fa-solid fa-plus"></i> Submenu
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleStartEdit(index)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteMenu(index)}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>

                    {(expandedMenus[index] || isAddingSub) && (
                      <>

                    {/* Submenus List */}
                    {subMenus.length > 0 && (
                      <div className="submenu-container">
                        {subMenus.map((sub, sIdx) => {
                          const isEditingThisSub = editingSubmenuKey === `${index}-${sIdx}`;
                          const isDraggingSub =
                            dragItem?.type === 'submenu' && dragItem?.mIdx === index && dragItem?.sIdx === sIdx;
                          const dropPosSub =
                            dropIndicator?.id === `submenu-${index}-${sIdx}` ? dropIndicator.position : null;

                          if (isEditingThisSub) {
                            return (
                              <div
                                key={sIdx}
                                className="submenu-item"
                                style={{ background: '#f8fafc', borderColor: '#0284c7', display: 'block', padding: '10px 12px' }}
                              >
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr auto', gap: '8px', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    value={editSubTitle}
                                    onChange={(e) => setEditSubTitle(e.target.value)}
                                    placeholder="সাবমেনু শিরোনাম (Title)"
                                    style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                  />
                                  <input
                                    type="text"
                                    value={editSubUrl}
                                    onChange={(e) => setEditSubUrl(e.target.value)}
                                    placeholder="লিংক (URL)"
                                    style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                  />
                                  <input
                                    type="text"
                                    value={editSubIcon}
                                    onChange={(e) => setEditSubIcon(e.target.value)}
                                    placeholder="Icon Class"
                                    style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm"
                                      style={{ padding: '5px 10px', fontSize: '12px' }}
                                      onClick={() => handleSaveEditSubmenu(index, sIdx)}
                                    >
                                      <i className="fa-solid fa-floppy-disk"></i> Save
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '5px 10px', fontSize: '12px' }}
                                      onClick={handleCancelEditSubmenu}
                                    >
                                      <i className="fa-solid fa-xmark"></i> Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={sIdx}
                              id={`submenu-${index}-${sIdx}`}
                              className={`submenu-item draggable-item ${isDraggingSub ? 'dragging' : ''} ${dropPosSub === 'above' ? 'drop-above' : ''} ${dropPosSub === 'below' ? 'drop-below' : ''}`}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, 'submenu', index, sIdx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, `submenu-${index}-${sIdx}`, 'submenu', index, sIdx)}
                              onDrop={(e) => handleDrop(e, 'submenu', index, sIdx)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="drag-handle" style={{ padding: '0 4px', fontSize: '13px' }} title="ড্র্যাগ করুন">
                                  <i className="fa-solid fa-grip-vertical"></i>
                                </span>
                                <i className={sub.icon || 'fa-solid fa-circle-dot'} style={{ fontSize: '11px', color: '#17a2b8' }}></i>
                                <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#334155' }}>
                                  {sub.title || sub.label}
                                </span>
                                <code style={{ fontSize: '11px', color: '#64748b' }}>{sub.url || sub.href}</code>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '11px' }}
                                  onClick={() => handleStartEditSubmenu(index, sIdx)}
                                >
                                  <i className="fa-solid fa-pen-to-square"></i> Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '11px' }}
                                  onClick={() => handleDeleteSubmenu(index, sIdx)}
                                >
                                  <i className="fa-solid fa-trash"></i> Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Multi-row Inline Add Submenu Form */}
                    {isAddingSub && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0284c7', marginBottom: '10px' }}>
                          <span>নতুন সাবমেনু যোগ করুন:</span>
                        </div>

                        {newSubmenuRows.map((row, rIdx) => (
                          <div key={rIdx} className="row" style={{ marginBottom: '8px' }}>
                            <input
                              type="text"
                              placeholder="সাবমেনু শিরোনাম (Title)"
                              value={row.title}
                              onChange={(e) => updateNewSubmenuRow(rIdx, 'title', e.target.value)}
                              style={{ flex: 2, minWidth: '150px' }}
                            />
                            <input
                              type="text"
                              placeholder="লিংক (URL)"
                              value={row.url}
                              onChange={(e) => updateNewSubmenuRow(rIdx, 'url', e.target.value)}
                              style={{ flex: 2, minWidth: '150px' }}
                            />
                            <input
                              type="text"
                              placeholder="Icon Class"
                              value={row.icon}
                              onChange={(e) => updateNewSubmenuRow(rIdx, 'icon', e.target.value)}
                              style={{ flex: 1.5, minWidth: '120px' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeNewSubmenuRow(rIdx)}
                              title="মুছে ফেলুন"
                              style={{ height: '38px', whiteSpace: 'nowrap' }}
                            >
                              <i className="fa-solid fa-trash"></i> Delete
                            </button>
                          </div>
                        ))}

                        <div className="card-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-info btn-sm"
                            onClick={addNewSubmenuRow}
                            title="আরও একটি সাবমেনু যোগ করুন"
                          >
                            <i className="fa-solid fa-plus"></i> আরও সাবমেনু যোগ করুন
                          </button>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-submit btn-sm"
                              onClick={() => saveAllNewSubmenus(index)}
                            >
                              <i className="fa-solid fa-floppy-disk"></i> Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setActiveSubmenuMenuIndex(null);
                                setNewSubmenuRows([]);
                              }}
                            >
                              <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Multi-row Add Main Menu Form */}
        {isAddingMenu ? (
          <div className="read-box" style={{ borderLeft: '5px solid #28a745', background: '#ffffff', marginTop: '15px', padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#28a745' }}>
              নতুন সাইডবার মেনু যোগ করুন
            </div>

            {newMenuRows.map((row, rIdx) => (
              <div key={rIdx} className="row" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="মেনুর শিরোনাম (যেমন: নোটিশ বোর্ড)"
                  value={row.label}
                  onChange={(e) => updateNewMenuRow(rIdx, 'label', e.target.value)}
                  style={{ flex: 2, minWidth: '180px' }}
                />
                <input
                  type="text"
                  placeholder="লিংক / URL (যেমন: /admin/notices)"
                  value={row.href}
                  onChange={(e) => updateNewMenuRow(rIdx, 'href', e.target.value)}
                  style={{ flex: 2, minWidth: '180px' }}
                />
                <input
                  type="text"
                  placeholder="Icon Class (যেমন: fa-solid fa-bullhorn)"
                  value={row.icon}
                  onChange={(e) => updateNewMenuRow(rIdx, 'icon', e.target.value)}
                  style={{ flex: 1.5, minWidth: '150px' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeNewMenuRow(rIdx)}
                  title="মুছে ফেলুন"
                  style={{ height: '38px', whiteSpace: 'nowrap' }}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            ))}

            <div className="card-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-info"
                onClick={addNewMenuRow}
                title="আরও একটি মেনু যোগ করুন"
              >
                <i className="fa-solid fa-plus"></i> আরও মেনু যোগ করুন
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-submit" onClick={saveAllNewMenus}>
                  <i className="fa-solid fa-floppy-disk"></i> Save Menu
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddingMenu(false);
                    setNewMenuRows([]);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-actions" style={{ marginTop: '15px' }}>
            <button className="btn btn-add" onClick={openAddMenuForm}>
              <i className="fa-solid fa-plus"></i> সাইডবার মেনু যোগ করুন
            </button>
          </div>
        )}
          </div>
        )}
      </div>

      {/* 2. HEADER QUICK ACTION BUTTONS CARD */}
      <div className="box" style={{ borderLeft: '6px solid var(--secondary, #17a2b8)', marginBottom: '20px' }}>
        <div
          className="section-title"
          onClick={() => toggleSection('sec2')}
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
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
              <i className="fa-solid fa-window-maximize" style={{ color: 'var(--secondary)', marginRight: '8px' }}></i>
              ২. অ্যাডমিন টপ হেডার বাটনসমূহ (Header Quick Actions)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              হেডারের ডানপাশে দৃশ্যমান কুইক অ্যাকশন বাটনগুলো পরিচালনা করুন।
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <i className={'fa-solid fa-chevron-' + (expandedSections.sec2 ? 'down' : 'right')}></i>
          </div>
        </div>

        {expandedSections.sec2 && (
          <div style={{ marginTop: '16px' }}>

        {/* Header Buttons List */}
        <div style={{ marginTop: '15px' }}>
          {headerButtons.map((btn, index) => {
            const isEditingHBtn = editingHeaderBtnIndex === index;
            const isDraggingHBtn = dragItem?.type === 'headerBtn' && dragItem?.hIdx === index;
            const dropPosHBtn = dropIndicator?.id === `hbtn-${index}` ? dropIndicator.position : null;

            return (
              <div
                key={index}
                id={`hbtn-${index}`}
                className={`menu-item-card draggable-item ${isDraggingHBtn ? 'dragging' : ''} ${dropPosHBtn === 'above' ? 'drop-above' : ''} ${dropPosHBtn === 'below' ? 'drop-below' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, 'headerBtn', null, null, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, `hbtn-${index}`, 'headerBtn', null, null, index)}
                onDrop={(e) => handleDrop(e, 'headerBtn', null, null, index)}
              >
                {isEditingHBtn ? (
                  /* INLINE EDIT */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr auto', gap: '10px' }}>
                      <input
                        type="text"
                        value={editHeaderBtnText}
                        onChange={(e) => setEditHeaderBtnText(e.target.value)}
                        placeholder="Button Text"
                      />
                      <input
                        type="text"
                        value={editHeaderBtnUrl}
                        onChange={(e) => setEditHeaderBtnUrl(e.target.value)}
                        placeholder="URL"
                      />
                      <input
                        type="text"
                        value={editHeaderBtnIcon}
                        onChange={(e) => setEditHeaderBtnIcon(e.target.value)}
                        placeholder="Icon"
                      />
                      <select
                        value={editHeaderBtnColor}
                        onChange={(e) => setEditHeaderBtnColor(e.target.value)}
                      >
                        <option value="primary">Primary (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Orange)</option>
                        <option value="info">Info (Cyan)</option>
                        <option value="danger">Danger (Red)</option>
                      </select>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleSaveEditHeaderBtn(index)}
                        >
                          <i className="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingHeaderBtnIndex(null)}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* READ VIEW */
                  <div>
                    <div
                      className="menu-item-header"
                      onClick={(e) => {
                        if (!e.target.closest('.btn') && !e.target.closest('button') && !e.target.closest('input')) {
                          toggleHeaderBtn(index);
                        }
                      }}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="drag-handle" title="ড্র্যাগ করে ক্রম পরিবর্তন করুন" onClick={(e) => e.stopPropagation()}>
                          <i className="fa-solid fa-grip-vertical"></i>
                        </span>
                        <div className="arrow-btn-group" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveHeaderBtn(index, 'up')}
                            title="উপরে নিন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveHeaderBtn(index, 'down')}
                            title="নিচে নিন"
                          >
                            ▼
                          </button>
                        </div>
                        <i
                          className={btn.icon || 'fa-solid fa-link'}
                          style={{ fontSize: '16px', color: '#17a2b8', marginRight: '10px' }}
                        ></i>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                            {btn.text}
                            <i className={'fa-solid fa-chevron-' + (expandedHeaderBtns[index] ? 'down' : 'right')} style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}></i>
                          </strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <code>{btn.url}</code> • Color: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{btn.color || 'primary'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleStartEditHeaderBtn(index)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteHeaderBtn(index)}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Multi-row Add Header Button Form */}
        {isAddingHeaderBtn ? (
          <div style={{ background: '#ffffff', padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#17a2b8' }}>
              নতুন হেডার বাটন যোগ করুন
            </div>

            {newHeaderBtnRows.map((row, rIdx) => (
              <div key={rIdx} className="row" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="বাটন টেক্সট (যেমন: ওয়েবসাইট ভিজিট)"
                  value={row.text}
                  onChange={(e) => updateNewHeaderBtnRow(rIdx, 'text', e.target.value)}
                  style={{ flex: 2, minWidth: '160px' }}
                />
                <input
                  type="text"
                  placeholder="লিংক / URL (যেমন: /)"
                  value={row.url}
                  onChange={(e) => updateNewHeaderBtnRow(rIdx, 'url', e.target.value)}
                  style={{ flex: 2, minWidth: '160px' }}
                />
                <input
                  type="text"
                  placeholder="Icon Class"
                  value={row.icon}
                  onChange={(e) => updateNewHeaderBtnRow(rIdx, 'icon', e.target.value)}
                  style={{ flex: 1.5, minWidth: '120px' }}
                />
                <select
                  value={row.color}
                  onChange={(e) => updateNewHeaderBtnRow(rIdx, 'color', e.target.value)}
                  style={{ flex: 1.5, minWidth: '130px', height: '38px' }}
                >
                  <option value="primary">Primary (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Orange)</option>
                  <option value="info">Info (Cyan)</option>
                  <option value="danger">Danger (Red)</option>
                </select>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeNewHeaderBtnRow(rIdx)}
                  title="মুছে ফেলুন"
                  style={{ height: '38px', whiteSpace: 'nowrap' }}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            ))}

            <div className="card-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-info"
                onClick={addNewHeaderBtnRow}
                title="আরও একটি বাটন যোগ করুন"
              >
                <i className="fa-solid fa-plus"></i> আরও বাটন যোগ করুন
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-submit" onClick={saveAllNewHeaderBtns}>
                  <i className="fa-solid fa-floppy-disk"></i> Save Buttons
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddingHeaderBtn(false);
                    setNewHeaderBtnRows([]);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-actions" style={{ marginTop: '15px' }}>
            <button className="btn btn-add" onClick={openAddHeaderBtnForm}>
              <i className="fa-solid fa-plus"></i> বাটন যোগ করুন
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
      {isReordered && !pendingDelete && (
        <div id="reorder-action-bar">
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>
            আপনি সাইডবার/হেডার মেনুর ক্রম পরিবর্তন করেছেন। সেভ করতে বোতাম চাপুন।
          </span>
          <button
            className="btn btn-submit"
            style={{ padding: '10px 20px', fontSize: '14px', background: '#28a745', color: '#fff' }}
            onClick={() => handleSaveToDB()}
          >
            <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সেভ করুন
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '10px 15px', fontSize: '14px' }}
            onClick={() => fetchConfig()}
          >
            <i className="fa-solid fa-xmark"></i> বাতিল করুন
          </button>
        </div>
      )}
    </div>
  );
}
