import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function GET(request) {
  try {
    const { user, errorResponse } = await authenticate(request);
    if (errorResponse) return errorResponse;

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        pendingRequests: user.pendingRequests,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('GET ME ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
