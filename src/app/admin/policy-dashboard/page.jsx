'use client';

import React, { useState, useEffect, useRef } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminPolicyDashboardPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [rawHtmlMode, setRawHtmlMode] = useState(false);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkType, setLinkType] = useState('website'); // 'website' | 'email' | 'phone'
  const [linkWebsite, setLinkWebsite] = useState('');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [linkText, setLinkText] = useState('');

  const editorRef = useRef(null);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/policy/get');
      const data = await res.json();
      if (data && data.content) {
        setContent(data.content);
      } else {
        setContent(`<h1>প্রাইভেসি ও রিফান্ড পলিসি</h1>
<p>TopMCQBD-তে আপনাকে স্বাগতম। আমাদের প্ল্যাটফর্ম ব্যবহার করার পূর্বে অনুগ্রহ করে নিচের শর্তাবলি এবং রিফান্ড পলিসি সতর্কতার সাথে পড়ুন।</p>
<h2>১. সাবস্ক্রিপশন ও পেমেন্ট</h2>
<p>আমাদের সকল পেইড প্যাকেজ ডিজিটাল সেবা হিসেবে প্রদান করা হয়। বিকাশ অথবা নগদের মাধ্যমে পেমেন্ট সম্পন্ন করার পর ট্রানজেকশন আইডি প্রদান করে সাবস্ক্রিপশন চালু করতে হবে।</p>
<h2>২. রিফান্ড পলিসি</h2>
<p>ডিজিটাল সার্ভিসে কোনো কারিগরি ত্রুটি থাকলে এবং তা ২৪ ঘণ্টার মধ্যে সমাধান করতে ব্যর্থ হলে সম্পূর্ণ রিফান্ড প্রদান করা হবে। রিফান্ডের জন্য আমাদের সাপোর্ট ইমেইলে যোগাযোগ করুন।</p>
<h2>৩. যোগাযোগ</h2>
<p>যেকোনো প্রশ্ন বা সহায়তার জন্য ইমেইল করুন: <a href="mailto:support@topmcqbd.com">support@topmcqbd.com</a> অথবা কল করুন: <a href="tel:+8801700000000">+880 1700-000000</a></p>`);
      }
    } catch (err) {
      console.error('Fetch policy error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && editorRef.current && !rawHtmlMode) {
      editorRef.current.innerHTML = content;
    }
  }, [mode, rawHtmlMode]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    let finalContent = content;
    if (mode === 'edit' && editorRef.current && !rawHtmlMode) {
      finalContent = editorRef.current.innerHTML;
      setContent(finalContent);
    }

    try {
      const res = await fetch('/api/policy/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: finalContent })
      });

      const data = await res.json();
      if (res.ok) {
        showTopAlert('✅ পলিসি সফলভাবে সেভ হয়েছে!', 'success');
        setMode('view');
      } else {
        showTopAlert('❌ ' + (data.message || 'সেভ করতে ব্যর্থ হয়েছে।'), 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const execCmd = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const handleInsertHeading = (tag) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('formatBlock', false, tag);
    }
  };

  const openLinkModal = () => {
    const selected = window.getSelection()?.toString() || '';
    setLinkText(selected);
    setLinkWebsite('');
    setLinkEmail('');
    setLinkPhone('');
    setShowLinkModal(true);
  };

  const insertCustomLink = () => {
    let url = '';
    let text = linkText.trim();

    if (linkType === 'website') {
      url = linkWebsite.trim();
      if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
    } else if (linkType === 'email') {
      const email = linkEmail.trim();
      if (email) url = 'mailto:' + email;
    } else if (linkType === 'phone') {
      const phone = linkPhone.trim();
      if (phone) url = 'tel:' + phone;
    }

    if (!url) {
      showTopAlert('সঠিক লিংক বা তথ্য প্রদান করুন!', 'warning');
      return;
    }

    if (!text) text = url;

    if (editorRef.current) {
      editorRef.current.focus();
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    }

    setShowLinkModal(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>পলিসি কনটেন্ট লোড হচ্ছে...</p>
      </div>
    );
  }

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

        .section-card {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          border-left: 6px solid #e83e8c;
        }

        .section-title {
          font-size: 20px;
          color: var(--dark);
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px dashed #e2e8f0;
          flex-wrap: wrap;
          gap: 10px;
        }

        .read-box {
          background: #fdfdfd;
          border: 1px solid #ddd;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        /* VIEW MODE STYLES */
        .policy-preview-box {
          color: #334155;
          line-height: 1.8;
          font-size: 15px;
        }
        .policy-preview-box :global(h1),
        .policy-preview-box :global(h2),
        .policy-preview-box :global(h3) {
          color: #1e293b;
          font-weight: 700;
          margin-top: 22px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #edf2f7;
        }
        .policy-preview-box :global(h1:first-child),
        .policy-preview-box :global(h2:first-child),
        .policy-preview-box :global(h3:first-child) {
          margin-top: 0;
        }
        .policy-preview-box :global(p) {
          margin-bottom: 12px;
        }
        .policy-preview-box :global(ul),
        .policy-preview-box :global(ol) {
          margin-left: 24px;
          margin-bottom: 14px;
        }
        .policy-preview-box :global(li) {
          margin-bottom: 6px;
        }
        .policy-preview-box :global(a) {
          color: var(--primary);
          text-decoration: underline;
          word-break: break-word;
        }

        /* TOOLBAR */
        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f8fafc;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          align-items: center;
        }
        .toolbar-btn {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 32px;
          height: 32px;
          transition: all 0.2s ease;
        }
        .toolbar-btn:hover {
          background: #e2e8f0;
          color: var(--primary);
        }
        .toolbar-select {
          padding: 5px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: white;
          font-size: 13px;
          color: #475569;
          height: 32px;
          outline: none;
        }

        .editor-content {
          border: 1px solid #cbd5e1;
          border-radius: 0 0 8px 8px;
          padding: 20px;
          min-height: 350px;
          background: white;
          outline: none;
          font-size: 15px;
          line-height: 1.8;
          color: #334155;
        }
        .editor-content :global(h1),
        .editor-content :global(h2),
        .editor-content :global(h3) {
          color: #1e293b;
          font-weight: 700;
          margin-top: 18px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #edf2f7;
        }
        .editor-content :global(a) {
          color: var(--primary);
          text-decoration: underline;
        }

        .raw-textarea {
          width: 100%;
          min-height: 350px;
          padding: 15px;
          border: 1px solid #cbd5e1;
          border-radius: 0 0 8px 8px;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          box-sizing: border-box;
        }

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
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn-submit {
          background-color: #28a745;
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
        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: white;
          width: 100%;
          max-width: 440px;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
        }
        .modal-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .modal-tab {
          flex: 1;
          padding: 8px;
          text-align: center;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          background: #f8fafc;
        }
        .modal-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>

      <div className="section-card">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#e83e8c', fontSize: '22px' }}></i>
            <span>রিফান্ড ও প্রাইভেসি পলিসি কন্ট্রোল (Policy Dashboard)</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {mode === 'view' ? (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => setMode('edit')}
              >
                <i className="fa-solid fa-pen-to-square"></i> পলিসি এডিট করুন
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('view')}
              >
                <i className="fa-solid fa-eye"></i> ভিউ মোড দেখুন
              </button>
            )}

            <button
              type="button"
              className="btn btn-submit"
              onClick={handleSave}
              disabled={saving}
            >
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি সেভ করুন'}
            </button>
          </div>
        </div>

        {/* VIEW MODE */}
        {mode === 'view' && (
          <div className="read-box">
            <div
              className="policy-preview-box"
              dangerouslySetInnerHTML={{ __html: content }}
            ></div>
          </div>
        )}

        {/* EDIT MODE */}
        {mode === 'edit' && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
                WYSIWYG রিচ টেক্সট এডিটর:
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => {
                  if (!rawHtmlMode && editorRef.current) {
                    setContent(editorRef.current.innerHTML);
                  }
                  setRawHtmlMode(!rawHtmlMode);
                }}
              >
                <i className="fa-solid fa-code"></i> {rawHtmlMode ? 'WYSIWYG মোডে ফিরুন' : 'Raw HTML মোড'}
              </button>
            </div>

            {!rawHtmlMode ? (
              <div>
                {/* TOOLBAR */}
                <div className="editor-toolbar">
                  <select
                    className="toolbar-select"
                    onChange={(e) => handleInsertHeading(e.target.value)}
                    defaultValue="p"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>

                  <button type="button" className="toolbar-btn" onClick={() => execCmd('bold')} title="Bold">
                    <i className="fa-solid fa-bold"></i>
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => execCmd('italic')} title="Italic">
                    <i className="fa-solid fa-italic"></i>
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => execCmd('underline')} title="Underline">
                    <i className="fa-solid fa-underline"></i>
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => execCmd('strikeThrough')} title="Strikethrough">
                    <i className="fa-solid fa-strikethrough"></i>
                  </button>

                  <span style={{ borderRight: '1px solid #cbd5e1', height: '20px', margin: '0 4px' }}></span>

                  <button type="button" className="toolbar-btn" onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
                    <i className="fa-solid fa-list-ul"></i>
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => execCmd('insertOrderedList')} title="Numbered List">
                    <i className="fa-solid fa-list-ol"></i>
                  </button>

                  <span style={{ borderRight: '1px solid #cbd5e1', height: '20px', margin: '0 4px' }}></span>

                  <button type="button" className="toolbar-btn" onClick={openLinkModal} title="Insert Link">
                    <i className="fa-solid fa-link"></i> Link
                  </button>

                  <button type="button" className="toolbar-btn" onClick={() => execCmd('removeFormat')} title="Clear Formatting">
                    <i className="fa-solid fa-eraser"></i> Clean
                  </button>
                </div>

                {/* CONTENT AREA */}
                <div
                  ref={editorRef}
                  className="editor-content"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => {
                    if (editorRef.current) setContent(editorRef.current.innerHTML);
                  }}
                ></div>
              </div>
            ) : (
              <textarea
                className="raw-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write or paste raw HTML code here..."
              ></textarea>
            )}

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-submit"
                style={{ padding: '10px 22px' }}
                onClick={handleSave}
                disabled={saving}
              >
                <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি পরিবর্তন সংরক্ষণ করুন'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('view')}
              >
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM LINK MODAL */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1e293b' }}>
              <i className="fa-solid fa-link" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              কাস্টম লিংক যুক্ত করুন
            </h3>

            <div className="modal-tabs">
              <div
                className={`modal-tab ${linkType === 'website' ? 'active' : ''}`}
                onClick={() => setLinkType('website')}
              >
                <i className="fa-solid fa-globe"></i> Website
              </div>
              <div
                className={`modal-tab ${linkType === 'email' ? 'active' : ''}`}
                onClick={() => setLinkType('email')}
              >
                <i className="fa-solid fa-envelope"></i> Email
              </div>
              <div
                className={`modal-tab ${linkType === 'phone' ? 'active' : ''}`}
                onClick={() => setLinkType('phone')}
              >
                <i className="fa-solid fa-phone"></i> Phone
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
                Display Text (টেক্সট):
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="যেমন: আমাদের পলিসি দেখুন"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {linkType === 'website' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
                  Web URL (ওয়েব ঠিকানা):
                </label>
                <input
                  type="text"
                  value={linkWebsite}
                  onChange={(e) => setLinkWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {linkType === 'email' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
                  Email Address (ইমেইল):
                </label>
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="support@topmcqbd.com"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {linkType === 'phone' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
                  Phone Number (ফোন নাম্বার):
                </label>
                <input
                  type="text"
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLinkModal(false)}
              >
                বাতিল
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={insertCustomLink}
              >
                <i className="fa-solid fa-plus"></i> লিংক যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
