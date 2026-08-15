import { MongoClient } from 'mongodb';

let cachedPaidClient = null;
let cachedFreeClient = null;

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

export async function getDb(context) {
  const env = context?.env || {};
  const uri = env.MONGODB_URI_PAID || (typeof process !== 'undefined' && process.env?.MONGODB_URI_PAID) || DEFAULT_PAID_URI;
  const dbName = env.MONGODB_DB_NAME_PAID || (typeof process !== 'undefined' && process.env?.MONGODB_DB_NAME_PAID) || 'TopMCQBD_DB';

  if (!cachedPaidClient) {
    cachedPaidClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedPaidClient.connect();
  }
  return cachedPaidClient.db(dbName);
}

export async function getFreeDb(context) {
  const env = context?.env || {};
  const uri = env.MONGODB_URI_FREE || (typeof process !== 'undefined' && process.env?.MONGODB_URI_FREE) || DEFAULT_FREE_URI;
  const dbName = env.MONGODB_DB_NAME_FREE || (typeof process !== 'undefined' && process.env?.MONGODB_DB_NAME_FREE) || 'TopMCQBD_DB_Free';

  if (!cachedFreeClient) {
    cachedFreeClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedFreeClient.connect();
  }
  return cachedFreeClient.db(dbName);
}
