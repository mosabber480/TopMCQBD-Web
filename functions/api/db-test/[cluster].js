import { MongoClient, ObjectId } from 'mongodb';

/**
 * Cloudflare Pages Function: /api/db-test/[cluster]
 * Direct Native MongoDB Atlas Edge Connection for Cloudflare Pages
 * (Zero proxy, zero Render, zero Worker dependency)
 */

const CLUSTERS = {
  paid: {
    db: 'TopMCQBD_DB',
    coll: 'db-paid-test',
    name: 'TopMCQBD_DB (Paid Core)',
    envUriKey: 'MONGODB_URI_PAID',
    envDbKey: 'MONGODB_DB_PAID',
  },
  free: {
    db: 'TopMCQBD_DB_Free',
    coll: 'db-free-test',
    name: 'TopMCQBD_DB_Free (Open Free)',
    envUriKey: 'MONGODB_URI_FREE',
    envDbKey: 'MONGODB_DB_FREE',
  },
  subjective: {
    db: 'TopMCQBD_DB_Subjective',
    coll: 'db-subjective-test',
    name: 'TopMCQBD_DB_Subjective',
    envUriKey: 'MONGODB_URI_SUBJECTIVE',
    envDbKey: 'MONGODB_DB_SUBJECTIVE',
  },
  live_exam: {
    db: 'TopMCQBD_DB_Live_Exam',
    coll: 'db-live-exam-test',
    name: 'TopMCQBD_DB_Live_Exam',
    envUriKey: 'MONGODB_URI_LIVE_EXAM',
    envDbKey: 'MONGODB_DB_LIVE_EXAM',
  },
  written: {
    db: 'TopMCQBD_DB_written',
    coll: 'db-written-test',
    name: 'TopMCQBD_DB_written',
    envUriKey: 'MONGODB_URI_WRITTEN',
    envDbKey: 'MONGODB_DB_WRITTEN',
  },
  question_bank: {
    db: 'TopMCQBD_DB_Question_Bank',
    coll: 'db-question-bank-test',
    name: 'TopMCQBD_DB_Question_Bank',
    envUriKey: 'MONGODB_URI_QUESTION_BANK',
    envDbKey: 'MONGODB_DB_QUESTION_BANK',
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

function resolveCluster(clusterParam) {
  if (!clusterParam) return CLUSTERS.paid;
  const normalized = String(clusterParam).toLowerCase().replace(/-/g, '_');
  return CLUSTERS[normalized] || CLUSTERS.paid;
}

function getTargetDb(clusterConfig, env) {
  if (env) {
    if (env[clusterConfig.envDbKey]) return env[clusterConfig.envDbKey];
    const altDbKey = `MONGODB_DB_NAME_${clusterConfig.envUriKey.replace('MONGODB_URI_', '')}`;
    if (env[altDbKey] && !env[altDbKey].startsWith('mongodb')) return env[altDbKey];
  }
  return clusterConfig.db;
}

function createClientOptions(uri) {
  const isSrv = uri.startsWith('mongodb+srv://');
  const isMultiHost = uri.includes(',');
  const clientOptions = {
    tls: true,
    family: 4,               // Enforce IPv4 to avoid Edge IPv6 DNS latency
    maxPoolSize: 1,         // Single lightweight socket per Edge isolate
    minPoolSize: 0,         // Clean up idle sockets automatically
    connectTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 12000,
  };

  if (!isSrv && !isMultiHost) {
    clientOptions.directConnection = true;
  }
  return clientOptions;
}

/**
 * Connect to MongoDB strictly using the Cloudflare environment variable.
 * If missing, throws an error and disconnects (zero hardcoded fallback).
 */
async function getClient(config, env) {
  let uri = env && env[config.envUriKey];
  if (!uri && env) {
    const clusterKey = config.envUriKey.replace('MONGODB_URI_', '');
    const altKeys = [`MONGODB_DB_NAME_${clusterKey}`, `MONGODB_DB_${clusterKey}`, 'MONGODB_URI'];
    for (const k of altKeys) {
      const val = env[k];
      if (val && (val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'))) {
        uri = val;
        break;
      }
    }
  }

  if (!uri) {
    throw new Error(`Cloudflare environment variable "${config.envUriKey}" is missing. Connection disconnected.`);
  }

  const client = new MongoClient(uri, createClientOptions(uri));
  await client.connect();
  return client;
}

export async function onRequestGet(context) {
  const clusterParam = context.params?.cluster;
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  const t0 = Date.now();
  let client;
  try {
    client = await getClient(config, context.env);
    const db = client.db(dbName);
    const collection = db.collection(config.coll);

    const pingResult = await db.command({ ping: 1 });
    const latencyMs = Date.now() - t0;

    let collectionNames = [];
    try {
      const collections = await db.listCollections().toArray();
      collectionNames = collections.map((c) => c.name);
    } catch (e) {
      collectionNames = [config.coll];
    }

    const items = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const formattedItems = items.map((doc) => ({
      id: doc._id.toString(),
      text: doc.text || '',
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
    }));

    return jsonResponse({
      success: pingResult.ok === 1 || true,
      cluster: config.name,
      database: dbName,
      collection: config.coll,
      connected: true,
      latencyMs,
      totalItems: formattedItems.length,
      items: formattedItems,
      collections: collectionNames,
      runtime: 'Cloudflare Pages (V8 Isolate)',
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (err) {
    return jsonResponse({
      success: false,
      cluster: config.name,
      database: dbName,
      collection: config.coll,
      connected: false,
      error: err.message || String(err),
      latencyMs: Date.now() - t0,
      totalItems: 0,
      items: [],
      collections: [],
      runtime: 'Cloudflare Pages (V8 Isolate)',
      timestamp: new Date().toISOString(),
    }, 500);
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}

export async function onRequestPost(context) {
  const clusterParam = context.params?.cluster;
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  let client;
  try {
    const body = await context.request.json().catch(() => ({}));
    const text = (body.text || '').trim();

    if (!text) {
      return jsonResponse({ success: false, error: 'টেক্সট ফিল্ড খালি রাখা যাবে না।' }, 400);
    }

    client = await getClient(config, context.env);
    const db = client.db(dbName);
    const collection = db.collection(config.coll);

    const newDoc = {
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const insertResult = await collection.insertOne(newDoc);
    return jsonResponse({
      success: true,
      message: `ডাটা সফলভাবে ${config.coll} কালেকশনে যুক্ত হয়েছে।`,
      item: {
        id: insertResult.insertedId.toString(),
        ...newDoc,
      },
    }, 201);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) }, 500);
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}

export async function onRequestPut(context) {
  const clusterParam = context.params?.cluster;
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  let client;
  try {
    const body = await context.request.json().catch(() => ({}));
    const id = body.id || body._id;
    const text = (body.text || '').trim();

    if (!id || !text) {
      return jsonResponse({ success: false, error: 'ID এবং টেকক্সট উভয়েই আবশ্যক।' }, 400);
    }

    client = await getClient(config, context.env);
    const db = client.db(dbName);
    const collection = db.collection(config.coll);

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const updateResult = await collection.updateOne(filter, {
      $set: {
        text,
        updatedAt: new Date().toISOString(),
      },
    });

    if (updateResult.matchedCount === 0) {
      return jsonResponse({ success: false, error: 'কোনো তথ্য পাওয়া যায়নি।' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'ডাটা সফলভাবে আপডেট করা হয়েছে।',
      updatedId: id,
      text,
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) }, 500);
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}

export async function onRequestDelete(context) {
  const clusterParam = context.params?.cluster;
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  let client;
  try {
    const url = new URL(context.request.url);
    let id = url.searchParams.get('id');
    if (!id) {
      const body = await context.request.json().catch(() => ({}));
      id = body?.id || body?._id;
    }

    if (!id) {
      return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ID প্রদান করুন।' }, 400);
    }

    client = await getClient(config, context.env);
    const db = client.db(dbName);
    const collection = db.collection(config.coll);

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const delResult = await collection.deleteOne(filter);

    if (delResult.deletedCount === 0) {
      return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ডাটা পাওয়া যায়নি।' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।',
      deletedId: id,
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) }, 500);
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}
