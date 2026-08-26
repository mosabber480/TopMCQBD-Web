import { NextResponse } from 'next/server';
import authConfig from '@/data/db-suite-auth.json';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন' },
        { status: 400 }
      );
    }

    const expectedUsername = (authConfig.username || '').trim();
    const expectedPassword = (authConfig.password || '').trim();

    if (username.trim() === expectedUsername && password.trim() === expectedPassword) {
      // Simple auth token timestamp for session validation
      const token = Buffer.from(`${expectedUsername}:${Date.now()}`).toString('base64');
      return NextResponse.json({
        success: true,
        message: 'সফলভাবে ভেরিফাই হয়েছে',
        user: expectedUsername,
        token,
      });
    }

    return NextResponse.json(
      { success: false, error: 'ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে!' },
      { status: 401 }
    );
  } catch (error) {
    console.error('DB Suite Auth API Error:', error);
    return NextResponse.json(
      { success: false, error: 'সার্ভার এরর: ভেরিফিকেশন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
