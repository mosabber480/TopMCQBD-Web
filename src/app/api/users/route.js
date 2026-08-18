import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { user, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users || []
    });
  } catch (err) {
    console.error('GET USERS ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'ইউজার ডাটাবেজ থেকে লোড করতে ব্যর্থ হয়েছে', error: err.message },
      { status: 500 }
    );
  }
}
