import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from './db.js';

export const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

export function generateToken(user, env) {
  const secret = env?.JWT_SECRET || (typeof process !== 'undefined' && process.env?.JWT_SECRET) || 'topmcqbd_super_secret_jwt_key_2026';
  return jwt.sign(
    {
      userId: user._id ? user._id.toString() : user.id,
      role: user.role,
      subscription: user.subscription
    },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyTokenFromRequest(request, env) {
  try {
    const secret = env?.JWT_SECRET || (typeof process !== 'undefined' && process.env?.JWT_SECRET) || 'topmcqbd_super_secret_jwt_key_2026';
    const authHeader = request.headers.get('authorization') || request.headers.get('x-access-token');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return null;

    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

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

export async function authenticate(context) {
  const { request, env } = context;
  const payload = verifyTokenFromRequest(request, env);
  if (!payload) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, message: 'Access Denied: No valid token provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  const db = await getDb(context);
  const userId = payload.userId || payload.id;
  let user = null;
  try {
    user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  } catch {
    user = await db.collection('users').findOne({ _id: userId });
  }

  if (!user) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, message: 'User not found or account deleted' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user, errorResponse: null, db };
}

export async function authorize(context, allowedRoles = ['owner', 'admin']) {
  const { user, errorResponse, db } = await authenticate(context);
  if (errorResponse) return { user: null, errorResponse };

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, message: 'Access Forbidden: Insufficient Permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user, errorResponse: null, db };
}
