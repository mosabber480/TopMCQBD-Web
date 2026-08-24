import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request) {
  try {
    const { user, errorResponse } = await authenticate(request);
    if (errorResponse) return errorResponse;

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
