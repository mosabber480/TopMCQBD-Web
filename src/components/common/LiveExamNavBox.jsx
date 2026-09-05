'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LiveExamNavBox({ activeRoute }) {
  const currentPath = usePathname();
  const effectiveRoute = activeRoute || currentPath;

  const navItems = [
    {
      title: 'লাইভ এক্সাম মডেল টেস্ট',
      icon: 'fa-solid fa-pen-to-square',
      url: '/live-exam-model-test',
    },
    {
      title: 'আমার পরীক্ষার ড্যাশবোর্ড',
      icon: 'fa-solid fa-chart-pie',
      url: '/live-exam-dashboard',
    },
    {
      title: 'জাতীয় মেরিট পজিশন লিডারবোর্ড',
      icon: 'fa-solid fa-trophy',
      url: '/national-merit-position',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '12px 18px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {navItems.map((item) => {
        const isActive =
          effectiveRoute === item.url ||
          (effectiveRoute && effectiveRoute.startsWith(item.url));

        return (
          <Link
            key={item.url}
            href={item.url}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 20px',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: isActive ? '#0284c7' : '#ffffff',
              color: isActive ? '#ffffff' : '#334155',
              border: isActive ? '1.5px solid #0284c7' : '1.5px solid #cbd5e1',
              boxShadow: isActive
                ? '0 4px 14px rgba(2, 132, 199, 0.3)'
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#0284c7';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <i className={item.icon} style={{ fontSize: '0.95rem' }}></i>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
