import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'topmcqbd_super_secret_jwt_key_2026';

export const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id || user.id,
      role: user.role,
      subscription: user.subscription
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token from Request headers (Authorization: Bearer <token>)
 */
export function verifyTokenFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-access-token');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to calculate subscription end date
 */
export function addPlanDuration(baseDate, plan) {
  const d = new Date(baseDate);
  if (plan === '1_month') d.setMonth(d.getMonth() + 1);
  else if (plan === '3_months') d.setMonth(d.getMonth() + 3);
  else if (plan === '6_months') d.setMonth(d.getMonth() + 6);
  else if (plan === '1_year') d.setFullYear(d.getFullYear() + 1);
  else if (plan === '2_years') d.setFullYear(d.getFullYear() + 2);
  else if (plan === '3_years') d.setFullYear(d.getFullYear() + 3);
  return d;
}

/**
 * Authenticate request, returning { user, errorResponse }
 */
export async function authenticate(request) {
  const payload = verifyTokenFromRequest(request);
  if (!payload) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Access Denied: No valid token provided' },
        { status: 401 }
      )
    };
  }

  await connectDB();
  const userId = payload.userId || payload.id;
  const user = await User.findById(userId);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'User not found or account deleted' },
        { status: 404 }
      )
    };
  }

  return { user, errorResponse: null };
}

/**
 * Authorize role requirements
 */
export async function authorize(request, allowedRoles = ['owner', 'admin']) {
  const { user, errorResponse } = await authenticate(request);
  if (errorResponse) return { user: null, errorResponse };

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Access Forbidden: Insufficient Permissions' },
        { status: 403 }
      )
    };
  }

  return { user, errorResponse: null };
}
