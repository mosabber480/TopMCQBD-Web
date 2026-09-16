import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is restricted (like Edge isolates)
}

const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || process.env.MONGO_URI;
const MONGODB_URI_FREE = process.env.MONGODB_URI_FREE;
const MONGODB_URI_QUESTION_BANK = process.env.MONGODB_URI_QUESTION_BANK;
const MONGODB_URI_SUBJECTIVE = process.env.MONGODB_URI_SUBJECTIVE;
const MONGODB_URI_LIVE_EXAM = process.env.MONGODB_URI_LIVE_EXAM;
const MONGODB_URI_WRITTEN = process.env.MONGODB_URI_WRITTEN;

export const DB_CONFIGS = {
  paid: {
    uri: MONGODB_URI_PAID,
    dbName: process.env.MONGODB_DB_NAME_PAID || 'TopMCQBD_DB',
    name: 'Paid Core DB'
  },
  free: {
    uri: MONGODB_URI_FREE,
    dbName: process.env.MONGODB_DB_NAME_FREE || 'TopMCQBD_DB_Free',
    name: 'Free MCQ DB'
  },
  'question-bank': {
    uri: MONGODB_URI_QUESTION_BANK || MONGODB_URI_PAID,
    dbName: process.env.MONGODB_DB_NAME_QUESTION_BANK || 'TopMCQBD_DB_Question_Bank',
    name: 'Question Bank DB'
  },
  subjective: {
    uri: MONGODB_URI_SUBJECTIVE || MONGODB_URI_PAID,
    dbName: process.env.MONGODB_DB_NAME_SUBJECTIVE || 'TopMCQBD_DB_Subjective',
    name: 'Subjective DB'
  },
  'live-exam': {
    uri: MONGODB_URI_LIVE_EXAM || MONGODB_URI_PAID,
    dbName: process.env.MONGODB_DB_NAME_LIVE_EXAM || 'TopMCQBD_DB_Live_Exam',
    name: 'Live Exam DB'
  },
  written: {
    uri: MONGODB_URI_WRITTEN || MONGODB_URI_PAID,
    dbName: process.env.MONGODB_DB_NAME_WRITTEN || 'TopMCQBD_DB_written',
    name: 'Written Exam DB'
  }
};

// Global cache for Native MongoDB and Mongoose instances
if (!global._topmcqbdDbCache) {
  global._topmcqbdDbCache = {
    nativeClients: {},
    nativeDbs: {},
    mongooseConns: {},
    mongoosePromises: {}
  };
}

const dbCache = global._topmcqbdDbCache;

/**
 * Get native MongoClient with Edge-safe options (maxPoolSize: 1, family: 4, tls: true)
 */
export async function getNativeClient(clusterKey = 'paid') {
  const config = DB_CONFIGS[clusterKey] || DB_CONFIGS.paid;
  if (!config.uri) {
    throw new Error(`Missing URI for MongoDB cluster "${clusterKey}". Check your .env configuration.`);
  }

  if (dbCache.nativeClients[clusterKey]) {
    return dbCache.nativeClients[clusterKey];
  }

  const clientOptions = {
    tls: true,
    family: 4,
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 6000,
    connectTimeoutMS: 6000
  };

  try {
    const client = new MongoClient(config.uri, clientOptions);
    await client.connect();
    dbCache.nativeClients[clusterKey] = client;
    dbCache.nativeDbs[clusterKey] = client.db(config.dbName);
    return client;
  } catch (err) {
    console.warn(`[Native MongoDB] Standard connect failed for ${clusterKey}, retrying with directConnection:`, err.message);
    const directClient = new MongoClient(config.uri, {
      ...clientOptions,
      directConnection: true
    });
    await directClient.connect();
    dbCache.nativeClients[clusterKey] = directClient;
    dbCache.nativeDbs[clusterKey] = directClient.db(config.dbName);
    return directClient;
  }
}

/**
 * Get connected native Db instance for any cluster
 */
export async function getDatabase(clusterKey = 'paid') {
  if (dbCache.nativeDbs[clusterKey]) {
    return dbCache.nativeDbs[clusterKey];
  }
  const client = await getNativeClient(clusterKey);
  const config = DB_CONFIGS[clusterKey] || DB_CONFIGS.paid;
  const db = client.db(config.dbName);
  dbCache.nativeDbs[clusterKey] = db;
  return db;
}

/**
 * Connect to Primary (Paid) Database
 * Connects native MongoDB client and keeps Mongoose connected for hybrid compatibility
 */
export async function connectDB() {
  if (!MONGODB_URI_PAID) {
    throw new Error('Please define the MONGODB_URI_PAID environment variable inside .env');
  }

  // 1. Ensure Native MongoDB Client is ready
  await getNativeClient('paid');

  // 2. Also keep Mongoose connected if running in Node.js environment
  if (typeof mongoose !== 'undefined' && mongoose.connect) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!dbCache.mongoosePromises.paid) {
      dbCache.mongoosePromises.paid = mongoose.connect(MONGODB_URI_PAID, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }).catch(err => {
        dbCache.mongoosePromises.paid = null;
        console.warn('Mongoose fallback connection warning:', err.message);
      });
    }

    await dbCache.mongoosePromises.paid;
  }

  return dbCache.nativeDbs.paid;
}

/**
 * Connect to Secondary (Free) Database connection
 */
export async function connectFreeDB() {
  return await getDatabase('free');
}

/**
 * Connect to Question Bank Database connection
 */
export async function connectQuestionBankDB() {
  return await getDatabase('question-bank');
}

/**
 * Connect to Subjective Database connection
 */
export async function connectSubjectiveDB() {
  return await getDatabase('subjective');
}

export default connectDB;
