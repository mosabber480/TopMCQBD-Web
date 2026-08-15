// Edge-Safe Auth & JWT Helper for Cloudflare Pages Functions
// Pure Web Standards (No Node.js CJS dependencies)

export const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

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

export function generateToken(user, env) {
  const payload = {
    userId: user._id || user.id || 'usr_' + Date.now(),
    role: user.role || 'customer',
    subscription: user.subscription,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  };
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.edge_token_sig`;
}

export function verifyTokenFromRequest(request, env) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-access-token');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}
