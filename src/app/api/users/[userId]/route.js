import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { userId } = params;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.role === 'owner') {
      return NextResponse.json(
        { success: false, message: 'Owner account cannot be deleted!' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully!'
    });
  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
