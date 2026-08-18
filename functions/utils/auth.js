import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPaidCollections } from './db.js';
import { ObjectId } from 'mongodb';

export const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

export function getJwtSecret(env) {
  return env?.JWT_SECRET || (typeof process !== 'undefined' && process.env?.JWT_SECRET) || 'topmcqbd_super_secret_jwt_key_2026';
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

/**
 * Generate a cryptographically signed JWT token
 */
export function generateToken(user, env) {
  const secret = getJwtSecret(env);
  const payload = {
    userId: String(user._id || user.id || ''),
    role: user.role || 'customer',
    subscription: user.subscription || { plan: 'none', active: false }
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Cryptographically verify JWT token from Authorization or x-access-token header
 */
export function verifyTokenFromRequest(request, env) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-access-token');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return null;

    const secret = getJwtSecret(env);
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Authenticate request and fetch user from live MongoDB
 */
export async function authenticate(request, context) {
  const payload = verifyTokenFromRequest(request, context?.env);
  if (!payload || !payload.userId) {
    return {
      user: null,
      errorResponse: { success: false, message: 'Access Denied: No valid token provided', status: 401 }
    };
  }

  const { users } = await getPaidCollections(context);
  if (!users) {
    return {
      user: { _id: payload.userId, role: payload.role || 'customer' },
      errorResponse: null
    };
  }

  let user = null;
  try {
    if (ObjectId.isValid(payload.userId)) {
      user = await users.findOne({ _id: new ObjectId(payload.userId) });
    }
  } catch (e) {
    // fallback string match
  }

  if (!user) {
    user = await users.findOne({ _id: payload.userId });
  }

  if (!user) {
    return {
      user: null,
      errorResponse: { success: false, message: 'User not found or account deleted', status: 404 }
    };
  }

  return { user, errorResponse: null };
}

/**
 * Authorize role requirements
 */
export async function authorize(request, context, allowedRoles = ['owner', 'admin']) {
  const { user, errorResponse } = await authenticate(request, context);
  if (errorResponse) return { user: null, errorResponse };

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: { success: false, message: 'Access Forbidden: Insufficient Permissions', status: 403 }
    };
  }

  return { user, errorResponse: null };
}

export { bcrypt };
