import React, { Suspense } from 'react';
import FreeModelTestClient from './FreeModelTestClient';

export const metadata = {
  title: 'ফ্রি মডেল টেস্ট - TopMCQBD',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ সহ সকল সরকারি চাকরির ফ্রি মডেল টেস্ট।'
};

export default function FreeModelTestDemoPage({ searchParams }) {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f8fafc' }} />}>
      <FreeModelTestClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
