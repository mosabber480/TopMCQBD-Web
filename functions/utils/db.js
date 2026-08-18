import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const DEFAULT_PAID_URI = process.env.MONGODB_URI_PAID || process.env.MONGO_URI || DIRECT_PAID_URI;
const DEFAULT_FREE_URI = process.env.MONGODB_URI_FREE || 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

if (!globalThis._cfMongoClients) {
  globalThis._cfMongoClients = {
    paid: null,
    paidPromise: null,
    free: null,
    freePromise: null,
  };
}

const clientCache = globalThis._cfMongoClients;

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

/**
 * Get connected MongoClient and Database for Primary (Paid) MongoDB Cluster
 */
export async function getPaidDb(context) {
  const config = getDbConfig(context);
  const uri = config.paidUri;
  const dbName = config.paidDbName;

  if (clientCache.paid) {
    try {
      return { client: clientCache.paid, db: clientCache.paid.db(dbName), error: null };
    } catch (e) {
      clientCache.paid = null;
    }
  }

  if (!clientCache.paidPromise) {
    clientCache.paidPromise = (async () => {
      const opts = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };

      try {
        const client = new MongoClient(uri, opts);
        await client.connect();
        return client;
      } catch (err) {
        console.warn('⚠️ Primary MongoDB connect failed, trying fallback direct URI...', err.message);
        try {
          const directClient = new MongoClient(DIRECT_PAID_URI, opts);
          await directClient.connect();
          return directClient;
        } catch (directErr) {
          throw directErr;
        }
      }
    })();
  }

  try {
    clientCache.paid = await clientCache.paidPromise;
    return { client: clientCache.paid, db: clientCache.paid.db(dbName), error: null };
  } catch (err) {
    clientCache.paidPromise = null;
    clientCache.paid = null;
    return { client: null, db: null, error: err.message || 'Database connection error' };
  }
}

/**
 * Get connected MongoClient and Database for Free MongoDB Cluster
 */
export async function getFreeDb(context) {
  const config = getDbConfig(context);
  const uri = config.freeUri;
  const dbName = config.freeDbName;

  if (clientCache.free) {
    try {
      return { client: clientCache.free, db: clientCache.free.db(dbName), error: null };
    } catch (e) {
      clientCache.free = null;
    }
  }

  if (!clientCache.freePromise) {
    clientCache.freePromise = (async () => {
      const opts = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };
      const client = new MongoClient(uri, opts);
      await client.connect();
      return client;
    })();
  }

  try {
    clientCache.free = await clientCache.freePromise;
    return { client: clientCache.free, db: clientCache.free.db(dbName), error: null };
  } catch (err) {
    clientCache.freePromise = null;
    clientCache.free = null;
    return { client: null, db: null, error: err.message || 'Free Database connection error' };
  }
}

/**
 * Get all collections from Paid DB
 */
export async function getPaidCollections(context) {
  const { db, error } = await getPaidDb(context);
  if (!db || error) {
    return {
      db: null,
      error,
      users: null,
      questions: null,
      homeconfigs: null,
      layoutconfigs: null,
      adminsidebarconfigs: null,
      policyconfigs: null
    };
  }

  return {
    db,
    error: null,
    users: db.collection('users'),
    questions: db.collection('questions'),
    homeconfigs: db.collection('homeconfigs'),
    layoutconfigs: db.collection('layoutconfigs'),
    adminsidebarconfigs: db.collection('adminsidebarconfigs'),
    policyconfigs: db.collection('policyconfigs')
  };
}
