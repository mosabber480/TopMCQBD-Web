import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || process.env.MONGO_URI;
const MONGODB_URI_FREE = process.env.MONGODB_URI_FREE;
const MONGODB_URI_QUESTION_BANK = process.env.MONGODB_URI_QUESTION_BANK;

if (!global.mongooseCache) {
  global.mongooseCache = {
    paidConn: null,
    paidPromise: null,
    freeConn: null,
    freePromise: null,
    questionBankConn: null,
    questionBankPromise: null
  };
}

const cached = global.mongooseCache;

/**
 * Connect to Primary (Paid) Database
 */
export async function connectDB() {
  if (!MONGODB_URI_PAID) {
    throw new Error('Please define the MONGODB_URI_PAID environment variable inside .env');
  }

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
      .catch((err) => {
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
  if (!MONGODB_URI_FREE) {
    throw new Error('Please define the MONGODB_URI_FREE environment variable inside .env');
  }

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

/**
 * Connect to Question Bank Database connection
 */
export async function connectQuestionBankDB() {
  const uri = process.env.MONGODB_URI_QUESTION_BANK || MONGODB_URI_PAID;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI_QUESTION_BANK environment variable inside .env');
  }

  if (cached.questionBankConn && cached.questionBankConn.readyState === 1) {
    return cached.questionBankConn;
  }

  if (!cached.questionBankPromise) {
    cached.questionBankPromise = mongoose.createConnection(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000,
    }).asPromise().then((conn) => {
      console.log('✅ Connected to MongoDB (Question Bank DB)');
      return conn;
    }).catch(err => {
      cached.questionBankPromise = null;
      console.error('❌ MongoDB Connection Error (Question Bank):', err);
      throw err;
    });
  }

  try {
    cached.questionBankConn = await cached.questionBankPromise;
  } catch (e) {
    cached.questionBankPromise = null;
    throw e;
  }

  return cached.questionBankConn;
}

export default connectDB;
