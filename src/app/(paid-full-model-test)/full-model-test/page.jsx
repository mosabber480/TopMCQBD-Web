import React, { Suspense } from 'react';
import FullModelTestClient from './FullModelTestClient';

export const metadata = {
  title: 'পূর্ণাঙ্গ মডেল টেস্ট | TopMCQBD',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি চাকরির পরীক্ষার পূর্ণাঙ্গ মডেল টেস্ট ও ব্যাখ্যাসহ সমাধান।'
};

export default function FullModelTestPage({ searchParams }) {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f8fafc' }} />}>
      <FullModelTestClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
