'use client';

import React, { useState, useEffect, useRef } from 'react';

// Helper to format inline markdown and convert emojis to FontAwesome icons (keeping ❌ and ✅ as is)
function renderInlineParts(text) {
  if (!text) return null;

  const emojiMap = {
    '🎯': <i key="icon-target" className="fa-solid fa-bullseye" style={{ color: '#ef4444', marginRight: '6px' }}></i>,
    '📝': <i key="icon-doc" className="fa-solid fa-file-lines" style={{ color: '#3b82f6', marginRight: '6px' }}></i>,
    '🔍': <i key="icon-search" className="fa-solid fa-magnifying-glass" style={{ color: '#8b5cf6', marginRight: '6px' }}></i>,
    '💡': <i key="icon-bulb" className="fa-solid fa-lightbulb" style={{ color: '#f59e0b', marginRight: '6px' }}></i>,
    '📚': <i key="icon-book" className="fa-solid fa-book-open" style={{ color: '#10b981', marginRight: '6px' }}></i>,
    '⚡': <i key="icon-bolt" className="fa-solid fa-bolt" style={{ color: '#f59e0b', marginRight: '6px' }}></i>,
    '📖': <i key="icon-read" className="fa-solid fa-book-bookmark" style={{ color: '#6366f1', marginRight: '6px' }}></i>,
    '⚠️': <i key="icon-warn" className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', marginRight: '6px' }}></i>,
    '✨': <i key="icon-sparkle" className="fa-solid fa-wand-magic-sparkles" style={{ color: '#1666e2', marginRight: '6px' }}></i>,
  };

  const regex = /(\*\*.*?\*\*|🎯|📝|🔍|💡|📚|⚡|📖|⚠️|✨)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(<strong key={match.index}>{renderInlineParts(boldText)}</strong>);
    } else if (emojiMap[token]) {
      parts.push(React.cloneElement(emojiMap[token], { key: match.index }));
    } else {
      parts.push(token);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

// Simple Markdown/Text Formatter for Bengali & formatted AI responses
function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Header line
    if (line.startsWith('### ') || line.startsWith('## ')) {
      return (
        <div key={idx} className="ai-msg-heading">
          {renderInlineParts(line.replace(/^#+\s*/, ''))}
        </div>
      );
    }

    // Bullet point (clean without double dots)
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
      const cleanContent = trimmed.replace(/^[•\-\*]\s*/, '');
      return (
        <div key={idx} className="ai-msg-bullet">
          <i className="fa-solid fa-circle" style={{ fontSize: '5px', color: '#6366f1', marginTop: '6px', flexShrink: 0 }}></i>
          <span>{renderInlineParts(cleanContent)}</span>
        </div>
      );
    }

    if (trimmed === '') {
      return <div key={idx} className="ai-msg-spacer" />;
    }

    return (
      <div key={idx} className="ai-msg-paragraph">
        {renderInlineParts(line)}
      </div>
    );
  });
}

