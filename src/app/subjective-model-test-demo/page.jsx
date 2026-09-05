import React, { Suspense } from 'react';
import SubjectiveModelTestClient from './SubjectiveModelTestClient';

export const metadata = {
  title: 'বিষয়ভিত্তিক মডেল টেস্ট - TopMCQBD',
  description: 'বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ সহ সকল সরকারি চাকরির বিষয়ভিত্তিক মডেল টেস্ট।'
};

export default function ModelTestDemoPage({ searchParams }) {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f8fafc' }} />}>
      <SubjectiveModelTestClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
