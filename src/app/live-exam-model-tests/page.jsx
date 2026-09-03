'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToLiveExamModelTest() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/live-exam-model-test');
  }, [router]);

  return null;
}
