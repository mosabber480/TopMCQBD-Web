import React, { Suspense } from 'react';
import FullModelTestClient from './FullModelTestClient';

export default function FullModelTestDemoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f8fafc' }} />}>
      <FullModelTestClient />
    </Suspense>
  );
}
