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
    const { plan, paymentMethod, phone, transactionId } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const reqRecord = user.pendingRequests.id(requestId);
    if (!reqRecord) {
      return NextResponse.json({ success: false, message: 'Payment record not found' }, { status: 404 });
    }

    if (plan) reqRecord.plan = plan;
    if (paymentMethod) reqRecord.paymentMethod = paymentMethod;
    if (phone) reqRecord.phone = phone.trim();
    if (transactionId) reqRecord.transactionId = transactionId.trim();

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Payment record updated successfully!',
      pendingRequests: user.pendingRequests
    });
  } catch (err) {
    console.error('EDIT PAYMENT RECORD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { userId, requestId } = params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    user.pendingRequests.pull(requestId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Payment record deleted successfully!',
      pendingRequests: user.pendingRequests
    });
  } catch (err) {
    console.error('DELETE PAYMENT RECORD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
