import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server setting warning:', e);
}

const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || process.env.MONGO_URI || 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
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
  if (cached.paidConn && cached.paidConn.connection?.readyState === 1) {
    return cached.paidConn;
  }

  if (!cached.paidPromise) {
    const opts = {
      bufferCommands: false,
    };

    cached.paidPromise = mongoose.connect(MONGODB_URI_PAID, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB (Paid/Primary DB)');
      return mongooseInstance;
    }).catch(err => {
      cached.paidPromise = null;
      console.error('❌ MongoDB Connection Error (Paid):', err);
      throw err;
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
