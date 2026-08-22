import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { userId } = params;
    const { plan, customName, years, months, days } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    let startDate = new Date();
    let endDate = new Date();
    let finalPlanName = plan;

    if (plan === 'custom') {
      endDate.setFullYear(endDate.getFullYear() + (parseInt(years) || 0));
      endDate.setMonth(endDate.getMonth() + (parseInt(months) || 0));
      endDate.setDate(endDate.getDate() + (parseInt(days) || 0));
      finalPlanName = customName || 'Custom Package';
    } else if (plan === '1_month') endDate.setMonth(endDate.getMonth() + 1);
    else if (plan === '3_months') endDate.setMonth(endDate.getMonth() + 3);
    else if (plan === '6_months') endDate.setMonth(endDate.getMonth() + 6);
    else if (plan === '1_year') endDate.setFullYear(endDate.getFullYear() + 1);
    else if (plan === '2_years') endDate.setFullYear(endDate.getFullYear() + 2);
    else if (plan === '3_years') endDate.setFullYear(endDate.getFullYear() + 3);
    else if (plan === 'none') {
      startDate = null;
      endDate = null;
    }

    user.subscription = {
      plan: finalPlanName,
      startDate: plan !== 'none' ? startDate : null,
      endDate: plan !== 'none' ? endDate : null,
      active: plan !== 'none'
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Subscription plan updated to ${finalPlanName}`,
      subscription: user.subscription
    });
  } catch (err) {
    console.error('UPDATE SUBSCRIPTION ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
