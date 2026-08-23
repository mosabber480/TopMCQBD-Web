import { MongoClient } from 'mongodb';

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';
const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

let _cachedClient = null;

export function getDbConfig(context) {
  const env = context?.env || {};
  return {
    paidUri: env.MONGODB_URI_PAID || (typeof process !== 'undefined' && process.env?.MONGODB_URI_PAID) || DEFAULT_PAID_URI,
    freeUri: env.MONGODB_URI_FREE || (typeof process !== 'undefined' && process.env?.MONGODB_URI_FREE) || DEFAULT_FREE_URI,
    paidDbName: env.MONGODB_DB_NAME_PAID || 'TopMCQBD_DB',
    freeDbName: env.MONGODB_DB_NAME_FREE || 'TopMCQBD_DB_Free',
  };
}

export async function getMongoClient(context) {
  if (_cachedClient) return _cachedClient;

  const { paidUri } = getDbConfig(context);

  // In Cloudflare Edge runtime (nodejs_compat), SRV lookups (mongodb+srv) often hang or fail.
  // Direct replica set URI connects directly via TCP socket without DNS SRV lookup delays.
  const urisToTry = [DIRECT_PAID_URI, paidUri];

  let lastError = null;
  for (const uri of urisToTry) {
    try {
      const client = new MongoClient(uri, {
        connectTimeoutMS: 4000,
        serverSelectionTimeoutMS: 4000,
        maxPoolSize: 5,
        minPoolSize: 1,
      });
      await client.connect();
      _cachedClient = client;
      console.log('✅ MongoDB connected via Cloudflare Edge Function');
      return client;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ MongoDB connection failed (${uri.startsWith('mongodb+srv') ? 'SRV' : 'Direct'}): ${err.message}`);
    }
  }

  throw new Error(`❌ MongoDB Atlas connection error: ${lastError?.message || 'Failed to connect'}`);
}

export async function getPaidDb(context) {
  const client = await getMongoClient(context);
  const { paidDbName } = getDbConfig(context);
  return client.db(paidDbName);
}

export function parseClusterHost(uri) {
  try {
    if (!uri) return 'Not Configured';
    const atSplit = uri.split('@');
    if (atSplit.length > 1) return atSplit[1].split('/')[0] || 'MongoDB Cluster';
    return 'Configured';
  } catch {
    return 'Configured';
  }
}
