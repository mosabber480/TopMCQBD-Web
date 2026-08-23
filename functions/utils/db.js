import { MongoClient } from 'mongodb';

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';
const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

let cachedClient = null;

export async function getPaidDb(context) {
  if (cachedClient) {
    try {
      return cachedClient.db('TopMCQBD_DB');
    } catch {
      cachedClient = null;
    }
  }

  const env = context?.env || {};
  const paidUri = env.MONGODB_URI_PAID || (typeof process !== 'undefined' && process.env?.MONGODB_URI_PAID) || DEFAULT_PAID_URI;

  try {
    const client = new MongoClient(paidUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    cachedClient = client;
    return client.db('TopMCQBD_DB');
  } catch (err) {
    try {
      const client = new MongoClient(DIRECT_PAID_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      cachedClient = client;
      return client.db('TopMCQBD_DB');
    } catch (directErr) {
      console.error('MongoClient Direct connection failed:', directErr);
      throw directErr;
    }
  }
}

export function parseClusterHost(uri) {
  try {
    if (!uri) return 'Not Configured';
    const atSplit = uri.split('@');
    if (atSplit.length > 1) {
      const hostPart = atSplit[1].split('/')[0];
      return hostPart || 'MongoDB Cluster';
    }
    return 'Configured';
  } catch {
    return 'Configured';
  }
}

export function getDbConfig(context) {
  const env = context?.env || {};
  return {
    paidUri: env.MONGODB_URI_PAID || (typeof process !== 'undefined' && process.env?.MONGODB_URI_PAID) || DEFAULT_PAID_URI,
    freeUri: env.MONGODB_URI_FREE || (typeof process !== 'undefined' && process.env?.MONGODB_URI_FREE) || DEFAULT_FREE_URI,
    paidDbName: env.MONGODB_DB_NAME_PAID || 'TopMCQBD_DB',
    freeDbName: env.MONGODB_DB_NAME_FREE || 'TopMCQBD_DB_Free',
  };
}
