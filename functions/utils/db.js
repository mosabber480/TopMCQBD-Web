import { MongoClient } from 'mongodb';

const DEFAULT_PAID_URI = 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
const DEFAULT_FREE_URI = 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';
const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';

let cachedClient = null;
let cachedClientPromise = null;

export async function getMongoClient(context) {
  if (cachedClient) return cachedClient;

  if (!cachedClientPromise) {
    const dbConfig = getDbConfig(context);
    const uri = dbConfig.paidUri || DEFAULT_PAID_URI;
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    cachedClientPromise = client.connect()
      .then((connectedClient) => {
        cachedClient = connectedClient;
        return connectedClient;
      })
      .catch(async (err) => {
        console.warn('⚠️ Standard MongoDB connection failed in Cloudflare Edge, trying Direct ReplicaSet URI...', err.message);
        try {
          const directClient = new MongoClient(DIRECT_PAID_URI, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
          });
          cachedClient = await directClient.connect();
          return cachedClient;
        } catch (directErr) {
          cachedClientPromise = null;
          console.error('❌ Direct MongoDB connection failed in Cloudflare Edge:', directErr.message);
          throw directErr;
        }
      });
  }

  try {
    return await cachedClientPromise;
  } catch (err) {
    cachedClientPromise = null;
    throw err;
  }
}

export async function getUsersCollection(context) {
  const client = await getMongoClient(context);
  const dbConfig = getDbConfig(context);
  return client.db(dbConfig.paidDbName || 'TopMCQBD_DB').collection('users');
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
