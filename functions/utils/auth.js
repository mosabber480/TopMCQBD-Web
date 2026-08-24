// Edge-Safe Cryptographic Auth & JWT Helper for Cloudflare Pages Functions
// 100% Pure Web Standards (Zero Node.js CJS/BSON dependencies)
import bcrypt from 'bcryptjs';

export const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

export function getJwtSecret(env) {
  return env?.JWT_SECRET || (typeof process !== 'undefined' && process.env?.JWT_SECRET) || 'topmcqbd_super_secret_jwt_key_2026';
}

function base64UrlEncode(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
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
 * Cryptographically sign JWT using Web Crypto API (HMAC SHA-256)
 */
export async function generateToken(user, env) {
  try {
    const secret = getJwtSecret(env);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      userId: String(user._id || user.id || 'usr_' + Date.now()),
      role: user.role || 'customer',
      subscription: user.subscription || { plan: 'none', active: false },
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(dataToSign)
    );

    const signatureBytes = new Uint8Array(signatureBuffer);
    let binaryStr = '';
    for (let i = 0; i < signatureBytes.length; i++) {
      binaryStr += String.fromCharCode(signatureBytes[i]);
    }
    const signatureBase64 = base64UrlEncode(binaryStr);

    return `${dataToSign}.${signatureBase64}`;
  } catch (tokenErr) {
    console.error('JWT Token Gen Error:', tokenErr);
    const fallbackPayload = base64UrlEncode(JSON.stringify({ userId: String(user._id || user.id || 'usr_' + Date.now()), role: user.role || 'customer' }));
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fallbackPayload}.fallback_sig`;
  }
}


/**
 * Cryptographically verify JWT using Web Crypto API (HMAC SHA-256)
 */
export async function verifyTokenFromRequest(request, env) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-access-token');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;

    const secret = getJwtSecret(env);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const binarySig = base64UrlDecode(sigB64);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(dataToSign)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

export { bcrypt };
