import { MongoClient } from 'mongodb';

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';

const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';
const DIRECT_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-bntyny-shard-0&authSource=admin';

let _cachedClient = null;
let _cachedFreeClient = null;

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
  if (_cachedClient) {
    try {
      await _cachedClient.db('TopMCQBD_DB').command({ ping: 1 });
      return _cachedClient;
    } catch {
      _cachedClient = null;
    }
  }

  const { paidUri } = getDbConfig(context);
  // Direct URI bypasses DNS SRV resolution which is essential for Cloudflare Edge Runtime
  const urisToTry = [DIRECT_PAID_URI, paidUri];

  let lastError = null;
  for (const uri of urisToTry) {
    try {
      const client = new MongoClient(uri, {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 20000,
        tls: true,
      });
      await client.connect();
      _cachedClient = client;
      console.log('✅ MongoDB Primary connected');
      return client;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Primary DB connect attempt failed: ${err.message}`);
    }
  }

  throw new Error(`❌ MongoDB Atlas connection error (Paid): ${lastError?.message || 'Failed to connect'}`);
}

export async function getFreeMongoClient(context) {
  if (_cachedFreeClient) {
    try {
      await _cachedFreeClient.db('TopMCQBD_DB_Free').command({ ping: 1 });
      return _cachedFreeClient;
    } catch {
      _cachedFreeClient = null;
    }
  }

  const { freeUri } = getDbConfig(context);
  const urisToTry = [DIRECT_FREE_URI, freeUri];

  let lastError = null;
  for (const uri of urisToTry) {
    try {
      const client = new MongoClient(uri, {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 20000,
        tls: true,
      });
      await client.connect();
      _cachedFreeClient = client;
      console.log('✅ MongoDB Free DB connected');
      return client;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Free DB connect attempt failed: ${err.message}`);
    }
  }

  throw new Error(`❌ MongoDB Atlas connection error (Free): ${lastError?.message || 'Failed to connect'}`);
}

export async function getPaidDb(context) {
  const client = await getMongoClient(context);
  const { paidDbName } = getDbConfig(context);
  return client.db(paidDbName);
}

export async function getFreeDb(context) {
  try {
    const client = await getFreeMongoClient(context);
    const { freeDbName } = getDbConfig(context);
    return client.db(freeDbName);
  } catch (err) {
    console.warn('Falling back to Primary Paid DB for queries');
    return getPaidDb(context);
  }
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
