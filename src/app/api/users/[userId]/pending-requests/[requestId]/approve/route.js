import { NextResponse } from 'next/server';
import { authorize, addPlanDuration } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { userId, requestId } = params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const pendingReq = user.pendingRequests.id(requestId);
    if (!pendingReq || pendingReq.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const now = new Date();
    const hasFutureEndDate = user.subscription && user.subscription.active &&
      user.subscription.endDate && new Date(user.subscription.endDate) > now;

    const baseDate = hasFutureEndDate ? new Date(user.subscription.endDate) : now;
    const newEndDate = addPlanDuration(baseDate, pendingReq.plan);

    let newPlanName = pendingReq.plan;
    if (hasFutureEndDate && user.subscription.plan && user.subscription.plan !== 'none') {
      newPlanName = user.subscription.plan + ' + ' + pendingReq.plan;
    }

    user.subscription = {
      plan: newPlanName,
      startDate: (user.subscription && user.subscription.startDate && hasFutureEndDate) ? user.subscription.startDate : now,
      endDate: newEndDate,
      active: true
    };

    pendingReq.status = 'approved';
    await user.save();

    return NextResponse.json({
      success: true,
      message: `${pendingReq.plan} প্ল্যান অনুমোদন করা হয়েছে। নতুন মেয়াদ শেষ হবে ${newEndDate.toLocaleDateString()} তারিখে।`,
      subscription: user.subscription,
      pendingRequests: user.pendingRequests
    });
  } catch (err) {
    console.error('APPROVE REQUEST ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
