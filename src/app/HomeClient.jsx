'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatURL } from '@/lib/config';

import homeConfigData from '@/data/home-config.json';

const DEFAULT_HOME_CONFIG = homeConfigData || {
  sliders: [
    {
      title: "বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম",
      subtitle: "হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন।",
      bgImage: "images/slider-01.jpg",
      bgOpacity: 0.5,
      btn1Text: "🚀 কুইজ শুরু করুন",
      btn1Link: "/all-mcq",
      btn2Text: "ফ্রি ডেমো দেখুন",
      btn2Link: "#demo"
    }
  ],
  demoSectionInfo: {
    title: "ফ্রি ডেমো কুইজ",
    subtitle: "কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন"
  },
  demoQuizzes: [
    {
      title: "বাংলা ভাষা ও সাহিত্য",
      badgeText: "ফ্রি টেস্ট",
      desc: "সন্ধি, সমাস ও গুরুত্বপূর্ণ সাহিত্যিকদের বিগত বছরের প্রশ্নাবলি।",
      link: "/free-mcqs"
    }
  ],
  packages: [],
  missionSectionInfo: {
    sectionTitle: "আমাদের মিশন ও লক্ষ্য",
    sectionSubtitle: "শিক্ষার্থীদের সফলতা ও সঠিক প্রস্তুতির পথ সুগম করাই আমাদের উদ্দেশ্য",
    missionTitle: "আমাদের মিশন",
    missionDesc: "বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া।",
    goalTitle: "আমাদের লক্ষ্য",
    goalDesc: "একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে প্রতিটি পরীক্ষার্থীর প্রথম পছন্দ হয়ে ওঠা।"
  }
};

export default function HomeClient({ initialHomeData }) {
  const [homeData, setHomeData] = useState(initialHomeData || DEFAULT_HOME_CONFIG);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (initialHomeData) {
      setHomeData(initialHomeData);
    }

    const handleUpdate = (e) => {
      if (e && e.detail) {
        setHomeData(e.detail);
      } else {
        fetch('/api/home-config')
          .then(res => res.json())
          .then(data => {
            if (data && (data.sliders || data.demoQuizzes || data.packages)) {
              setHomeData(data);
            }
          })
          .catch(() => {});
      }
    };
    window.addEventListener('home-config-updated', handleUpdate);
    return () => window.removeEventListener('home-config-updated', handleUpdate);
  }, [initialHomeData]);

  const sliders = homeData?.sliders || [];
  const demoQuizzes = homeData?.demoQuizzes || [];
  const packages = homeData?.packages || [];
  const demoInfo = homeData?.demoSectionInfo;
  const packageInfo = homeData?.packageSectionInfo;
  const missionInfo = homeData?.missionSectionInfo;

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  return (
    <>
      {/* Hero Sliders (Render ONLY if sliders exist in MongoDB) */}
      {sliders.length > 0 && (
        <section className="slider-section">
          <div className="slider-wrapper">
            {sliders.map((s, index) => {
              const imgUrl = formatURL(s.bgImage || 'images/slider-01.jpg');
              const opacity = s.bgOpacity !== undefined ? s.bgOpacity : 0.5;

              return (
                <div key={index} className={`slide ${index === slideIndex ? 'active' : ''}`}>
                  <div
                    className="slide-bg"
                    style={{ backgroundImage: `url('${imgUrl}')`, opacity }}
                  ></div>
                  <div className="slide-content">
                    <h1>{s.title}</h1>
                    <p>{s.subtitle}</p>
                    <div className="slide-btns">
                      {s.btn1Text && (
                        <Link href={formatURL(s.btn1Link || '/all-mcq')} className="btn-main">
                          {s.btn1Text}
                        </Link>
                      )}
                      {s.btn2Text && (
                        <Link href={formatURL(s.btn2Link || '#demo')} className="btn-secondary">
                          {s.btn2Text}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sliders.length > 1 && (
            <div className="slider-dots">
              {sliders.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === slideIndex ? 'active' : ''}`}
                  onClick={() => setSlideIndex(index)}
                ></span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Free Demo Quizzes (Render ONLY if demoQuizzes exist in MongoDB) */}
      {demoQuizzes.length > 0 && (
        <section className="section-container" id="demo">
          {demoInfo?.title && (
            <h2 className="section-title" id="demo-section-title">
              {demoInfo.title}
            </h2>
          )}
          {demoInfo?.subtitle && (
            <p className="section-subtitle" id="demo-section-subtitle">
              {demoInfo.subtitle}
            </p>
          )}
          <div className="demo-grid">
            {demoQuizzes.map((d, idx) => (
              <div key={d._id || idx} className="demo-card">
                <div>
                  {d.badgeText && <span className="demo-badge">{d.badgeText}</span>}
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </div>
                <Link href={formatURL(d.link || '/quiz')} className="btn-demo">
                  কুইজ দিন <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Packages Section (Render ONLY if packages exist in MongoDB) */}
      {packages.length > 0 && (
        <section className="section-container" id="packages">
          {packageInfo?.title && (
            <h2 className="section-title" id="package-section-title">
              {packageInfo.title}
            </h2>
          )}
          {packageInfo?.subtitle && (
            <p className="section-subtitle" id="package-section-subtitle">
              {packageInfo.subtitle}
            </p>
          )}
          <div className="package-grid">
            {packages.map((p, idx) => (
              <div key={p._id || idx} className="package-card">
                {p.imageUrl ? (
                  <img src={formatURL(p.imageUrl)} className="package-img" alt={p.title} />
                ) : (
                  <div className="package-img" style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-box-open" style={{ fontSize: '40px', color: '#aaa' }}></i>
                  </div>
                )}
                <div className="package-body">
                  <h3 className="package-title">{p.title}</h3>
                  <p className="package-desc">{p.desc}</p>
                  <div className="package-price">
                    {p.price} {p.duration && <span>{p.duration}</span>}
                  </div>
                  <Link href={formatURL(p.buyLink || '/packages')} className="btn-buy">
                    <i className="fa-solid fa-cart-shopping"></i> প্যাকেজটি কিনুন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mission & Vision Section (Render ONLY if configured in MongoDB) */}
      {missionInfo && (missionInfo.sectionTitle || missionInfo.missionDesc || missionInfo.goalDesc) && (
        <section className="section-container" id="mission">
          <div className="mission-section">
            {missionInfo.sectionTitle && <h2 className="section-title">{missionInfo.sectionTitle}</h2>}
            {missionInfo.sectionSubtitle && <p className="section-subtitle">{missionInfo.sectionSubtitle}</p>}

            <div className="mission-grid">
              {(missionInfo.missionTitle || missionInfo.missionDesc) && (
                <div className="mission-box">
                  {missionInfo.missionTitle && <h3><i className="fa-solid fa-bullseye"></i> {missionInfo.missionTitle}</h3>}
                  {missionInfo.missionDesc && <p>{missionInfo.missionDesc}</p>}
                </div>
              )}
              {(missionInfo.goalTitle || missionInfo.goalDesc) && (
                <div className="mission-box" style={{ borderLeftColor: 'var(--secondary-dark, #27ae60)' }}>
                  {missionInfo.goalTitle && <h3><i className="fa-solid fa-rocket"></i> {missionInfo.goalTitle}</h3>}
                  {missionInfo.goalDesc && <p>{missionInfo.goalDesc}</p>}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
