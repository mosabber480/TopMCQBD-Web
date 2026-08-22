// Edge-Safe Database & Configuration Helper for Cloudflare Pages Functions
import { MongoClient } from 'mongodb';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const DIRECT_FREE_URI = 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-13msb7-shard-0&authSource=admin';

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

let paidClientPromise = null;
let freeClientPromise = null;

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

export async function getPaidDb(context) {
  const dbConfig = getDbConfig(context);
  const uri = dbConfig.paidUri || DEFAULT_PAID_URI;
  const dbName = dbConfig.paidDbName || 'TopMCQBD_DB';

  if (!paidClientPromise) {
    paidClientPromise = (async () => {
      const options = {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
        family: 4,
      };
      try {
        const client = new MongoClient(uri, options);
        await client.connect();
        return client;
      } catch (err) {
        console.warn('Primary Paid MongoDB SRV connection failed, trying direct replica URI...', err.message);
        const fallbackClient = new MongoClient(DIRECT_PAID_URI, options);
        await fallbackClient.connect();
        return fallbackClient;
      }
    })().catch((err) => {
      paidClientPromise = null;
      throw err;
    });
  }

  const client = await paidClientPromise;
  return client.db(dbName);
}

export async function getFreeDb(context) {
  const dbConfig = getDbConfig(context);
  const uri = dbConfig.freeUri || DEFAULT_FREE_URI;
  const dbName = dbConfig.freeDbName || 'TopMCQBD_DB_Free';

  if (!freeClientPromise) {
    freeClientPromise = (async () => {
      const options = {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
        family: 4,
      };
      try {
        const client = new MongoClient(uri, options);
        await client.connect();
        return client;
      } catch (err) {
        console.warn('Primary Free MongoDB SRV connection failed, trying direct replica URI...', err.message);
        const fallbackClient = new MongoClient(DIRECT_FREE_URI, options);
        await fallbackClient.connect();
        return fallbackClient;
      }
    })().catch((err) => {
      freeClientPromise = null;
      throw err;
    });
  }

  const client = await freeClientPromise;
  return client.db(dbName);
}


