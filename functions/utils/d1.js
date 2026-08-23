// Cloudflare D1 Database Helper
// 100% Native Edge SQL Database — Zero External Network / Zero Driver Overhead

export function getD1Db(context) {
  const db = context?.env?.DB;
  if (!db) {
    throw new Error('Cloudflare D1 Database binding "DB" is missing in Pages Settings > Functions > D1 database bindings.');
  }
  return db;
}

/**
 * Format user database row to JSON standard response object
 */
export function formatUserRow(row) {
  if (!row) return null;
  let pendingRequests = [];
  try {
    pendingRequests = typeof row.pendingRequests === 'string' ? JSON.parse(row.pendingRequests) : (row.pendingRequests || []);
  } catch {
    pendingRequests = [];
  }

  return {
    id: String(row.id),
    _id: String(row.id),
    name: row.name || '',
    email: row.email || '',
    role: row.role || 'customer',
    subscription: {
      plan: row.subscription_plan || 'none',
      active: Boolean(row.subscription_active),
      startDate: row.subscription_startDate || null,
      endDate: row.subscription_endDate || null
    },
    pendingRequests,
    createdAt: row.createdAt || new Date().toISOString(),
    lastLogin: row.lastLogin || null
  };
}
