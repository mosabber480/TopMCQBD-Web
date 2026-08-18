'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatURL } from '@/lib/config';

const DEFAULT_HOME_CONFIG = {
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
    const fetchConfig = () => {
      fetch('/api/home-config')
        .then(res => res.json())
        .then(data => {
          if (data && (data.sliders?.length > 0 || data.seoTitle)) {
            setHomeData(data);
          }
        })
        .catch(() => {});
    };
    fetchConfig();
    window.addEventListener('home-config-updated', fetchConfig);
    return () => window.removeEventListener('home-config-updated', fetchConfig);
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
      <style jsx>{`
        .slider-section {
          position: relative;
          max-width: 1300px;
          margin: 20px auto;
          padding: 0 20px;
        }
        .slider-wrapper {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #1a252f;
          min-height: 380px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .slide {
          display: none;
          padding: 60px 40px;
          color: white;
          position: relative;
          min-height: 380px;
        }
        .slide.active {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .slide-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 1;
        }
        .slide-content {
          position: relative;
          z-index: 2;
        }
        .slide h1 {
          font-size: 32px;
          margin-bottom: 12px;
          color: #ffffff;
          font-weight: bold;
        }
        .slide p {
          font-size: 16px;
          color: #ecf0f1;
          margin-bottom: 25px;
          max-width: 650px;
          line-height: 1.6;
        }
        .slide-btns {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .btn-main {
          background-color: var(--secondary-dark, #27ae60);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s ease;
        }
        .btn-main:hover {
          background-color: #219653;
        }
        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 15px;
          border: 1px solid white;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background-color: white;
          color: var(--dark, #2c3e50);
        }
        .slider-dots {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
        }
        .dot.active {
          background-color: white;
        }
        .section-container {
          max-width: 1300px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .section-title {
          font-size: 24px;
          color: var(--dark, #2c3e50);
          text-align: center;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .section-subtitle {
          text-align: center;
          color: var(--gray, #7f8c8d);
          margin-bottom: 30px;
          font-size: 15px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .demo-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease;
        }
        .demo-card:hover {
          transform: translateY(-3px);
        }
        .demo-badge {
          background: #e8f5e9;
          color: #2e7d32;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
          width: fit-content;
          margin-bottom: 10px;
        }
        .demo-card h3 {
          font-size: 18px;
          color: var(--dark, #2c3e50);
          margin-bottom: 8px;
        }
        .demo-card p {
          color: var(--gray, #7f8c8d);
          font-size: 13.5px;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .btn-demo {
          background-color: var(--primary, #007bff);
          color: white;
          text-decoration: none;
          padding: 9px;
          border-radius: 5px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .package-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 25px;
        }
        .package-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
        }
        .package-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        .package-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .package-title {
          font-size: 18px;
          color: var(--dark, #2c3e50);
          margin-bottom: 6px;
        }
        .package-desc {
          color: var(--gray, #7f8c8d);
          font-size: 13.5px;
          margin-bottom: 12px;
          flex-grow: 1;
        }
        .package-price {
          font-size: 22px;
          font-weight: bold;
          color: var(--secondary-dark, #27ae60);
          margin-bottom: 12px;
        }
        .package-price span {
          font-size: 13px;
          color: var(--gray, #7f8c8d);
          font-weight: normal;
        }
        .btn-buy {
          background-color: var(--dark, #2c3e50);
          color: white;
          text-decoration: none;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .mission-section {
          background-color: white;
          padding: 40px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin-top: 40px;
        }
        .mission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }
        .mission-box {
          padding: 20px;
          background-color: #f8f9fa;
          border-left: 4px solid var(--primary, #007bff);
          border-radius: 4px;
        }
        .mission-box h3 {
          font-size: 18px;
          color: var(--dark, #2c3e50);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mission-box p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        @media (max-width: 768px) {
          .slide { padding: 40px 20px; }
          .slide h1 { font-size: 22px; }
        }
      `}</style>

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
