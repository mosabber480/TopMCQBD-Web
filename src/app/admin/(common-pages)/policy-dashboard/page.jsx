'use client';

import React, { useState, useEffect, useRef } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getPaidApiUrl } from '@/lib/config';

export default function AdminPolicyDashboardPage() {
  const [currentPolicyContent, setCurrentPolicyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'edit'

  // Custom Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [activeLinkType, setActiveLinkType] = useState('website'); // 'website' | 'email' | 'phone'
  const [linkInputWebsite, setLinkInputWebsite] = useState('');
  const [linkInputEmail, setLinkInputEmail] = useState('');
  const [linkInputPhone, setLinkInputPhone] = useState('');
  const [linkDisplayText, setLinkDisplayText] = useState('');

  const editorRef = useRef(null);

  const fetchPolicy = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const response = await fetch('/api/policy/get', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const content = data && data.content ? data.content : '';
        setCurrentPolicyContent(content);
      } else {
        showTopAlert('পলিসি লোড করতে সমস্যা হয়েছে!', 'danger');
      }
    } catch (error) {
      console.error('Fetch policy error:', error);
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && editorRef.current) {
      editorRef.current.innerHTML = currentPolicyContent;
    }
  }, [mode]);

  const toggleMode = (newMode) => {
    if (newMode === 'edit') {
      setMode('edit');
    } else {
      setMode('view');
    }
  };

  const handleExec = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const handleHeading = (tag) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('formatBlock', false, tag);
    }
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    let htmlContent = currentPolicyContent;
    if (editorRef.current) {
      htmlContent = editorRef.current.innerHTML;
      setCurrentPolicyContent(htmlContent);
    }

    try {
      const response = await fetch('/api/policy/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: htmlContent })
      });

      if (response.ok) {
        showTopAlert('পলিসি সফলভাবে সেভ হয়েছে!', 'success');
        setMode('view');
      } else {
        const errData = await response.json().catch(() => ({}));
        showTopAlert(errData.message || 'সেভ করতে ব্যর্থ হয়েছে।', 'danger');
      }
    } catch (error) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Custom Link Handlers
  const openLinkModal = () => {
    const selected = window.getSelection()?.toString() || '';
    setLinkDisplayText(selected);
    setLinkInputWebsite('');
    setLinkInputEmail('');
    setLinkInputPhone('');
    setActiveLinkType('website');
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
  };

  const insertCustomLink = () => {
    let url = '';
    let text = linkDisplayText.trim();

    if (activeLinkType === 'website') {
      url = linkInputWebsite.trim();
      if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
    } else if (activeLinkType === 'email') {
      const email = linkInputEmail.trim();
      if (email) url = 'mailto:' + email;
    } else if (activeLinkType === 'phone') {
      const phone = linkInputPhone.trim();
      if (phone) url = 'tel:' + phone;
    }

    if (!url) {
      showTopAlert('সঠিক তথ্য দিন!', 'warning');
      return;
    }

    if (!text) text = url;

    if (editorRef.current) {
      editorRef.current.focus();
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    }

    closeLinkModal();
  };

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
          --main-dash-btn: #28a745;
        }

        .section-card {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          border-left: 6px solid var(--primary);
        }

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
          transition: all 0.2s ease;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 15px;
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
          transition: 0.2s;
          text-decoration: none;
        }

        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }
        .btn-warning:hover {
          background-color: #e0a800;
        }

        .btn-submit {
          background-color: #28a745;
          color: white;
        }
        .btn-submit:hover {
          background-color: #218838;
        }

        .btn-secondary {
          background-color: #0f1629;
          color: white;
          border: 1px solid #0f1629;
        }
        .btn-secondary:hover {
          background-color: #1e293b;
          border-color: #1e293b;
          color: white;
        }

        .btn-add {
          background: var(--main-dash-btn);
          color: white;
          padding: 10px 18px;
          font-size: 14px;
        }
        .btn-add:hover {
          background: #218838;
        }

        /* VIEW MODE */
        .policy-preview-box {
          background: white;
          padding: 15px 0;
          border: none;
          height: auto;
          overflow: visible;
          color: #4a5568;
          line-height: 1.75;
        }

        .policy-preview-box :global(h1),
        .policy-preview-box :global(h2),
        .policy-preview-box :global(h3) {
          color: var(--dark);
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
          margin-left: 22px;
          margin-bottom: 12px;
        }
        .policy-preview-box :global(li) {
          margin-bottom: 6px;
        }
        .policy-preview-box :global(a) {
          color: var(--primary);
          text-decoration: underline;
          word-break: break-word;
        }

        /* EDIT MODE TOOLBAR & WRAPPER */
        .editor-wrapper {
          border: 1px solid #ccd6e0;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          margin-bottom: 15px;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f8fafc;
          padding: 10px 12px;
          border-bottom: 1px solid #ccd6e0;
          align-items: center;
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

        .toolbar-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          min-width: 28px;
          height: 28px;
          padding: 3px 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #444;
          font-size: 13px;
          transition: 0.2s;
        }
        .toolbar-btn:hover {
          background: #e2e8f0;
          color: var(--primary);
          border-color: #cbd5e1;
        }

        .toolbar-separator {
          border-right: 1px solid #cbd5e1;
          height: 20px;
          margin: 0 4px;
        }

        .editor-content {
          border: none;
          min-height: 350px;
          padding: 18px 20px;
          line-height: 1.75;
          color: #333;
          outline: none;
          background: white;
          font-size: 15px;
        }

        .editor-content :global(h1),
        .editor-content :global(h2),
        .editor-content :global(h3) {
          font-weight: 700;
          margin-top: 20px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #edf2f7;
        }
        .editor-content :global(h1:first-child),
        .editor-content :global(h2:first-child),
        .editor-content :global(h3:first-child) {
          margin-top: 0;
        }
        .editor-content :global(p) {
          margin-bottom: 10px;
        }
        .editor-content :global(a) {
          color: var(--primary);
          text-decoration: underline;
        }

        /* CUSTOM LINK MODAL */
        .link-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(2px);
        }

        .link-modal-box {
          background: white;
          width: 100%;
          max-width: 420px;
          border-radius: 10px;
          padding: 22px 24px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
        }

        .link-modal-title {
          font-size: 17px;
          font-weight: bold;
          color: var(--dark);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .link-type-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .link-type-tab {
          flex: 1;
          text-align: center;
          padding: 8px 6px;
          border: 1px solid #dde3ea;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          transition: 0.2s;
        }
        .link-type-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .link-modal-box input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #dde3ea;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 8px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .link-modal-hint {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 15px;
        }
      `}</style>

      <div className="section-card">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-file-signature" style={{ color: 'var(--primary)' }}></i>
            <span>প্রাইভেসি ও রিফান্ড পলিসি</span>
          </div>
        </div>

        {/* Loading Box */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#718096', padding: '30px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '20px' }}></i>
            ডেটা লোড হচ্ছে...
          </div>
        ) : (
          <>
            {/* VIEW MODE */}
            {mode === 'view' && (
              <div className="read-box" style={{ borderLeft: '5px solid var(--primary)' }}>
                {currentPolicyContent.trim() !== '' ? (
                  <>
                    <div
                      className="policy-preview-box"
                      dangerouslySetInnerHTML={{ __html: currentPolicyContent }}
                    ></div>
                    <div className="card-actions">
                      <button className="btn btn-warning" onClick={() => toggleMode('edit')}>
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="policy-preview-box">
                      <p style={{ color: '#888' }}>কোনো পলিসি পাওয়া যায়নি।</p>
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-add" onClick={() => toggleMode('edit')}>
                        <i className="fa-solid fa-plus"></i> নতুন পলিসি যোগ করুন
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* EDIT MODE */}
            {mode === 'edit' && (
              <div className="read-box" style={{ borderLeft: '5px solid var(--primary)', background: '#ffffff' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--primary)' }}>
                  {currentPolicyContent ? 'পলিসি এডিট করুন' : 'নতুন পলিসি লিখুন'}
                </div>

                <div className="editor-wrapper">
                  {/* Toolbar */}
                  <div className="editor-toolbar">
                    <select
                      className="toolbar-select"
                      onChange={(e) => handleHeading(e.target.value)}
                      defaultValue="p"
                    >
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>

                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('bold')}
                      title="Bold"
                    >
                      <i className="fa-solid fa-bold"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('italic')}
                      title="Italic"
                    >
                      <i className="fa-solid fa-italic"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('underline')}
                      title="Underline"
                    >
                      <i className="fa-solid fa-underline"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('strikeThrough')}
                      title="Strikethrough"
                    >
                      <i className="fa-solid fa-strikethrough"></i>
                    </button>

                    <span className="toolbar-separator"></span>

                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('insertUnorderedList')}
                      title="Bullet List"
                    >
                      <i className="fa-solid fa-list-ul"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('insertOrderedList')}
                      title="Numbered List"
                    >
                      <i className="fa-solid fa-list-ol"></i>
                    </button>

                    <span className="toolbar-separator"></span>

                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('justifyLeft')}
                      title="Align Left"
                    >
                      <i className="fa-solid fa-align-left"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('justifyCenter')}
                      title="Align Center"
                    >
                      <i className="fa-solid fa-align-center"></i>
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('justifyRight')}
                      title="Align Right"
                    >
                      <i className="fa-solid fa-align-right"></i>
                    </button>

                    <span className="toolbar-separator"></span>

                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={openLinkModal}
                      title="Insert Link"
                    >
                      <i className="fa-solid fa-link"></i> Link
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      onClick={() => handleExec('removeFormat')}
                      title="Clear Formatting"
                    >
                      <i className="fa-solid fa-eraser"></i> Clean
                    </button>
                  </div>

                  {/* Content Editable Area */}
                  <div
                    ref={editorRef}
                    className="editor-content"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => {
                      if (editorRef.current) setCurrentPolicyContent(editorRef.current.innerHTML);
                    }}
                  ></div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-submit"
                    onClick={handleSavePolicy}
                    disabled={saving}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> {saving ? 'Saving...' : 'Save Policy'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => toggleMode('view')}>
                    <i className="fa-solid fa-xmark"></i> Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CUSTOM LINK MODAL */}
      {showLinkModal && (
        <div className="link-modal-overlay" onClick={closeLinkModal}>
          <div className="link-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="link-modal-title">
              <i className="fa-solid fa-link"></i> লিংক যুক্ত করুন
            </div>

            <div className="link-type-tabs">
              <div
                className={`link-type-tab ${activeLinkType === 'website' ? 'active' : ''}`}
                onClick={() => setActiveLinkType('website')}
              >
                <i className="fa-solid fa-globe"></i> ওয়েবসাইট
              </div>
              <div
                className={`link-type-tab ${activeLinkType === 'email' ? 'active' : ''}`}
                onClick={() => setActiveLinkType('email')}
              >
                <i className="fa-solid fa-envelope"></i> ইমেইল
              </div>
              <div
                className={`link-type-tab ${activeLinkType === 'phone' ? 'active' : ''}`}
                onClick={() => setActiveLinkType('phone')}
              >
                <i className="fa-solid fa-phone"></i> ফোন
              </div>
            </div>

            <input
              type="text"
              placeholder="টেক্সট (Display Text)"
              value={linkDisplayText}
              onChange={(e) => setLinkDisplayText(e.target.value)}
            />

            {activeLinkType === 'website' && (
              <>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkInputWebsite}
                  onChange={(e) => setLinkInputWebsite(e.target.value)}
                />
                <div className="link-modal-hint">সম্পূর্ণ ওয়েব এড্রেস দিন (https:// সহ)</div>
              </>
            )}

            {activeLinkType === 'email' && (
              <>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={linkInputEmail}
                  onChange={(e) => setLinkInputEmail(e.target.value)}
                />
                <div className="link-modal-hint">শুধু ইমেইল এড্রেস দিন — ক্লিক করলে মেইল অ্যাপ খুলবে</div>
              </>
            )}

            {activeLinkType === 'phone' && (
              <>
                <input
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={linkInputPhone}
                  onChange={(e) => setLinkInputPhone(e.target.value)}
                />
                <div className="link-modal-hint">কান্ট্রি কোডসহ ফোন নাম্বার দিন — ক্লিক করলে কল অ্যাপ খুলবে</div>
              </>
            )}

            <div className="card-actions" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-secondary" onClick={closeLinkModal}>
                <i className="fa-solid fa-xmark"></i> বাতিল
              </button>
              <button className="btn btn-submit" onClick={insertCustomLink}>
                <i className="fa-solid fa-check"></i> যুক্ত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