export default function AiChatDrawer({
  isOpen,
  onClose,
  activePrompt,
  questionContext,
  onPromptProcessed
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'আমি **TopMCQBD AI শিক্ষক**।\nযে কোনো প্রশ্নের পাশে থাকা **"Ask AI"** বাটনে চাপুন অথবা নিচে আপনার প্রশ্নটি লিখে পাঠান — আমি উত্তর ও ব্যাখ্যা বুঝিয়ে দেব।'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Handle active prompt triggered from "Ask AI" button on questions
  useEffect(() => {
    if (activePrompt && isOpen) {
      handleAutoSubmitQuestion(activePrompt, questionContext);
      if (onPromptProcessed) onPromptProcessed();
    }
  }, [activePrompt, isOpen]);

  const handleAutoSubmitQuestion = async (promptText, contextData) => {
    // Add user message to chat
    const userMsg = {
      sender: 'user',
      text: `📖 ${contextData?.question || promptText}`
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          question: contextData?.question,
          options: contextData?.options,
          answer: contextData?.answer,
          explanation: contextData?.explanation,
          history: messages
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply }
        ]);
      } else {
        throw new Error(data.error || 'Fetch failed');
      }
    } catch (err) {
      console.warn('AI API fetch failed, executing client smart fallback:', err);
      if (contextData?.question) {
        const bengaliLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
        const correctLetter = bengaliLetters[contextData.answer] || 'সঠিক';
        const correctText = contextData.options?.[contextData.answer] || '';

        const clientFallback = `🎯 **সঠিক উত্তর: (${correctLetter}) ${correctText}**\n\n` +
          `📝 **বিস্তারিত বিশ্লেষণ:**\n` +
          `${contextData.explanation ? `• ${contextData.explanation}\n` : `• এই প্রশ্নটি বিভিন্ন সরকারি ও প্রতিযোগিতামূলক পরীক্ষার জন্য অত্যন্ত গুরুত্বপূর্ণ। প্রশ্নে উল্লেখিত তথ্যের আলোকে **(${correctLetter}) ${correctText}** হলো শতভাগ নির্ভুল উত্তর।\n`}\n` +
          `🔍 **অপশন পর্যালোচনা:**\n` +
          (contextData.options || [])
            .map((opt, i) => {
              const letter = bengaliLetters[i] || i + 1;
              if (i === contextData.answer) {
                return `✅ **(${letter}) ${opt}:** এটিই সঠিক উত্তর।`;
              } else {
                return `❌ **(${letter}) ${opt}:** এটি সঠিক নয়।`;
              }
            })
            .join('\n') +
          `\n\n💡 **গুরুত্বপূর্ণ টিপস:**\n` +
          `বিসিএস ও নিয়োগ পরীক্ষায় এই জাতীয় প্রশ্ন বারবার আসে। এই বিষয়ের সাথে সম্পর্কিত অন্যান্য তথ্যাবলি রিভিশন দিয়ে রাখলে পরীক্ষার হলে দ্রুত ও নির্ভুলভাবে উত্তর করা সম্ভব হবে।`;

        setMessages((prev) => [...prev, { sender: 'ai', text: clientFallback }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' }
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const [copiedGeminiIdx, setCopiedGeminiIdx] = useState(null);

  const handleGeminiClick = (query, idx) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(query);
      setCopiedGeminiIdx(idx);
      setTimeout(() => setCopiedGeminiIdx(null), 3500);
    }
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  const handleManualSend = (e) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || isTyping) return;

    const userMsg = { sender: 'user', text: query };
    setInputText('');
    setIsTyping(true);

    const chatgptUrl = `https://chatgpt.com/?utm_source=chatgpt.com&prompt=${encodeURIComponent(query)}`;
    const geminiUrl = `https://gemini.google.com/app`;
    const duckaiUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=chat`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    setTimeout(() => {
      const aiReply = {
        sender: 'ai',
        text: '',
        actions: {
          query,
          chatgptUrl,
          geminiUrl,
          duckaiUrl,
          googleUrl
        }
      };

      setMessages((prev) => [...prev, userMsg, aiReply]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'আমি **TopMCQBD AI শিক্ষক**।\nযে কোনো প্রশ্নের পাশে থাকা **"Ask AI"** বাটনে চাপুন অথবা নিচে আপনার প্রশ্নটি লিখে পাঠান — আমি উত্তর ও ব্যাখ্যা বুঝিয়ে দেব।'
      }
    ]);
  };

  const handleQuickChip = (chipText) => {
    setInputText(chipText);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-popup-overlay">
      <div className="ai-chat-popup-window">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-avatar-badge">
              <img src="/images/logo-white-icon.png" alt="TopMCQBD AI" className="ai-avatar-img" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <span className="ai-online-indicator"></span>
            </div>
            <div>
              <h4>TopMCQBD AI শিক্ষক</h4>
              <p>
                <i className="fa-solid fa-bolt" style={{ color: '#ffb300', marginRight: '4px' }}></i>
                স্মার্ট MCQ সহায়ক ও বিশ্লেষক
              </p>
            </div>
          </div>
          <div className="ai-chat-header-actions">
            <button
              type="button"
              className="ai-btn-icon"
              onClick={handleClearHistory}
              title="চ্যাট হিস্ট্রি মুছুন"
            >
              <i className="fa-solid fa-broom"></i>
            </button>
            <button
              type="button"
              className="ai-btn-icon"
              onClick={onClose}
              title="বন্ধ করুন"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="ai-chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message-row ${msg.sender}`}>
              {msg.sender === 'ai' && (
                <div className="ai-msg-avatar" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <img src="/images/logo-icon.png" alt="TopMCQBD" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                </div>
              )}
              <div className={`ai-message-bubble ${msg.sender}`}>
                {msg.actions ? (
                  <div className="ai-step-cards-wrapper">
                    {/* User's typed query box */}
                    <div className="ai-step-card query">
                      <div className="ai-card-title">আপনার জিজ্ঞাসিত প্রশ্ন:</div>
                      <div className="ai-card-content">"{msg.actions.query}"</div>
                    </div>

                    {/* Traffic notice box */}
                    <div className="ai-step-card notice">
                      অতিরিক্ত ট্রাফিকের কারণে আমাদের ইন-অ্যাপ টাইপিং সুবিধাটি সাময়িকভাবে সীমিত রাখা হয়েছে। আপনি নিচের যেকোনো AI দিয়ে সরাসরি সমাধান দেখতে পারেন:
                    </div>

                    {/* 1. ChatGPT Card */}
                    <div className="ai-service-card chatgpt">
                      <div className="ai-service-header">
                        <span className="ai-service-name">১. ChatGPT</span>
                      </div>
                      <div className="ai-service-query-preview">
                        "{msg.actions.query}"
                      </div>
                      <div className="ai-service-desc">
                        সরাসরি বাটনে ক্লিক করলেই টাইপ করা প্রশ্নটির সমাধান পেয়ে যাবেন।
                      </div>
                      <a
                        href={msg.actions.chatgptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ai-redirect-btn chatgpt"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.585-4.4367a4.4755 4.4755 0 0 1-.6345-3.0035l.142.0852 4.783 2.7582a.7948.7948 0 0 0 .7855 0l5.8336-3.3685v2.3324a.0804.0804 0 0 1-.0332.0616L9.74 19.9502a4.4992 4.4992 0 0 1-6.065-1.9577zm-1.037-10.4578a4.4755 4.4755 0 0 1 2.2419-1.9627l-.142.0805-4.7783 2.7582a.7948.7948 0 0 0-.3928.6813v6.7369l-2.02-1.1683a.071.071 0 0 1-.038-.052V9.0911a4.504 4.504 0 0 1 4.4945-4.4947zm13.1118 4.3941l-5.8336 3.3685v-2.3324a.0804.0804 0 0 1 .0332-.0616l4.9099-2.8298a4.4992 4.4992 0 0 1 6.065 1.9577 4.4755 4.4755 0 0 1 .6345 3.0035l-.142-.0852-4.783-2.7582a.7948.7948 0 0 0-.7855 0zm2.7134-4.8398l-4.7783-2.7582a.7948.7948 0 0 0-.7855 0L6.6853 9.4589v-2.3324a.0804.0804 0 0 1 .0332-.0616l4.9099-2.8298a4.4992 4.4992 0 0 1 6.065 1.9577c.4514.782.684 1.6663.6738 2.5647zm-7.9863 5.4856l2.9168-1.6842 2.9168 1.6842v3.3685l-2.9168 1.6842-2.9168-1.6842z" />
                        </svg>
                        <span>ChatGPT এ উত্তর দেখুন</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', marginLeft: 'auto' }}></i>
                      </a>
                    </div>

                    {/* 2. Google Gemini Card */}
                    <div className="ai-service-card gemini">
                      <div className="ai-service-header">
                        <span className="ai-service-name">২. Google Gemini</span>
                      </div>
                      <div className="ai-service-query-preview">
                        "{msg.actions.query}"
                      </div>
                      <div className="ai-service-desc">
                        বাটনে চাপ দিলে প্রশ্নটি কপি হয়ে জেমিনি ওপেন হবে, শুধু পেস্ট (Ctrl+V) করবেন।
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGeminiClick(msg.actions.query, index)}
                        className="ai-redirect-btn gemini"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                          <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z" />
                        </svg>
                        <span>
                          {copiedGeminiIdx === index ? '✅ কপি হয়েছে! জেমিনিতে পেস্ট করুন' : 'Google Gemini এ উত্তর দেখুন'}
                        </span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', marginLeft: 'auto' }}></i>
                      </button>
                    </div>

                    {/* 3. Duck.ai Chat Card */}
                    <div className="ai-service-card duckai">
                      <div className="ai-service-header">
                        <span className="ai-service-name">৩. Duck.ai Chat</span>
                      </div>
                      <div className="ai-service-query-preview">
                        "{msg.actions.query}"
                      </div>
                      <div className="ai-service-desc">
                        কোনো লগইন ছাড়াই GPT-4o ও Claude 3 AI দিয়ে সরাসরি সঠিক সমাধান পেয়ে যাবেন।
                      </div>
                      <a
                        href={msg.actions.duckaiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ai-redirect-btn duckai"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.8 15.3c-.6.2-1.2.3-1.8.3-2.8 0-5.1-2.3-5.1-5.1 0-1.7.8-3.2 2.1-4.1.3-.2.7-.1.9.2.2.3.1.7-.2.9-1 1-1.6 2.2-1.6 3.6 0 2.2 1.8 4 4 4 .5 0 1-.1 1.4-.3.3-.1.7 0 .8.3.2.4 0 .7-.3.8zm3.2-3.1c-.2.3-.6.4-.9.2-1.1-.7-1.8-1.9-1.8-3.2 0-2.2 1.8-4 4-4 .6 0 1.2.1 1.8.3.3.1.5.5.4.8-.1.3-.5.5-.8.4-.5-.2-.9-.3-1.4-.3-1.7 0-3 1.3-3 3 0 .9.5 1.7 1.2 2.2.3.2.4.6.2.9z"/>
                        </svg>
                        <span>Duck.ai Chat এ উত্তর দেখুন</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', marginLeft: 'auto' }}></i>
                      </a>
                    </div>

                    {/* 4. Google Search (AI Overviews) Card */}
                    <div className="ai-service-card google">
                      <div className="ai-service-header">
                        <span className="ai-service-name">৪. Google Search (AI Overviews)</span>
                      </div>
                      <div className="ai-service-query-preview">
                        "{msg.actions.query}"
                      </div>
                      <div className="ai-service-desc">
                        কোনো লগইন ছাড়াই ১-ক্লিকে গুগলের AI Overview ও সঠিক সমাধান পেয়ে যাবেন।
                      </div>
                      <a
                        href={msg.actions.googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ai-redirect-btn google"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span style={{ fontWeight: 600 }}>Google Search এ উত্তর দেখুন</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', marginLeft: 'auto', color: '#5f6368' }}></i>
                      </a>
                    </div>
                  </div>
                ) : (
                  renderFormattedMessage(msg.text)
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row ai">
              <div className="ai-msg-avatar" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <img src="/images/logo-icon.png" alt="TopMCQBD" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              </div>
              <div className="ai-message-bubble ai ai-typing-bubble">
                <span className="ai-typing-dot"></span>
                <span className="ai-typing-dot"></span>
                <span className="ai-typing-dot"></span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>AI উত্তর তৈরি করছে...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="ai-quick-chips">
          <button type="button" onClick={() => handleQuickChip('এই প্রশ্নের শর্টকাট টেকনিক কী?')}>
            <i className="fa-solid fa-bolt" style={{ marginRight: '5px', color: '#f59e0b' }}></i>
            শর্টকাট টেকনিক
          </button>
          <button type="button" onClick={() => handleQuickChip('অন্যান্য অপশনগুলো কেন ভুল?')}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '5px', color: '#8b5cf6' }}></i>
            অপশন বিশ্লেষণ
          </button>
          <button type="button" onClick={() => handleQuickChip('বিসিএসের জন্য গুরুত্বপূর্ণ তথ্য দিন')}>
            <i className="fa-solid fa-book-open" style={{ marginRight: '5px', color: '#10b981' }}></i>
            পরীক্ষার টিপস
          </button>
        </div>

        {/* Input Footer */}
        <form className="ai-chat-footer" onSubmit={handleManualSend}>
          <input
            type="text"
            className="ai-chat-input"
            placeholder="AI শিক্ষককে যে কোনো প্রশ্ন করুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            className="ai-chat-send-btn"
            disabled={!inputText.trim() || isTyping}
            title="পাঠান"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
