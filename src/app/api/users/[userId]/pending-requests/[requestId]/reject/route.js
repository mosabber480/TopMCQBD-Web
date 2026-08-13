import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { userId, requestId } = params;
    const { reason } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const pendingReq = user.pendingRequests.id(requestId);
    if (!pendingReq || pendingReq.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    pendingReq.status = 'rejected';
    pendingReq.rejectionReason = reason || 'পেমেন্ট তথ্য সঠিক নয়।';

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Request reject করা হয়েছে।',
      pendingRequests: user.pendingRequests
    });
  } catch (err) {
    console.error('REJECT REQUEST ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
