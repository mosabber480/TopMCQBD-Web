'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatURL } from '@/lib/config';

export default function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    fetch('/api/home-config')
      .then(res => res.json())
      .then(data => {
        setHomeData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch home config:', err);
        setLoading(false);
      });
  }, []);

  const sliders = homeData?.sliders || [];
  const demoQuizzes = homeData?.demoQuizzes || [];
  const packages = homeData?.packages || [];
  const demoInfo = homeData?.demoSectionInfo || { title: 'ফ্রি ডেমো কুইজ (Free Demo Quiz)', subtitle: 'কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন' };
  const packageInfo = homeData?.packageSectionInfo || { title: 'আমাদের প্রিপারেশন প্যাকেজসমূহ', subtitle: 'আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন' };
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
          transition: background-color 0.2s ease;
        }
        .dot.active {
          background-color: #ffffff;
        }
        .section-container {
          max-width: 1300px;
          margin: 45px auto;
          padding: 0 20px;
        }
        .section-title {
          text-align: center;
          font-size: 26px;
          color: var(--dark, #2c3e50);
          margin-bottom: 8px;
          font-weight: bold;
        }
        .section-subtitle {
          text-align: center;
          color: var(--gray, #7f8c8d);
          font-size: 15px;
          margin-bottom: 30px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .demo-card {
          background: white;
          padding: 22px;
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
          background-color: #e3f2fd;
          color: var(--primary, #007bff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
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

      {/* Hero Sliders */}
      <section className="slider-section">
        <div className="slider-wrapper">
          {sliders.length > 0 ? (
            sliders.map((s, index) => {
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
            })
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
              {loading ? 'স্লাইডার লোড হচ্ছে...' : 'কোনো স্লাইডার পাওয়া যায়নি।'}
            </p>
          )}
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

      {/* Free Demo Quizzes */}
      <section className="section-container" id="demo">
        <h2 className="section-title" id="demo-section-title">
          {demoInfo.title || 'ফ্রি কুইজ'}
        </h2>
        <p className="section-subtitle" id="demo-section-subtitle">
          {demoInfo.subtitle || 'কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন'}
        </p>
        <div className="demo-grid">
          {demoQuizzes.length > 0 ? (
            demoQuizzes.map((d, idx) => (
              <div key={d._id || idx} className="demo-card">
                <div>
                  <span className="demo-badge">{d.badgeText || 'ফ্রি টেস্ট'}</span>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </div>
                <Link href={formatURL(d.link || '/quiz')} className="btn-demo">
                  কুইজ দিন <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
              {loading ? 'ডেমো কুইজ লোড হচ্ছে...' : 'কোনো ডেমো কুইজ পাওয়া যায়নি।'}
            </p>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section className="section-container" id="packages">
        <h2 className="section-title" id="package-section-title">
          {packageInfo.title || 'প্রিপারেশন প্যাকেজসমূহ'}
        </h2>
        <p className="section-subtitle" id="package-section-subtitle">
          {packageInfo.subtitle || 'আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন'}
        </p>
        <div className="package-grid">
          {packages.length > 0 ? (
            packages.map((p, idx) => (
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
                    {p.price} <span>{p.duration}</span>
                  </div>
                  <Link href={formatURL(p.buyLink || '/packages')} className="btn-buy">
                    <i className="fa-solid fa-cart-shopping"></i> প্যাকেজটি কিনুন
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
              {loading ? 'প্যাকেজ লোড হচ্ছে...' : 'কোনো প্যাকেজ পাওয়া যায়নি।'}
            </p>
          )}
        </div>
      </section>

      {/* Mission & Vision Section */}
      {missionInfo && (missionInfo.sectionTitle || missionInfo.missionDesc) && (
        <section className="section-container" id="mission">
          <div className="mission-section">
            <h2 className="section-title">{missionInfo.sectionTitle || 'আমাদের মিশন ও লক্ষ্য'}</h2>
            <p className="section-subtitle">{missionInfo.sectionSubtitle || ''}</p>

            <div className="mission-grid">
              {(missionInfo.missionTitle || missionInfo.missionDesc) && (
                <div className="mission-box">
                  <h3><i className="fa-solid fa-bullseye"></i> {missionInfo.missionTitle || 'আমাদের মিশন (Mission)'}</h3>
                  <p>{missionInfo.missionDesc || ''}</p>
                </div>
              )}
              {(missionInfo.goalTitle || missionInfo.goalDesc) && (
                <div className="mission-box" style={{ borderLeftColor: 'var(--secondary-dark, #27ae60)' }}>
                  <h3><i className="fa-solid fa-rocket"></i> {missionInfo.goalTitle || 'আমাদের লক্ষ্য (Goal)'}</h3>
                  <p>{missionInfo.goalDesc || ''}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
