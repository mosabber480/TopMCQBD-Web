import { NextResponse } from 'next/server';
import { authenticate, VALID_PLANS } from '@/lib/auth';

export async function POST(request) {
  try {
    const { user, errorResponse } = await authenticate(request);
    if (errorResponse) return errorResponse;

    const { plan, action, requestId, phone, transactionId, paymentMethod } = await request.json();

    if (!plan || !action || !phone || !transactionId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'সব তথ্য (plan, action, phone, transactionId, paymentMethod) দেওয়া বাধ্যতামূলক।' },
        { status: 400 }
      );
    }

    if (!VALID_PLANS.includes(plan) && !plan.startsWith('custom')) {
      return NextResponse.json(
        { success: false, message: 'সঠিক প্যাকেজ নির্বাচন করুন।' },
        { status: 400 }
      );
    }

    if (!['new', 'add', 'change', 'renew'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'সঠিক action দেওয়া হয়নি।' },
        { status: 400 }
      );
    }

    if (!['bkash', 'nagad'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: 'পেমেন্ট মাধ্যম বিকাশ অথবা নগদ হতে হবে।' },
        { status: 400 }
      );
    }

    const isSubActive = user.subscription && user.subscription.active &&
      user.subscription.endDate && new Date(user.subscription.endDate) > new Date();
    const pendingCount = (user.pendingRequests || []).filter(r => r.status === 'pending').length;

    if (action === 'renew' && !isSubActive) {
      return NextResponse.json(
        { success: false, message: 'আপনার কোনো Active subscription নেই, তাই Renew request পাঠানো যাবে না।' },
        { status: 400 }
      );
    }
    if (action !== 'renew' && isSubActive) {
      return NextResponse.json(
        { success: false, message: 'আপনার Active subscription আছে। শুধু মেয়াদ বাড়ানোর (renew) রিকোয়েস্ট পাঠানো যাবে।' },
        { status: 400 }
      );
    }
    if (action === 'new' && pendingCount > 0) {
      return NextResponse.json(
        { success: false, message: 'আপনার আগে থেকে একটা Pending request আছে। এই প্যাকেজটা Add করুন অথবা আগেরটা Change করুন।' },
        { status: 400 }
      );
    }
    if ((action === 'add' || action === 'change') && pendingCount === 0) {
      return NextResponse.json(
        { success: false, message: 'আপনার কোনো Pending request নেই।' },
        { status: 400 }
      );
    }

    if (action === 'change') {
      if (!requestId) {
        return NextResponse.json(
          { success: false, message: 'কোন রিকোয়েস্টটা পরিবর্তন করতে চান তা উল্লেখ করা হয়নি।' },
          { status: 400 }
        );
      }
      const target = user.pendingRequests.id(requestId);
      if (!target || target.status !== 'pending') {
        return NextResponse.json(
          { success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' },
          { status: 404 }
        );
      }
      target.plan = plan;
      target.phone = phone.trim();
      target.transactionId = transactionId.trim();
      target.paymentMethod = paymentMethod;
      target.requestedAt = new Date();
    } else {
      user.pendingRequests.push({
        plan,
        type: action,
        phone: phone.trim(),
        transactionId: transactionId.trim(),
        paymentMethod,
        status: 'pending',
        requestedAt: new Date()
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Plan request submitted successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        pendingRequests: user.pendingRequests
      }
    });
  } catch (err) {
    console.error('REQUEST PLAN ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
