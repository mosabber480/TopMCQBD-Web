import { MongoClient, ObjectId } from 'mongodb';

/**
 * Cloudflare Pages Function: /api/db-pages-api
 * Direct Native MongoDB Atlas & D1 Edge Gateway for TopMCQBD Cloudflare Pages
 * (Zero proxy, zero Render, zero Worker dependency)
 */

const CLUSTERS = {
  paid: {
    db: 'TopMCQBD_DB',
    coll: 'db-paid-test',
    name: 'TopMCQBD_DB (Paid Core)',
    envUriKey: 'MONGODB_URI_PAID',
    envDbKey: 'MONGODB_DB_PAID',
    directUri: 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority',
  },
  free: {
    db: 'TopMCQBD_DB_Free',
    coll: 'db-free-test',
    name: 'TopMCQBD_DB_Free (Open Free)',
    envUriKey: 'MONGODB_URI_FREE',
    envDbKey: 'MONGODB_DB_FREE',
    directUri: 'mongodb://mosabber480_db_user:VVcrE9PeIIyVlcKU@ac-rw27hdk-shard-00-00.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-01.pixb7fx.mongodb.net:27017,ac-rw27hdk-shard-00-02.pixb7fx.mongodb.net:27017/TopMCQBD_DB_Free?ssl=true&replicaSet=atlas-bntyny-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority',
  },
  subjective: {
    db: 'TopMCQBD_DB_Subjective',
    coll: 'db-subjective-test',
    name: 'TopMCQBD_DB_Subjective',
    envUriKey: 'MONGODB_URI_SUBJECTIVE',
    envDbKey: 'MONGODB_DB_SUBJECTIVE',
    directUri: 'mongodb://mosabber480_db_user:DyW4KsXEhpcK1Rm2@ac-co47w40-shard-00-00.3ifvd7c.mongodb.net:27017,ac-co47w40-shard-00-01.3ifvd7c.mongodb.net:27017,ac-co47w40-shard-00-02.3ifvd7c.mongodb.net:27017/TopMCQBD_DB_Subjective?ssl=true&replicaSet=atlas-c8bq3l-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:DyW4KsXEhpcK1Rm2@topmcqbd.3ifvd7c.mongodb.net/TopMCQBD_DB_Subjective?retryWrites=true&w=majority&appName=TopMCQBD',
  },
  live_exam: {
    db: 'TopMCQBD_DB_Live_Exam',
    coll: 'db-live-exam-test',
    name: 'TopMCQBD_DB_Live_Exam',
    envUriKey: 'MONGODB_URI_LIVE_EXAM',
    envDbKey: 'MONGODB_DB_LIVE_EXAM',
    directUri: 'mongodb://mosabber480_db_user:UANQIRPoI9Zm3m4f@ac-il8uyoo-shard-00-00.ns1gpls.mongodb.net:27017,ac-il8uyoo-shard-00-01.ns1gpls.mongodb.net:27017,ac-il8uyoo-shard-00-02.ns1gpls.mongodb.net:27017/TopMCQBD_DB_Live_Exam?ssl=true&replicaSet=atlas-e1xhyt-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:UANQIRPoI9Zm3m4f@topmcqbd.ns1gpls.mongodb.net/TopMCQBD_DB_Live_Exam?retryWrites=true&w=majority&appName=TopMCQBD',
  },
  written: {
    db: 'TopMCQBD_DB_written',
    coll: 'db-written-test',
    name: 'TopMCQBD_DB_written',
    envUriKey: 'MONGODB_URI_WRITTEN',
    envDbKey: 'MONGODB_DB_WRITTEN',
    directUri: 'mongodb://mosabber480_db_user:FABv84QMDHSQyeP5@ac-zzyyeyo-shard-00-00.hfivdlt.mongodb.net:27017,ac-zzyyeyo-shard-00-01.hfivdlt.mongodb.net:27017,ac-zzyyeyo-shard-00-02.hfivdlt.mongodb.net:27017/TopMCQBD_DB_written?ssl=true&replicaSet=atlas-afklo6-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:FABv84QMDHSQyeP5@topmcqbd.hfivdlt.mongodb.net/TopMCQBD_DB_written?retryWrites=true&w=majority&appName=TopMCQBD',
  },
  question_bank: {
    db: 'TopMCQBD_DB_Question_Bank',
    coll: 'db-question-bank-test',
    name: 'TopMCQBD_DB_Question_Bank',
    envUriKey: 'MONGODB_URI_QUESTION_BANK',
    envDbKey: 'MONGODB_DB_QUESTION_BANK',
    directUri: 'mongodb://mosabber480_db_user:0lxx4VTglJgoel8E@ac-bkuekcv-shard-00-00.bexo18c.mongodb.net:27017,ac-bkuekcv-shard-00-01.bexo18c.mongodb.net:27017,ac-bkuekcv-shard-00-02.bexo18c.mongodb.net:27017/TopMCQBD_DB_Question_Bank?ssl=true&replicaSet=atlas-2tax1l-shard-0&authSource=admin&retryWrites=true&w=majority',
    srvUri: 'mongodb+srv://mosabber480_db_user:0lxx4VTglJgoel8E@topmcqbd.bexo18c.mongodb.net/TopMCQBD_DB_Question_Bank?retryWrites=true&w=majority&appName=TopMCQBD',
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
  if (env && env[clusterConfig.envDbKey]) {
    return env[clusterConfig.envDbKey];
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
    connectTimeoutMS: 6000,
    serverSelectionTimeoutMS: 6000,
    socketTimeoutMS: 10000,
  };

  if (!isSrv && !isMultiHost) {
    clientOptions.directConnection = true;
  }
  return clientOptions;
}

/**
 * Get connected MongoClient instance with Serverless Edge optimizations
 * Connects directly to replicaSet shards (fastest, zero SRV DNS timeout)
 */
async function getClient(config, env) {
  const customUri = env && env[config.envUriKey];
  const urisToTry = [];

  // 1. Direct replicaSet URI first (bypasses DNS SRV lookup, connecting in ~600ms)
  if (config.directUri) urisToTry.push(config.directUri);
  // 2. Custom environment URI if set
  if (customUri && !urisToTry.includes(customUri)) urisToTry.push(customUri);
  // 3. Fallback SRV URI
  if (config.srvUri && !urisToTry.includes(config.srvUri)) urisToTry.push(config.srvUri);

  let lastError = null;
  for (const uri of urisToTry) {
    try {
      const client = new MongoClient(uri, createClientOptions(uri));
      await client.connect();
      return client;
    } catch (err) {
      lastError = err;
      console.warn(`[Cloudflare Edge db-pages-api] Connection to ${config.name} failed with URI (${uri.substring(0, 30)}...): ${err.message}. Trying next fallback...`);
    }
  }

  throw lastError || new Error(`All connection attempts to ${config.name} failed`);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const clusterParam = url.searchParams.get('cluster') || 'paid';

  if (clusterParam.toLowerCase() === 'd1') {
    const t0 = Date.now();
    try {
      if (!context.env?.DB) {
        throw new Error('D1 database binding DB is not available in context.env');
      }
      const result = await context.env.DB.prepare(
        "SELECT config_key, config_value, updated_at FROM app_configs WHERE config_key = 'db-d1-test'"
      ).first();
      let items = [];
      if (result?.config_value) {
        try {
          items = JSON.parse(result.config_value);
        } catch (e) {
          items = [];
        }
      }
      return jsonResponse({
        success: true,
        cluster: 'topmcqbd-db (Cloudflare D1)',
        database: 'topmcqbd-db',
        collection: 'app_configs',
        connected: true,
        latencyMs: Date.now() - t0,
        totalItems: items.length,
        items,
        collections: ['app_configs'],
        runtime: 'Cloudflare Pages D1 (V8 Isolate)',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return jsonResponse({
        success: false,
        cluster: 'topmcqbd-db (Cloudflare D1)',
        connected: false,
        error: err.message,
        latencyMs: Date.now() - t0,
        items: [],
      }, 500);
    }
  }

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
  const url = new URL(context.request.url);
  const clusterParam = url.searchParams.get('cluster') || 'paid';
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
  const url = new URL(context.request.url);
  const clusterParam = url.searchParams.get('cluster') || 'paid';
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  let client;
  try {
    const body = await context.request.json().catch(() => ({}));
    const id = body.id || body._id;
    const text = (body.text || '').trim();

    if (!id || !text) {
      return jsonResponse({ success: false, error: 'ID এবং টেক্সট উভয়েই আবশ্যক।' }, 400);
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
  const url = new URL(context.request.url);
  const clusterParam = url.searchParams.get('cluster') || 'paid';
  const config = resolveCluster(clusterParam);
  const dbName = getTargetDb(config, context.env);

  let client;
  try {
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
