import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';

const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || process.env.MONGO_URI || DIRECT_PAID_URI;
const MONGODB_URI_FREE = process.env.MONGODB_URI_FREE || 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority';

if (!global.mongooseCache) {
  global.mongooseCache = {
    paidConn: null,
    paidPromise: null,
    freeConn: null,
    freePromise: null
  };
}

const cached = global.mongooseCache;

/**
 * Connect to Primary (Paid) Database
 */
export async function connectDB() {
  if (cached.paidConn && (cached.paidConn.connection?.readyState === 1 || cached.paidConn.readyState === 1)) {
    return cached.paidConn;
  }

  if (!cached.paidPromise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.paidPromise = mongoose.connect(MONGODB_URI_PAID, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB (Paid/Primary DB)');
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.warn('⚠️ Initial MongoDB connect failed, retrying with direct replica set URI...', err.message);
        try {
          const directConn = await mongoose.connect(DIRECT_PAID_URI, opts);
          console.log('✅ Connected to MongoDB via Direct ReplicaSet URI');
          return directConn;
        } catch (directErr) {
          cached.paidPromise = null;
          console.error('❌ MongoDB Connection Error (Paid):', directErr);
          throw directErr;
        }
      });
  }

  try {
    cached.paidConn = await cached.paidPromise;
  } catch (e) {
    cached.paidPromise = null;
    throw e;
  }

  return cached.paidConn;
}

/**
 * Connect to Secondary (Free) Database connection if needed
 */
export async function connectFreeDB() {
  if (cached.freeConn && cached.freeConn.readyState === 1) {
    return cached.freeConn;
  }

  if (!cached.freePromise) {
    cached.freePromise = mongoose.createConnection(MONGODB_URI_FREE, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    }).asPromise().then((conn) => {
      console.log('✅ Connected to MongoDB (Free DB)');
      return conn;
    }).catch(err => {
      cached.freePromise = null;
      console.error('❌ MongoDB Connection Error (Free):', err);
      throw err;
    });
  }

  try {
    cached.freeConn = await cached.freePromise;
  } catch (e) {
    cached.freePromise = null;
    throw e;
  }

  return cached.freeConn;
}

export default connectDB;
